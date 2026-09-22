export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/mta/')) {
      const upstream = new URL('https://tmmhxqgzelgrsrxbbfzh.supabase.co/functions/v1/mta-api');
      upstream.pathname += url.pathname.slice('/api/mta'.length);
      upstream.search = url.search;
      return fetch(new Request(upstream.toString(), { method: request.method, headers: request.headers, body: ['GET','HEAD'].includes(request.method) ? undefined : request.body }));
    }
    if (url.pathname === '/api/health') return Response.json({
      ok:true, app:'MTA DETENI', runtime:'cloudflare-static-adapter', preview:'operational-v16',
      dataMode:'SYNTHETIC_ONLY', database:'SUPABASE_PRODUCTION_SCHEMA_READY_RLS_DENY_DEFAULT',
      storage:'PRIVATE_BUCKET_READY', ai:'OFF', migrationFreeze:true,
      productionAccessAuthorized:false, livePostgresqlExecution:false, realDetaineeDataAllowed:false,
      externalTransportAllowed:false, durablePublicationAllowed:false,
      capabilities:['dashboard','detainee','placement','movement','leave','documents','audit','operational-monitor','qr-center','scan-center','operational-queue','room-ops','leave-qr','camera-scan','camera-qr-v2','reports','admin-settings','master-block','master-room','master-operational-catalogs','room-transfer-master','master-room-contract-v10','responsive-left-nav','collapsible-nav','desktop-shell-v2','responsive-hardening-v12','offline-shell-v2','durable-offline-queue','lan-ready-shell','qr-offline-cache','adaptive-mobile-scanner','mobile-tablet-shell-v2','mobile-bottom-nav','mobile-central-qr-scan'],
      timestamp:new Date().toISOString()
    });
    if (url.pathname === '/api/runtime') return Response.json({
      mode:'SYNTHETIC_RUNTIME_DIAGNOSTIC', persistence:'BROWSER_LOCAL_STORAGE+INDEXED_DB_QUEUE',
      nextAdapter:'SUPABASE_PRODUCTION_AUTH_RBAC', authorization:'BLOCKED_UNTIL_AUTH_RBAC',
      productionDatabase:'SCHEMA_READY_RLS_DENY_DEFAULT', productionStorage:'PRIVATE_BUCKET_READY', ai:'OFF',
      audit:'SYNTHETIC_EVENT_LEDGER', migrationFreeze:true, productionAccessAuthorized:false,
      livePostgresqlExecution:false, previewVersion:'v16', masterRoomContract:'v10',
      responsiveNav:'DESKTOP_LEFT_VERTICAL_COLLAPSIBLE__MOBILE_BOTTOM_NAV', responsiveHardening:'v12',
      desktopShell:'v2', offlineShell:'SERVICE_WORKER_V2', offlineQueue:'INDEXED_DB',
      qrRuntime:'LOCAL_ENCODER_CACHED', cameraScanner:'HTML5_QR_CODE_V2_ADAPTIVE',
      mobileShell:'V2', mobileQrDock:'CENTRAL_LARGE_ACTION'
    });
    const response=await env.ASSETS.fetch(request);
    const contentType=response.headers.get('content-type')||'';
    if(request.method==='GET'&&contentType.includes('text/html')) return new HTMLRewriter().on('body',{element(element){
      element.append('<script src="/offline-v1.js?v=2"></script><script src="/offline-queue-v1.js?v=1"></script><script src="/qr-camera-v2.js?v=4"></script><script src="/qr-context-v1.js?v=1"></script><script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script><script src="/preview-v5.js"></script><script src="/preview-v6.js"></script><script src="/qr-print-clean-v3.js?v=3"></script><script src="/room-ops-v9.js?v=9"></script><script src="/movement-v9.js?v=9"></script><script src="/admin-settings-v9.js?v=9"></script><script src="/master-room-guard-v10.js?v=10"></script><script src="/preview-v10.js?v=10"></script><script src="/desktop-shell-v2.js?v=2"></script><script src="/mobile-shell-v1.js?v=2"></script>',{html:true});
    }}).transform(response);
    return response;
  }
};
