import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// Set this in Supabase → Project Settings → Functions → Secrets
const APP_SHARED_SECRET = Deno.env.get('APPLE_SHARED_SECRET') || '';

const REMOVE_ADS_PRODUCT_ID = 'com.sidewayz8.puper.ads';

async function callApple(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Apple verifyReceipt HTTP ${res.status}`);
  }

  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { receiptData, userId } = await req.json();

    if (!receiptData || typeof receiptData !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing receiptData' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!APP_SHARED_SECRET) {
      console.error('APPLE_SHARED_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = {
      'receipt-data': receiptData,
      password: APP_SHARED_SECRET,
      'exclude-old-transactions': true,
    };

    // 1. Try production first (Apple’s recommendation)
    let appleResponse: any = await callApple(APPLE_PRODUCTION_URL, body);

    // 2. If status 21007, retry with sandbox
    if (appleResponse.status === 21007) {
      appleResponse = await callApple(APPLE_SANDBOX_URL, body);
    }

    const valid = appleResponse.status === 0;
    const receipt = appleResponse.receipt ?? {};
    const inApp: any[] = [
      ...(receipt.in_app ?? []),
      ...(appleResponse.latest_receipt_info ?? []),
    ];

    const hasRemoveAds = inApp.some(
      (item) => item.product_id === REMOVE_ADS_PRODUCT_ID
    );

    return new Response(
      JSON.stringify({
        valid,
        status: appleResponse.status,
        hasRemoveAds,
        userId: userId ?? null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('verify_ios_receipt error', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});