export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/mta/')) {
      const upstream = new URL('https://tmmhxqgzelgrsrxbbfzh.supabase.co/functions/v1/mta-api');
      upstream.pathname += url.pathname.slice('/api/mta'.length);
      upstream.search = url.search;
      return fetch(new Request(upstream.toString(), {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body
      }));
    }

    if (url.pathname === '/api/health') {
      return Response.json({
        ok: true,
        app: 'MTA DETENI',
        runtime: 'cloudflare-static-adapter',
        preview: 'operational-v16',
        dataMode: 'SYNTHETIC_ONLY',
        database: 'SUPABASE_PRODUCTION_SCHEMA_READY_RLS_DENY_DEFAULT',
        storage: 'PRIVATE_BUCKET_READY',
        ai: 'OFF',
        migrationFreeze: true,
        productionAccessAuthorized: false,
        livePostgresqlExecution: false,
        realDetaineeDataAllowed: false,
        externalTransportAllowed: false,
        durablePublicationAllowed: false,
        capabilities: [
          'dashboard','detainee','placement','movement','leave','documents','audit',
          'operational-monitor','qr-center','scan-center','operational-queue','room-ops',
          'leave-qr','camera-scan','camera-qr-v2','reports','admin-settings','master-block',
          'master-room','master-operational-catalogs','room-transfer-master',
          'master-room-contract-v10','responsive-left-nav','collapsible-nav','desktop-shell-v2',
          'responsive-hardening-v12','offline-shell-v2','durable-offline-queue','lan-ready-shell',
          'qr-offline-cache','adaptive-mobile-scanner','mobile-tablet-shell-v2',
          'mobile-bottom-nav','mobile-central-qr-scan'
        ],
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === '/api/runtime') {
      return Response.json({
        mode: 'SYNTHETIC_RUNTIME_DIAGNOSTIC',
        persistence: 'BROWSER_LOCAL_STORAGE+INDEXED_DB_QUEUE',
        nextAdapter: 'SUPABASE_PRODUCTION_AUTH_RBAC',
        authorization: 'BLOCKED_UNTIL_AUTH_RBAC',
        productionDatabase: 'SCHEMA_READY_RLS_DENY_DEFAULT',
        productionStorage: 'PRIVATE_BUCKET_READY',
        ai: 'OFF',
        audit: 'SYNTHETIC_EVENT_LEDGER',
        migrationFreeze: true,
        productionAccessAuthorized: false,
        livePostgresqlExecution: false,
        previewVersion: 'v16',
        masterRoomContract: 'v10',
        responsiveNav: 'DESKTOP_LEFT_VERTICAL_COLLAPSIBLE__MOBILE_BOTTOM_NAV',
        responsiveHardening: 'v12',
        desktopShell: 'v2',
        offlineShell: 'SERVICE_WORKER_V2',
        offlineQueue: 'INDEXED_DB',
        qrRuntime: 'LOCAL_ENCODER_CACHED',
        cameraScanner: 'HTML5_QR_CODE_V2_ADAPTIVE',
        mobileShell: 'V2',
        mobileQrDock: 'CENTRAL_LARGE_ACTION'
      });
    }

    // Canonical script ownership is now inside index.html + mta-unified-shell-v2.js.
    // The Worker must not inject a second copy of runtime modules after the shell starts.
    // Duplicate post-body injection caused concurrent script initialization/races in browsers.
    return env.ASSETS.fetch(request);
  }
};
