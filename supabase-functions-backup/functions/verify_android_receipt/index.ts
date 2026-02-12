import { serve } from "https://deno.land/std@0.212.0/http/server.ts";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

type VerifyPayload = {
  purchaseToken?: string;
  productId?: string;
  packageName?: string;
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const PLAY_SCOPE = "https://www.googleapis.com/auth/androidpublisher";

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemBody = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const binary = atob(pemBody);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return await crypto.subtle.importKey(
    "pkcs8",
    buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
}

async function getAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON secret");
  }
  const creds = JSON.parse(serviceAccountJson);
  const { client_email, private_key } = creds;
  if (!client_email || !private_key) {
    throw new Error("Service account JSON missing client_email/private_key");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: client_email,
    scope: PLAY_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const key = await importPrivateKey(private_key);
  const assertion = await create({ alg: "RS256", typ: "JWT" }, payload, key);

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${assertion}`,
  });

  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(json?.error || "Failed to obtain Google access token");
  }
  if (!json?.access_token) {
    throw new Error("Google token response missing access_token");
  }
  return json.access_token as string;
}

async function verifyWithPlay(payload: Required<VerifyPayload>) {
  const accessToken = await getAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(payload.packageName)}/purchases/products/${encodeURIComponent(payload.productId)}/tokens/${encodeURIComponent(payload.purchaseToken)}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await resp.json();
  if (!resp.ok) {
    const message = json?.error?.message || json?.error || "Play API verification failed";
    return {
      valid: false,
      status: resp.status,
      message,
      raw: json,
    };
  }

  const purchaseState = json?.purchaseState ?? null; // 0 purchased, 1 canceled, 2 pending
  const consumptionState = json?.consumptionState ?? null; // 0 yet to be consumed, 1 consumed
  const acknowledgementState = json?.acknowledgementState ?? null; // 0 pending, 1 acknowledged

  const valid = purchaseState === 0 && acknowledgementState === 1;

  return {
    valid,
    status: purchaseState,
    consumptionState,
    acknowledgementState,
    orderId: json?.orderId ?? null,
    purchaseTimeMillis: json?.purchaseTimeMillis ?? null,
    developerPayload: json?.developerPayload ?? null,
  };
}

serve(async (req) => {
  try {
    const body = (await req.json()) as VerifyPayload;
    if (!body?.purchaseToken || !body?.productId) {
      return new Response(
        JSON.stringify({ error: "purchaseToken and productId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const packageName = body.packageName || Deno.env.get("ANDROID_PACKAGE_NAME");
    if (!packageName) {
      return new Response(
        JSON.stringify({ error: "packageName missing (provide in request or ANDROID_PACKAGE_NAME env)" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await verifyWithPlay({
      purchaseToken: body.purchaseToken,
      productId: body.productId,
      packageName,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("verify_android_receipt error", error);
    return new Response(
      JSON.stringify({ error: error?.message || String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
