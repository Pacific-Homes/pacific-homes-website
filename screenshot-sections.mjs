import puppeteer from './node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  document.getElementById('nav').classList.add('scrolled');
});
await new Promise(r => setTimeout(r, 800));

const ids = ['hero', 'trust-strip', 'services', 'custom-homes', 'laneway', 'duplex', 'stats', 'why', 'process', 'testimonials', 'gallery', 'contact', 'footer'];

for (const id of ids) {
  const el = await page.$(`[id="${id}"]`);
  if (!el) { console.log('not found:', id); continue; }
  const box = await el.boundingBox();
  if (!box) continue;
  await page.screenshot({
    path: `temporary screenshots/sec-${id}.png`,
    clip: { x: 0, y: box.y, width: 1440, height: Math.min(box.height, 1200) }
  });
  console.log('saved:', id, Math.round(box.height) + 'px');
}

await browser.close();
