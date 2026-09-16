export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return Response.json({
        ok: true,
        app: 'MTA DETENI',
        runtime: 'cloudflare-static-adapter',
        dataMode: 'synthetic-only',
        ai: 'OFF',
        database: 'NOT_CONNECTED',
        migrationFreeze: true,
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === '/api/runtime') {
      return Response.json({
        mode: 'LOCAL_SYNTHETIC',
        persistence: 'BROWSER_LOCAL_STORAGE',
        nextAdapter: 'SUPABASE_CONTROLLED_NONPROD',
        authorization: 'CONTRACT_BOUNDARY',
        audit: 'SYNTHETIC_EVENT_LEDGER'
      });
    }

    return env.ASSETS.fetch(request);
  }
};
