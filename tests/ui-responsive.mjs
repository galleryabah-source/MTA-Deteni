import { chromium } from 'playwright';

const base = process.env.MTA_TEST_URL || 'http://127.0.0.1:4173/index.html';
const widths = [320, 360, 390, 430, 768, 1024, 1440];
const browser = await chromium.launch({headless:true});
const failures=[];
try {
  for (const width of widths) {
    const page = await browser.newPage({viewport:{width,height:800},deviceScaleFactor:1,isMobile:width<768});
    await page.goto(base,{waitUntil:'networkidle'});
    const result = await page.evaluate(()=>({
      width:innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth,
      nav:!!document.querySelector('#nav'),
      main:!!document.querySelector('.main'),
      backup:!!document.querySelector('#backupBtn'),
      metaViewport:!!document.querySelector('meta[name="viewport"]')
    }));
    if(result.scrollWidth>result.clientWidth+1) failures.push(`${width}px horizontal overflow ${result.scrollWidth}>${result.clientWidth}`);
    if(!result.nav||!result.main||!result.backup||!result.metaViewport) failures.push(`${width}px required shell element missing`);
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:800},isMobile:true});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.addScriptTag({url:new URL('/offline-v1.js',base).href});
  await page.waitForTimeout(300);
  const offline = await page.evaluate(async()=>({sw:'serviceWorker' in navigator, registered:!!(await navigator.serviceWorker.getRegistration('/'))}));
  if(!offline.sw||!offline.registered) failures.push('service worker did not register in responsive harness');
  await page.close();
} finally { await browser.close(); }
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`Responsive smoke test PASS: ${widths.length} viewport profiles + offline registration`);
