import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux"
      ? { icon: join(__dirname, "../../build/icon.png") }
      : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.ifty64bit.rocket-sync");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// === IPC Handlers ===

const getAdbPath = () => {
  let adbExePath = "";
  if (is.dev) {
    adbExePath = join(__dirname, "../../resources/adb/adb.exe");
  } else {
    adbExePath = join(process.resourcesPath, "adb/adb.exe");
  }
  console.log(
    `[Diagnostic] Resolved ADB Path: ${adbExePath} | is.dev: ${is.dev} | __dirname: ${__dirname} | resourcesPath: ${process.resourcesPath}`,
  );
  return adbExePath;
};

ipcMain.handle("say-hello", async (_, args) => {
  console.log(args);
  return "Hello From Main Process";
});

ipcMain.handle("getDevices", async (_, arg) => {
  try {
    const { stdout } = await execAsync(`"${getAdbPath()}" ${arg}`);
    return stdout;
  } catch (error: any) {
    return error.message.split(":")[3] || error.message;
  }
});

ipcMain.handle("openFolder", () => {
  const result = dialog.showOpenDialogSync({
    properties: ["openDirectory"],
  });
  return result ? result[0] : "";
});

ipcMain.handle("getAllinPath", async (_, arg) => {
  try {
    const { stdout } = await execAsync(`dir "${arg}" /b`);
    return stdout.split("\r\n").filter(Boolean);
  } catch (error: any) {
    console.error(error);
    return [];
  }
});

ipcMain.handle(
  "sendFile",
  async (_, arg: { path: string; fileName: string }) => {
    try {
      const { stdout } = await execAsync(
        `"${getAdbPath()}" push "${arg.path}\\${arg.fileName}" /sdcard`,
      );
      return stdout;
    } catch (error: any) {
      console.error(error);
      return error.message;
    }
  },
);

ipcMain.handle("get", async (_, arg) => {
  try {
    const { stdout } = await execAsync(`"${getAdbPath()}" ${arg}`);
    return stdout;
  } catch (error: any) {
    console.error(error);
    return error.message;
  }
});

ipcMain.handle(
  "pullFile",
  async (_, arg: { fileName: string; path: string }) => {
    try {
      const { stdout } = await execAsync(
        `"${getAdbPath()}" pull "sdcard/${arg.fileName}" "${arg.path}"`,
      );
      return stdout;
    } catch (error: any) {
      console.error(error);
      return error.message;
    }
  },
);
