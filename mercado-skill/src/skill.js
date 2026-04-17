import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';

export class MercadoLibreListingSkill {
  constructor() { this.browser = null; }
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    }
    return this.browser;
  }
  async scrapeProduct(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    try {
      await page.goto(url.split('?')[0], { waitUntil: 'networkidle2', timeout: 45000 });
      const info = await page.evaluate(() => {
        const title = document.querySelector('#productTitle')?.textContent?.trim() || 'Product';
        return { title };
      });
      const asin = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1] || 'UNKNOWN';
      return { asin, title: info.title, url };
    } finally { await page.close(); }
  }
  async generateListing(product) {
    try {
      const res = await fetch(`${CONFIG.api.baseUrl}${CONFIG.api.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: product.title, description: '' })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { title_es: product.title, title_pt: product.title };
  }
  async generateExcel(products) {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('导入产品模板');
    ws.addRow(['父SKU', 'SKU', 'ES标题', 'PT标题']);
    for (const p of products) {
      ws.addRow([`PARENT-${p.asin}`, `SKU-${p.asin}`, p.listing?.title_es || '', p.listing?.title_pt || '']);
    }
    if (!fs.existsSync(CONFIG.paths.output)) fs.mkdirSync(CONFIG.paths.output, { recursive: true });
    const fileName = `mercado_${Date.now()}.xlsx`;
    const outputPath = path.join(CONFIG.paths.output, fileName);
    await workbook.xlsx.writeFile(outputPath);
    return { path: outputPath, fileName };
  }
  async run(urls, options = {}) {
    const products = [];
    for (let i = 0; i < urls.length; i++) {
      const product = await this.scrapeProduct(urls[i]);
      const listing = await this.generateListing(product);
      products.push({ ...product, listing });
      await new Promise(r => setTimeout(r, options.delay || 2000));
    }
    return { success: true, products, excel: await this.generateExcel(products) };
  }
  async cleanup() { if (this.browser) { await this.browser.close(); this.browser = null; } }
}
