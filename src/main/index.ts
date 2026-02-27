import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { exec, spawn } from "child_process";
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
    return JSON.stringify({ success: true, data: stdout, error: null });
  } catch (error: any) {
    let errMsg = error.message;
    if (errMsg.includes("unauthorized")) {
      errMsg = "UNAUTHORIZED";
    } else if (errMsg.includes("offline")) {
      errMsg = "OFFLINE";
    } else if (errMsg.includes("not found")) {
      errMsg = "TIMEOUT";
    }
    return JSON.stringify({ success: false, data: null, error: errMsg });
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
  async (event, arg: { path: string; fileName: string }) => {
    let fileSizeMB = 0;
    try {
      const { statSync } = require("fs");
      const { join } = require("path");
      const stats = statSync(join(arg.path, arg.fileName));
      fileSizeMB = stats.size / (1024 * 1024);
    } catch (e) {
      // ignore
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      const adbProcess = spawn(getAdbPath(), [
        "push",
        "-p",
        `${arg.path}\\${arg.fileName}`,
        "/sdcard",
      ]);

      let fullStdout = "";
      let fullStderr = "";

      const progressInterval = setInterval(async () => {
        if (fileSizeMB > 0) {
          try {
            // For pushing, we poll the Android filesystem size
            const { stdout: statOut } = await execAsync(
              `"${getAdbPath()}" shell stat -c %s "/sdcard/${arg.fileName}"`,
            );
            const sizeBytes = parseInt(statOut.trim(), 10);
            if (!isNaN(sizeBytes)) {
              const currentMB = sizeBytes / (1024 * 1024);
              const progress = Math.min(
                Math.round((currentMB / fileSizeMB) * 100),
                100,
              );
              const elapsedSec = Math.max((Date.now() - startTime) / 1000, 0.1);
              const speedStr = (currentMB / elapsedSec).toFixed(1) + " MB/s";

              event.sender.send("transfer-progress", {
                fileName: arg.fileName,
                progress: progress,
                speed: speedStr,
              });
            }
          } catch (e) {
            // file might not exist on device yet
          }
        }
      }, 500);

      adbProcess.stdout.on("data", (data) => {
        const text = data.toString();
        fullStdout += text;
      });

      adbProcess.stderr.on("data", (data) => {
        fullStderr += data.toString();
      });

      adbProcess.on("close", (code) => {
        clearInterval(progressInterval);
        if (
          code !== 0 ||
          fullStdout.includes("error") ||
          fullStdout.includes("failed") ||
          fullStderr.includes("error")
        ) {
          const errMsg =
            fullStderr.trim() || fullStdout.trim() || "Unknown Error";
          resolve(
            JSON.stringify({ success: false, data: null, error: errMsg }),
          );
        } else {
          resolve(
            JSON.stringify({ success: true, data: fullStdout, error: null }),
          );
        }
      });
    });
  },
);

ipcMain.handle("get", async (_, arg) => {
  try {
    const { stdout } = await execAsync(`"${getAdbPath()}" ${arg}`);
    return JSON.stringify({ success: true, data: stdout, error: null });
  } catch (error: any) {
    console.error(error);
    let errMsg = error.message;
    if (errMsg.includes("unauthorized")) errMsg = "UNAUTHORIZED";
    else if (errMsg.includes("offline")) errMsg = "OFFLINE";
    else if (errMsg.includes("not found")) errMsg = "TIMEOUT";

    return JSON.stringify({ success: false, data: null, error: errMsg });
  }
});

ipcMain.handle(
  "pullFile",
  async (event, arg: { fileName: string; path: string }) => {
    let fileSizeMB = 0;
    try {
      const { stdout: statOut } = await execAsync(
        `"${getAdbPath()}" shell stat -c %s "/sdcard/${arg.fileName}"`,
      );
      const sizeBytes = parseInt(statOut.trim(), 10);
      if (!isNaN(sizeBytes)) {
        fileSizeMB = sizeBytes / (1024 * 1024);
      }
    } catch (e) {
      // ignore stat fetch error
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      const adbProcess = spawn(getAdbPath(), [
        "pull",
        "-a",
        "-p",
        `sdcard/${arg.fileName}`,
        arg.path,
      ]);

      let fullStdout = "";
      let fullStderr = "";

      const progressInterval = setInterval(() => {
        if (fileSizeMB > 0) {
          try {
            // For pulling, we poll the local filesystem size
            const { statSync } = require("fs");
            const { join } = require("path");
            const stats = statSync(
              join(arg.path, arg.fileName.split("/").pop() || arg.fileName),
            );
            const currentMB = stats.size / (1024 * 1024);
            const progress = Math.min(
              Math.round((currentMB / fileSizeMB) * 100),
              100,
            );
            const elapsedSec = Math.max((Date.now() - startTime) / 1000, 0.1);
            const speedStr = (currentMB / elapsedSec).toFixed(1) + " MB/s";

            event.sender.send("transfer-progress", {
              fileName: arg.fileName,
              progress: progress,
              speed: speedStr,
            });
          } catch (e) {
            // file might not be written on PC yet
          }
        }
      }, 500);

      adbProcess.stdout.on("data", (data) => {
        const text = data.toString();
        fullStdout += text;
      });

      adbProcess.stderr.on("data", (data) => {
        fullStderr += data.toString();
      });

      adbProcess.on("close", (code) => {
        clearInterval(progressInterval);
        if (
          code !== 0 ||
          fullStdout.includes("error") ||
          fullStdout.includes("failed") ||
          fullStderr.includes("error")
        ) {
          const errMsg =
            fullStderr.trim() || fullStdout.trim() || "Unknown Error";
          resolve(
            JSON.stringify({ success: false, data: null, error: errMsg }),
          );
        } else {
          resolve(
            JSON.stringify({ success: true, data: fullStdout, error: null }),
          );
        }
      });
    });
  },
);
