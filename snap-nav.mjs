import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--no-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
// Clip just the nav bar
await page.screenshot({
  path: './temporary screenshots/nav-logo-preview.png',
  clip: { x: 0, y: 0, width: 1280, height: 90 }
});
// Also clip the footer logo area
const footerTop = await page.evaluate(() => {
  return document.querySelector('footer').getBoundingClientRect().top + window.scrollY;
});
await page.evaluate(() => document.querySelector('footer').scrollIntoView({ behavior: 'instant' }));
await new Promise(r => setTimeout(r, 400));
const fr = await page.evaluate(() => {
  const el = document.querySelector('footer');
  return { top: el.getBoundingClientRect().top + window.scrollY, height: Math.min(el.offsetHeight, 300) };
});
await page.screenshot({
  path: './temporary screenshots/footer-logo-preview.png',
  clip: { x: 0, y: fr.top, width: 1280, height: fr.height }
});
await browser.close();
console.log('Done');
