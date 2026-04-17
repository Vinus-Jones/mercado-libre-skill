import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
export const CONFIG = {
  api: { baseUrl: 'https://5t322g252y.coze.site/api', endpoint: '/generate-listing-manual', timeout: 60000 },
  browser: { headless: 'new', args: ['--no-sandbox'] },
  paths: { output: join(__dirname, '../media') },
  retry: { maxRetries: 3, initialDelay: 1000 }
};
