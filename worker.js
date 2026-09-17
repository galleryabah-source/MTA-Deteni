export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return Response.json({
        ok: true,
        app: 'MTA DETENI',
        runtime: 'cloudflare-static-adapter',
        preview: 'operational-v6',
        dataMode: 'synthetic-only',
        ai: 'OFF',
        database: 'NOT_CONNECTED',
        migrationFreeze: true,
        capabilities: ['dashboard', 'detainee', 'placement', 'movement', 'leave', 'documents', 'audit', 'operational-monitor', 'qr-center', 'scan-center', 'operational-queue', 'room-ops', 'leave-qr', 'camera-scan', 'reports'],
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === '/api/runtime') {
      return Response.json({
        mode: 'LOCAL_SYNTHETIC',
        persistence: 'BROWSER_LOCAL_STORAGE',
        nextAdapter: 'SUPABASE_CONTROLLED_NONPROD',
        authorization: 'CONTRACT_BOUNDARY',
        audit: 'SYNTHETIC_EVENT_LEDGER',
        previewVersion: 'v6'
      });
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') || '';
    if (request.method === 'GET' && contentType.includes('text/html')) {
      return new HTMLRewriter()
        .on('body', {
          element(element) {
            element.append('<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script><script src="/preview-v5.js"></script><script src="/preview-v6.js"></script><script src="/qr-print-clean-v3.js?v=3"></script>', { html: true });
          }
        })
        .transform(response);
    }
    return response;
  }
};
