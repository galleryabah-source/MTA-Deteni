export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') return Response.json({ok:true,app:'MTA DETENI',runtime:'cloudflare-static-adapter',preview:'operational-v13',dataMode:'synthetic-only',ai:'OFF',database:'NOT_CONNECTED',migrationFreeze:true,capabilities:['dashboard','detainee','placement','movement','leave','documents','audit','operational-monitor','qr-center','scan-center','operational-queue','room-ops','leave-qr','camera-scan','reports','admin-settings','master-block','master-room','master-operational-catalogs','room-transfer-master','master-room-contract-v10','responsive-left-nav','collapsible-nav','responsive-hardening-v11','offline-shell-v2','durable-offline-queue','lan-ready-shell','qr-offline-cache'],timestamp:new Date().toISOString()});
    if (url.pathname === '/api/runtime') return Response.json({mode:'LOCAL_SYNTHETIC',persistence:'BROWSER_LOCAL_STORAGE+INDEXED_DB_QUEUE',nextAdapter:'SUPABASE_CONTROLLED_NONPROD',authorization:'CONTRACT_BOUNDARY',audit:'SYNTHETIC_EVENT_LEDGER',previewVersion:'v13',masterRoomContract:'v10',responsiveNav:'LEFT_VERTICAL_COLLAPSIBLE',responsiveHardening:'v11',offlineShell:'SERVICE_WORKER_V2',offlineQueue:'INDEXED_DB',qrRuntime:'SERVICE_WORKER_CACHED_AFTER_ONLINE_BOOT'});
    const response=await env.ASSETS.fetch(request);
    const contentType=response.headers.get('content-type')||'';
    if(request.method==='GET'&&contentType.includes('text/html')) return new HTMLRewriter().on('body',{element(element){element.append('<script src="/offline-v1.js?v=2"></script><script src="/offline-queue-v1.js?v=1"></script><script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script><script src="/preview-v5.js"></script><script src="/preview-v6.js"></script><script src="/qr-print-clean-v3.js?v=3"></script><script src="/room-ops-v9.js?v=9"></script><script src="/movement-v9.js?v=9"></script><script src="/admin-settings-v9.js?v=9"></script><script src="/master-room-guard-v10.js?v=10"></script><script src="/preview-v10.js?v=10"></script>',{html:true})}}).transform(response);
    return response;
  }
};
