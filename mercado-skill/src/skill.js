import puppeteer from 'puppeteer';

const ECS_API_BASE = 'http://115.190.121.30:3000';

export class MercadoLibreListingSkill {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      console.log('🚀 启动本地浏览器...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async scrapeAmazon(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      console.log(   🌐 抓取: ...);
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url.split('?')[0], { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(r => setTimeout(r, 2000));
      
      const info = await page.evaluate(() => {
        let title = '';
        const titleEl = document.querySelector('#productTitle, h1#title');
        if (titleEl) title = titleEl.textContent?.trim() || '';
        
        let desc = '';
        const bullets = document.querySelector('#feature-bullets ul');
        if (bullets) {
          bullets.querySelectorAll('li').forEach(li => desc += (li.textContent?.trim() || '') + ' ');
        }
        
        const images = [];
        document.querySelectorAll('#altImages img').forEach(img => {
          const src = img.src || img.getAttribute('data-src') || '';
          if (src && src.includes('amazon.com/images/I/')) {
            images.push(src.split('._')[0] + '._AC_SX500_SY500_.jpg');
          }
        });
        
        return { title: title || 'Product', description: desc.substring(0, 3000), images: images.slice(0, 20) };
      });
      
      const asin = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1] || 'UNKNOWN';
      return { asin, url, ...info };
      
    } finally {
      await page.close();
    }
  }

  async callECS(product) {
    const res = await fetch(${ECS_API_BASE}/api/generate-listing, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: product.title, description: product.description })
    });
    const data = await res.json();
    return data.data;
  }

  async run(urls) {
    const results = [];
    for (const url of urls) {
      console.log(处理: );
      const product = await this.scrapeAmazon(url);
      const listing = await this.callECS(product);
      results.push({ ...product, listing });
    }
    return { success: true, products: results };
  }

  async cleanup() {
    if (this.browser) { await this.browser.close(); this.browser = null; }
  }
}
