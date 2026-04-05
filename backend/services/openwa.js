// services/openwa.js
const { create, ev } = require('@open-wa/wa-automate');
const path = require('path');
const fs = require('fs');

const SESSION_PATH = path.resolve(process.cwd(), '.openwa_session');

function resolveChromePath() {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
  ];
  return candidates.find(p => fs.existsSync(p));
}

let clientPromise = null;
let clientInstance = null;

async function initClient() {
  if (clientInstance) return clientInstance;
  if (clientPromise) return clientPromise;

  const chromePath = resolveChromePath();
  const useChrome = !!chromePath;

  clientPromise = create({
    sessionId: 'botw',
    multiDevice: true,
    useChrome,
    ...(useChrome ? { executablePath: chromePath } : {}), // solo si existe
    headless: true,
    restartOnCrash: false,
    sessionDataPath: SESSION_PATH,
    deleteSessionDataOnLogout: false,
    cacheEnabled: true,
    qrTimeout: 120,
    authTimeout: 240,
    chromiumArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu',
      '--no-first-run',
      '--disable-infobars',
      '--window-size=1280,800',
      '--proxy-server=direct://',
      '--proxy-bypass-list=*',
      '--lang=es-ES',
    ],
    qrRefreshS: 60,
    logConsole: true,
  })
  .then((client) => {
    clientInstance = client;
    console.log('✅ OpenWA iniciado. (useChrome:', useChrome, ')');
    return clientInstance;
  })
  .catch((err) => {
    clientPromise = null;
    console.error('❌ Error inicializando OpenWA:', err);
    throw err;
  });

  return clientPromise;
}

function getClient() {
  if (!clientInstance) throw new Error('OpenWA aún no está inicializado');
  return clientInstance;
}

module.exports = { initClient, getClient };
