import puppeteer from 'puppeteer-core';
import fs from 'fs';

// Creates a transparent-bg version of Logo-02 (cream shapes, gold accent)
// for seamless use on the dark nav / footer

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.goto('about:blank');

const base64 = fs.readFileSync('./brand_assets/pacific homes logos new/Pacific Homes Logo-02.png').toString('base64');

const result = await page.evaluate(async (dataUrl) => {
  function rgbToHsl(r, g, b) {
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
    let h=0, s=0, l=(max+min)/2;
    if (d) {
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=((g-b)/d+(g<b?6:0))/6; break;
        case g: h=((b-r)/d+2)/6; break;
        case b: h=((r-g)/d+4)/6; break;
      }
    }
    return [h*360, s*100, l*100];
  }

  // Brand colours
  const CREAM    = [250,248,245];
  const CHARCOAL = [28,28,28];
  const GOLD     = [201,169,110];

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0,0,c.width,c.height);
      const d = id.data;

      for (let i = 0; i < d.length; i += 4) {
        const r=d[i], g=d[i+1], b=d[i+2];
        const [h, s, l] = rgbToHsl(r, g, b);
        const blue = h >= 183 && h <= 236;

        // White text → cream, fully opaque
        if (s < 8 && l > 85) {
          d[i]=CREAM[0]; d[i+1]=CREAM[1]; d[i+2]=CREAM[2]; d[i+3]=255;
          continue;
        }

        // Non-blue (dark bg) → transparent
        if (!blue) {
          d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=0;
          continue;
        }

        // Deep bg → transparent
        if (l < 17) {
          d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=0;
          continue;
        }

        // BG→shape transition (AA edge via alpha)
        if (l < 22) {
          const a = Math.round(((l-17)/5) * 255);
          d[i]=CREAM[0]; d[i+1]=CREAM[1]; d[i+2]=CREAM[2]; d[i+3]=a;
          continue;
        }

        // Big blocks → flat cream, opaque
        if (l <= 50) {
          if (l < 46) {
            d[i]=CREAM[0]; d[i+1]=CREAM[1]; d[i+2]=CREAM[2]; d[i+3]=255;
          } else {
            // Top edge: fade alpha slightly
            const a = Math.round((1 - (l-46)/4 * 0.5) * 255);
            d[i]=CREAM[0]; d[i+1]=CREAM[1]; d[i+2]=CREAM[2]; d[i+3]=a;
          }
          continue;
        }

        // Small "P" accent → gold
        if (s >= 22) {
          if (l < 76) {
            d[i]=GOLD[0]; d[i+1]=GOLD[1]; d[i+2]=GOLD[2]; d[i+3]=255;
          } else if (l < 86) {
            const a = Math.round((1-(l-76)/10) * 255);
            d[i]=GOLD[0]; d[i+1]=GOLD[1]; d[i+2]=GOLD[2]; d[i+3]=a;
          } else {
            d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=0;
          }
          continue;
        }

        // Anything else → transparent
        d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=0;
      }

      ctx.putImageData(id,0,0);

      // Auto-crop to bounding box of non-transparent pixels + small margin
      const margin = 18;
      let minX=c.width, maxX=0, minY=c.height, maxY=0;
      for (let y=0; y<c.height; y++) {
        for (let x=0; x<c.width; x++) {
          const idx = (y*c.width+x)*4;
          if (id.data[idx+3] > 10) {
            if (x<minX) minX=x; if (x>maxX) maxX=x;
            if (y<minY) minY=y; if (y>maxY) maxY=y;
          }
        }
      }
      minX=Math.max(0,minX-margin); maxX=Math.min(c.width-1,maxX+margin);
      minY=Math.max(0,minY-margin); maxY=Math.min(c.height-1,maxY+margin);

      const crop = document.createElement('canvas');
      crop.width  = maxX-minX+1;
      crop.height = maxY-minY+1;
      crop.getContext('2d').drawImage(c, minX, minY, crop.width, crop.height, 0, 0, crop.width, crop.height);
      resolve(crop.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}, `data:image/png;base64,${base64}`);

const out = './brand_assets/pacific homes logos website/nav-logo.png';
fs.writeFileSync(out, Buffer.from(result.replace(/^data:image\/png;base64,/,''), 'base64'));
console.log('Saved:', out);

await browser.close();
