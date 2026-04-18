import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CONFIG = {
  api: {
    baseUrl: 'http://115.190.121.30:3000',
    endpoint: '/api/generate-listing',
    timeout: 60000
  },
  browser: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  paths: {
    output: join(__dirname, '../media')
  },
  retry: {
    maxRetries: 3,
    initialDelay: 1000
  }
};
