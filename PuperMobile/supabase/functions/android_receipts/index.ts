// Supabase Edge Function: android_receipts
// Verifies Google Play purchase tokens for one-time (in-app) products
// Expected POST body: { productId: string, purchaseToken: string, packageName?: string }
// Secrets required: GOOGLE_SERVICE_ACCOUNT_JSON (service account JSON), optional ANDROID_PACKAGE_NAME

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  importPKCS8,
  SignJWT,
} from "https://deno.land/x/jose@v4.14.4/index.ts";

type VerifyRequest = {
  productId?: string;
  purchaseToken?: string;
  packageName?: string;
};

const ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  };
}

function jsonResponse(status: number, body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

async function getAccessTokenFromServiceAccount(saJson: Record<string, any>): Promise<string> {
  const clientEmail: string = saJson.client_email;
  const privateKey: string = saJson.private_key;
  if (!clientEmail || !privateKey) {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON: missing client_email or private_key");
  }

  const now = Math.floor(Date.now() / 1000);
  const iat = now;
  const exp = now + 3600; // 1 hour

  // Import private key for RS256
  const alg = "RS256";
  const pkcs8 = await importPKCS8(privateKey, alg);

  const assertion = await new SignJWT({
    scope: ANDROID_PUBLISHER_SCOPE,
  })
    .setProtectedHeader({ alg, typ: "JWT" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience(GOOGLE_TOKEN_URL)
    .sign(pkcs8);

  const form = new URLSearchParams();
  form.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  form.set("assertion", assertion);

  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Token exchange failed: ${resp.status} ${resp.statusText} ${text}`);
  }
  const data = await resp.json();
  const accessToken = data.access_token as string | undefined;
  if (!accessToken) throw new Error("No access_token in Google OAuth response");
  return accessToken;
}

async function verifyProductPurchase(
  accessToken: string,
  packageName: string,
  productId: string,
  purchaseToken: string,
) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
    packageName,
  )}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const text = await resp.text();
  let json: any = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch (_e) {
    // ignore parse error, keep text for diagnostics
  }

  if (!resp.ok) {
    const errMsg = json?.error?.message || text || resp.statusText;
    return {
      ok: false,
      httpStatus: resp.status,
      error: `Google API error: ${errMsg}`,
      raw: json ?? text,
    };
  }

  // See: https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.products/get
  // purchaseState: 0=purchased, 1=canceled, 2=pending
  const purchaseState = json?.purchaseState;
  const acknowledgementState = json?.acknowledgementState; // 0=yet to be acknowledged, 1=acknowledged
  const orderId = json?.orderId;
  const purchaseTimeMillis = json?.purchaseTimeMillis;

  const valid = purchaseState === 0; // purchased

  return {
    ok: true,
    valid,
    purchaseState,
    acknowledgementState,
    orderId,
    purchaseTimeMillis,
    productId,
    packageName,
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" }, origin);
  }

  let body: VerifyRequest | undefined;
  try {
    body = (await req.json()) as VerifyRequest;
  } catch (_e) {
    return jsonResponse(400, { error: "Invalid JSON body" }, origin);
  }

  const productId = body?.productId?.trim();
  const purchaseToken = body?.purchaseToken?.trim();
  const defaultPackage = Deno.env.get("ANDROID_PACKAGE_NAME")?.trim();
  const packageName = (body?.packageName || defaultPackage || "").trim();

  if (!productId || !purchaseToken || !packageName) {
    return jsonResponse(
      400,
      {
        error:
          "Missing required fields. Provide productId, purchaseToken, and set packageName (or ANDROID_PACKAGE_NAME secret).",
      },
      origin,
    );
  }

  const saRaw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!saRaw) {
    return jsonResponse(500, { error: "GOOGLE_SERVICE_ACCOUNT_JSON secret is not set" }, origin);
  }

  let saJson: Record<string, any>;
  try {
    saJson = JSON.parse(saRaw);
  } catch (_e) {
    return jsonResponse(500, { error: "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON" }, origin);
  }

  try {
    const accessToken = await getAccessTokenFromServiceAccount(saJson);
    const result = await verifyProductPurchase(accessToken, packageName, productId, purchaseToken);
    const status = result.ok ? 200 : 400;
    return jsonResponse(status, result, origin);
  } catch (e) {
    return jsonResponse(500, { error: (e as Error).message }, origin);
  }
});
