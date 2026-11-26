const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1500,
    height: 930,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#07111f",
    title: "RASA Cell",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  window.once("ready-to-show", () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
};

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
