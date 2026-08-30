const fs = require('fs');
const path = require('path');
const https = require('https');

const BIN_DIR = path.join(__dirname, '../bin');
const TARGET_PATH = path.join(BIN_DIR, 'AutoHotkey.exe');
const DOWNLOAD_URL = 'https://www.autohotkey.com/download/1.1/AutoHotkeyU64.exe';

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    ensureDirectoryExistence(dest);
    const file = fs.createWriteStream(dest);

    log(`Downloading AutoHotkey runtime from: ${url}...`);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        log(`Following redirect to ${response.headers.location}...`);
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        log(`Successfully downloaded AutoHotkey runtime to: ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // delete partial file
      reject(err);
    });
  });
}

function log(msg) {
  console.log(`[setup-binaries] ${msg}`);
}

async function run() {
  if (fs.existsSync(TARGET_PATH)) {
    log(`AutoHotkey runtime already exists at: ${TARGET_PATH}`);
    return;
  }

  try {
    await downloadFile(DOWNLOAD_URL, TARGET_PATH);
    log('Binary setup completed successfully!');
  } catch (err) {
    console.error(`[setup-binaries ERROR] ${err.message}`);
    process.exit(1);
  }
}

run();
