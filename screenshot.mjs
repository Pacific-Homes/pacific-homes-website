import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotDir = './temporary screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Auto-increment filename
let n = 1;
while (fs.existsSync(path.join(screenshotDir, `screenshot-${n}${label ? '-' + label : ''}.png`))) {
  n++;
}
const filename = `screenshot-${n}${label ? '-' + label : ''}.png`;
const filepath = path.join(screenshotDir, filename);

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2' });
await page.screenshot({ path: filepath, fullPage: true });
await browser.close();

console.log(`Saved: ${filepath}`);
