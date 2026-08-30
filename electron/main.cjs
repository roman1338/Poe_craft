const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let ahkProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    title: "PoE Alt/Aug Auto-Crafter",
    backgroundColor: "#1e1e24",
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Remove default menu bar
  mainWindow.setMenu(null);

  // In production, load the built index.html from dist.
  // In development, load from the Vite dev server.
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    stopAhkScript();
    mainWindow = null;
  });
}

function startAhkScript(scriptContent) {
  stopAhkScript();

  try {
    const tempDir = app.getPath('temp');
    const scriptPath = path.join(tempDir, 'poe_crafter_active.ahk');
    
    // Write temporary AHK script
    fs.writeFileSync(scriptPath, scriptContent, 'utf8');
    logToRenderer(`[Electron] Active script saved to temporary path: ${scriptPath}`);

    // Resolve AutoHotkey executable path
    let ahkPath = 'AutoHotkey.exe'; // Default to system PATH

    // Check for bundled AutoHotkey in extraResources
    const bundledPath = path.join(process.resourcesPath, 'bin', 'AutoHotkey.exe');
    if (fs.existsSync(bundledPath)) {
      ahkPath = bundledPath;
      logToRenderer(`[Electron] Using bundled AutoHotkey interpreter: ${ahkPath}`);
    } else {
      // Also check local dev workspace
      const localDevPath = path.join(__dirname, '../bin/AutoHotkey.exe');
      if (fs.existsSync(localDevPath)) {
        ahkPath = localDevPath;
        logToRenderer(`[Electron] Using workspace AutoHotkey interpreter: ${ahkPath}`);
      } else {
        logToRenderer(`[Electron] Bundled interpreter not found. Attempting to use system-installed AutoHotkey.`);
      }
    }

    logToRenderer(`[Electron] Spawning AHK process...`);
    ahkProcess = spawn(ahkPath, [scriptPath]);

    ahkProcess.stdout?.on('data', (data) => {
      logToRenderer(`[AHK Stdout] ${data.toString().trim()}`);
    });

    ahkProcess.stderr?.on('data', (data) => {
      logToRenderer(`[AHK Stderr] ${data.toString().trim()}`, 'error');
    });

    ahkProcess.on('close', (code) => {
      logToRenderer(`[Electron] AHK process exited with code ${code}`);
      ahkProcess = null;
      mainWindow?.webContents.send('status-change', false);
    });

    mainWindow?.webContents.send('status-change', true);
  } catch (err) {
    logToRenderer(`[Electron Error] Failed to start AHK: ${err.message}`, 'error');
    mainWindow?.webContents.send('status-change', false);
  }
}

function stopAhkScript() {
  if (ahkProcess) {
    logToRenderer(`[Electron] Terminating active AHK process...`);
    try {
      ahkProcess.kill();
    } catch (e) {
      logToRenderer(`[Electron] Error killing process: ${e.message}`, 'error');
    }
    ahkProcess = null;
  }
  mainWindow?.webContents.send('status-change', false);
}

function logToRenderer(message, type = 'info') {
  console.log(message);
  mainWindow?.webContents.send('log-message', { message, type });
}

// IPC Receivers
ipcMain.on('start-craft', (event, scriptContent) => {
  startAhkScript(scriptContent);
});

ipcMain.on('stop-craft', () => {
  stopAhkScript();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopAhkScript();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
