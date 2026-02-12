import { importPKCS8, SignJWT } from "jose";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const ANDROID_PUBLISHER_SCOPE =
  "https://www.googleapis.com/auth/androidpublisher";
const PURCHASE_BASE_URL =
  "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";
const REQUEST_TIMEOUT_MS = 10_000;
const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const PRODUCT_LABELS: Record<string, string> = {
  "com.sidewayz8.puper.ads": "Remove Ads",
};

type DenoLike = {
  serve?: (handler: (req: Request) => Response | Promise<Response>) => void;
  env?: { get(key: string): string | undefined };
};

type DenoLikeGlobal = typeof globalThis & {
  Deno?: DenoLike;
};

const DENO = (globalThis as DenoLikeGlobal).Deno;

type VerifyRequestPayload = {
  productId?: string;
  purchaseToken?: string;
  packageName?: string;
  userId?: string;
};

type ServiceAccountJson = {
  client_email: string;
  private_key: string;
};

type GoogleProductPurchase = {
  orderId?: string;
  purchaseTimeMillis?: string;
  purchaseState?: number;
  acknowledgementState?: number;
  consumptionState?: number;
  kind?: string;
};

type VerifyResponseBody = {
  valid: boolean;
  statusText: string;
  productId: string;
  packageName: string;
  productLabel: string | null;
  purchaseState: number | null;
  acknowledgementState: number | null;
  acknowledgementRequired: boolean;
  orderId: string | null;
  purchaseTimeMillis: string | null;
  consumptionState: number | null;
  googleKind: string | null;
  checkedAt: string;
  userId: string | null;
  googleResponse: GoogleProductPurchase | null;
};

class GoogleApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: unknown,
    message: string,
  ) {
    super(message);
    this.name = "GoogleApiError";
  }
}

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  };
}

function jsonResponse(
  origin: string | null,
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders(origin) },
  });
}

function sanitize(value?: string | null): string {
  return value?.trim() ?? "";
}

function parseServiceAccount(): ServiceAccountJson {
  const raw = sanitize(DENO?.env?.get("GOOGLE_SERVICE_ACCOUNT_JSON"));
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON secret is not set");
  }

  try {
    const parsed = JSON.parse(raw) as ServiceAccountJson;
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is invalid – expected service account JSON",
    );
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken(saJson: ServiceAccountJson): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const alg = "RS256";
  const assertion = await new SignJWT({ scope: ANDROID_PUBLISHER_SCOPE })
    .setProtectedHeader({ alg, typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .setIssuer(saJson.client_email)
    .setSubject(saJson.client_email)
    .setAudience(GOOGLE_TOKEN_URL)
    .sign(await importPKCS8(saJson.private_key, alg));

  const form = new URLSearchParams();
  form.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  form.set("assertion", assertion);

  const resp = await fetchWithTimeout(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const text = await resp.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    // keep raw text for diagnostics
  }

  if (!resp.ok) {
    throw new GoogleApiError(
      resp.status,
      payload,
      `Token exchange failed: ${resp.status} ${resp.statusText}`,
    );
  }

  const accessToken = (payload as { access_token?: string }).access_token;
  if (!accessToken) {
    throw new Error("Google OAuth response missing access_token");
  }

  return accessToken;
}

async function fetchProductPurchase(
  accessToken: string,
  packageName: string,
  productId: string,
  purchaseToken: string,
): Promise<GoogleProductPurchase> {
  const url =
    `${PURCHASE_BASE_URL}/${encodeURIComponent(
      packageName,
    )}/purchases/products/${encodeURIComponent(
      productId,
    )}/tokens/${encodeURIComponent(purchaseToken)}`;

  const resp = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const text = await resp.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    // non-JSON, keep raw for diagnostics
  }

  if (!resp.ok) {
    throw new GoogleApiError(
      resp.status,
      payload,
      `Google purchase lookup failed: ${resp.status} ${resp.statusText}`,
    );
  }

  return payload as GoogleProductPurchase;
}

function buildResponseBody(
  purchase: GoogleProductPurchase | null,
  productId: string,
  packageName: string,
  statusText: string,
  userId: string | null,
): VerifyResponseBody {
  const purchaseState = purchase?.purchaseState ?? null;
  const acknowledgementState = purchase?.acknowledgementState ?? null;
  const valid = purchaseState === 0;
  const productLabel = PRODUCT_LABELS[productId] ?? null;

  return {
    valid,
    statusText: productLabel ? `${statusText} (${productLabel})` : statusText,
    productId,
    packageName,
    productLabel,
    purchaseState,
    acknowledgementState,
    acknowledgementRequired: acknowledgementState === 1,
    orderId: purchase?.orderId ?? null,
    purchaseTimeMillis: purchase?.purchaseTimeMillis ?? null,
    consumptionState: purchase?.consumptionState ?? null,
    googleKind: purchase?.kind ?? null,
    checkedAt: new Date().toISOString(),
    userId,
    googleResponse: purchase,
  };
}

if (!DENO?.serve) {
  throw new Error("Deno serve API is unavailable in this runtime");
}

const DEFAULT_PACKAGE_NAME = sanitize(DENO.env?.get("ANDROID_PACKAGE_NAME"));

DENO.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse(origin, 405, { error: "Method not allowed" });
  }

  let payload: VerifyRequestPayload;
  try {
    payload = (await req.json()) as VerifyRequestPayload;
  } catch {
    return jsonResponse(origin, 400, { error: "Invalid JSON body" });
  }

  const productId = sanitize(payload.productId);
  const purchaseToken = sanitize(payload.purchaseToken);
  const packageName = sanitize(payload.packageName) || DEFAULT_PACKAGE_NAME;

  if (!productId || !purchaseToken || !packageName) {
    return jsonResponse(origin, 400, {
      error:
        "Missing required fields. Provide productId, purchaseToken, and packageName (or configure ANDROID_PACKAGE_NAME).",
    });
  }

  let serviceAccount: ServiceAccountJson;
  try {
    serviceAccount = parseServiceAccount();
  } catch (error) {
    console.error("verify_android_receipt service account error", error);
    return jsonResponse(origin, 500, {
      error:
        error instanceof Error ? error.message : "Invalid service account configuration",
    });
  }

  try {
    const accessToken = await getAccessToken(serviceAccount);
    const purchase = await fetchProductPurchase(
      accessToken,
      packageName,
      productId,
      purchaseToken,
    );
    const body = buildResponseBody(
      purchase,
      productId,
      packageName,
      "Purchase found",
      payload.userId ?? null,
    );
    return jsonResponse(origin, 200, body);
  } catch (error) {
    if (error instanceof GoogleApiError && error.status === 404) {
      const body = buildResponseBody(
        null,
        productId,
        packageName,
        "Purchase not found",
        payload.userId ?? null,
      );
      return jsonResponse(origin, 200, body);
    }

    const status = error instanceof GoogleApiError ? error.status : 500;
    console.error("verify_android_receipt error", {
      message: error instanceof Error ? error.message : String(error),
      status,
      payload: error instanceof GoogleApiError ? error.payload : undefined,
    });

    return jsonResponse(origin, 502, {
      error:
        error instanceof Error
          ? error.message
          : "Unknown Google Play verification error",
      status,
    });
  }
});
