const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow, backendProcess, tray;
const isDev = !app.isPackaged;
const PORT = 3001;

function startBackend() {
  if (isDev) {
    console.log('[Electron] Running in dev mode: backend should run concurrently.');
    return;
  }
  console.log('[Electron] Production backend is hosted on Render, skipping local spawn.');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 1024, minHeight: 600,
    backgroundColor: '#0f172a',
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const url = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../frontend-legacy/dist/index.html')}`;

  mainWindow.loadURL(url);
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Electron Console] ${message}`);
  });
  mainWindow.on('close', e => { if (!app.isQuiting) { e.preventDefault(); mainWindow.hide(); } });
}

function createTray() {
  // Try to create tray, fallback if icon is missing initially during build/dev steps
  try {
    tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
    tray.setToolTip('VirtualNest HRMS');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open', click: () => mainWindow?.show() },
      { type: 'separator' },
      { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } }
    ]));
    tray.on('double-click', () => mainWindow?.show());
  } catch (error) {
    console.error('Failed to create Tray icon: ', error);
  }
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(() => { createWindow(); createTray(); }, 2000);
});

app.on('before-quit', () => { app.isQuiting = true; backendProcess?.kill(); });
app.on('window-all-closed', () => {}); // Keep alive in tray

ipcMain.handle('get-app-version', () => app.getVersion());
