import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
await page.evaluate(() => document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible')));
await new Promise(r => setTimeout(r, 600));

for (const [id, label] of [['services','services'],['duplex','duplex-top'],['portfolio','portfolio']]) {
  const el = await page.$(`#${id}`);
  if (!el) { console.log('MISSING:', id); continue; }
  await el.scrollIntoView();
  await new Promise(r => setTimeout(r, 300));
  await el.screenshot({ path: `./temporary screenshots/verify-${label}.png` });
  console.log('saved', label);
}
await browser.close();
