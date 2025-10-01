import { ClientOptions } from 'whatsapp-web.js';
import { env } from './env';

export const whatsappConfig: ClientOptions = {
  authStrategy: undefined, // Será definido no serviço
  puppeteer: {
    headless: env.puppeteerHeadless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  },
  qrMaxRetries: 5,
};

export const sessionConfig = {
  sessionPath: env.sessionPath,
  sessionName: env.sessionName,
};
