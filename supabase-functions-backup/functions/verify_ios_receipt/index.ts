const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";
const REMOVE_ADS_PRODUCT_ID = "com.sidewayz8.puper.ads";
const APPLE_TIMEOUT_MS = 10_000;
const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const PRODUCT_LABELS: Record<string, string> = {
  [REMOVE_ADS_PRODUCT_ID]: "Remove Ads",
};

type DenoLike = {
  serve?: (handler: (req: Request) => Response | Promise<Response>) => void;
  env?: { get(key: string): string | undefined };
};

type DenoLikeGlobal = typeof globalThis & {
  Deno?: DenoLike;
};

const DENO = (globalThis as DenoLikeGlobal).Deno;
const APP_SHARED_SECRET = DENO?.env?.get("APPLE_SHARED_SECRET") || "";

const APPLE_STATUS_MESSAGES: Record<number, string> = {
  0: "Valid",
  21000: "The App Store could not read the JSON object",
  21002: "The data in the receipt-data property was malformed or the service experienced a temporary issue",
  21003: "The receipt could not be authenticated",
  21004: "The shared secret does not match your account",
  21005: "The receipt server is not currently available",
  21006: "This receipt is valid but the subscription has expired",
  21007: "Sandbox receipt sent to production",
  21008: "Production receipt sent to sandbox",
  21009: "Internal data access error",
  21010: "User account not found or deleted",
};

const SERVER_SIDE_STATUS = new Set([21004, 21005, 21009]);

export type VerifyRequestPayload = {
  receiptData?: string;
  userId?: string;
};

type AppleInApp = {
  product_id?: string;
  expires_date_ms?: string;
  cancellation_date?: string | null;
  transaction_id?: string;
  original_transaction_id?: string;
  purchase_date_ms?: string;
};

type AppleVerifyResponse = {
  status: number;
  environment?: string;
  receipt?: {
    in_app?: AppleInApp[];
  };
  latest_receipt_info?: AppleInApp[];
};

type AppleVerifyRequestBody = {
  "receipt-data": string;
  password: string;
  "exclude-old-transactions": boolean;
};
function collectInApp(response: AppleVerifyResponse): AppleInApp[] {
  return [
    ...(response.receipt?.in_app ?? []),
    ...(response.latest_receipt_info ?? []),
  ];
}

function summarizeRemoveAds(purchases: AppleInApp[]) {
  const relevant = purchases
    .filter((item) => item.product_id === REMOVE_ADS_PRODUCT_ID)
    .sort((a, b) => {
      const aTime = Number(a.purchase_date_ms ?? a.expires_date_ms ?? 0);
      const bTime = Number(b.purchase_date_ms ?? b.expires_date_ms ?? 0);
      return bTime - aTime;
    });

  const latest = relevant[0];
  const expiresDateMs = latest?.expires_date_ms ?? null;
  const expiresAt = expiresDateMs ? Number(expiresDateMs) : null;
  const now = Date.now();
  const isExpired = expiresAt ? now > expiresAt : false;
  const hasRemoveAds = Boolean(latest && !latest.cancellation_date && !isExpired);

  return {
    hasRemoveAds,
    latestTransactionId: latest?.transaction_id ?? latest?.original_transaction_id ?? null,
    expiresDateMs,
  };
}
async function callApple(url: string, body: AppleVerifyRequestBody): Promise<AppleVerifyResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), APPLE_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let json: AppleVerifyResponse;
    try {
      json = JSON.parse(text);
    } catch (_error) {
      throw new Error(`Apple verifyReceipt returned non-JSON payload: ${text.slice(0, 200)}`);
    }

    if (!res.ok) {
      throw new Error(`Apple verifyReceipt HTTP ${res.status}: ${text}`);
    }

    return json;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Apple verifyReceipt request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyWithApple(receiptData: string) {
  const baseBody: AppleVerifyRequestBody = {
    "receipt-data": receiptData,
    password: APP_SHARED_SECRET,
    "exclude-old-transactions": true,
  };

  let environment: "PRODUCTION" | "SANDBOX" = "PRODUCTION";
  let response = await callApple(APPLE_PRODUCTION_URL, baseBody);

  if (response.status === 21007) {
    environment = "SANDBOX";
    response = await callApple(APPLE_SANDBOX_URL, baseBody);
  }

  return { response, environment };
}

if (!DENO?.serve) {
  throw new Error("Deno serve API is unavailable in this runtime.");
}

DENO.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  if (!APP_SHARED_SECRET) {
    console.error("APPLE_SHARED_SECRET not configured");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  let payload: VerifyRequestPayload;
  try {
    payload = await req.json();
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const receiptData = payload.receiptData?.trim();
  if (!receiptData) {
    return new Response(JSON.stringify({ error: "Missing receiptData" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  try {
    const { response, environment } = await verifyWithApple(receiptData);
    const purchases = collectInApp(response);
    const summary = summarizeRemoveAds(purchases);
    const valid = response.status === 0;
    const statusMessage = APPLE_STATUS_MESSAGES[response.status] ?? "Unknown status";
    const httpStatus = valid ? 200 : (SERVER_SIDE_STATUS.has(response.status) ? 500 : 200);

    if (!valid) {
      console.warn("verify_ios_receipt invalid status", {
        status: response.status,
        statusMessage,
      });
    }

    const body = {
      valid,
      status: response.status,
      statusMessage,
      productLabel: PRODUCT_LABELS[REMOVE_ADS_PRODUCT_ID] ?? null,
      environment: response.environment ?? environment,
      hasRemoveAds: summary.hasRemoveAds,
      latestTransactionId: summary.latestTransactionId,
      expiresDateMs: summary.expiresDateMs,
      userId: payload.userId ?? null,
      checkedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(body), {
      status: httpStatus,
      headers: JSON_HEADERS,
    });
  } catch (error) {
    console.error("verify_ios_receipt error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: JSON_HEADERS,
      },
    );
  }
});