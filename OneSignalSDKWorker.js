// Cloudflare Worker — budget-push (OneSignal version)
// הגדר ב-Settings > Variables & Secrets:
//   ONESIGNAL_APP_ID   — App ID מ-OneSignal Dashboard
//   ONESIGNAL_API_KEY  — REST API Key מ-OneSignal Dashboard > Settings > Keys & IDs

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    let body;
    try { body = await request.json(); }
    catch { return new Response('Bad JSON', { status: 400, headers: cors }); }

    const { title = '💰 תקציב משפחתי', body: msg = 'הוצאה חדשה' } = body;

    // שלח לכל המנויים ב-OneSignal App
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${env.ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: env.ONESIGNAL_APP_ID,
        included_segments: ['All'],   // שלח לכולם
        headings: { he: title, en: title },
        contents: { he: msg, en: msg },
        ttl: 86400,
        priority: 10,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, result }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
};
