import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HardDriveDownload,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  MonitorDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Checkbox from "../components/Checkbox";
import Button from "../components/Button";

interface FileItem {
  path: string;
  state: "pending" | "moving" | "transfared" | "failed";
  selected: boolean;
  progress?: number;
}

function Phone2Computer() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [savePath, setSavePath] = useState<string>("");
  const [selectAll, setSelectAll] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.signal.onProgress((data) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.path.includes(data.fileName)
            ? { ...f, progress: data.progress }
            : f,
        ),
      );
    });
  }, []);

  useEffect(() => {
    const getFileList = async () => {
      const listRaw = await window.signal.get("shell ls /sdcard");
      try {
        const result = JSON.parse(listRaw);
        if (result.success) {
          const parsedList = result.data
            .split("\r\n")
            .slice(0, -1)
            .filter(Boolean)
            .map((e: string) => ({
              path: e,
              state: "pending" as const,
              selected: true,
            }));
          setFiles(parsedList);
        } else {
          toast.error(
            "Failed to read device files. Did you grant USB permissions?",
          );
        }
      } catch (e: any) {
        toast.error("Unknown error parsing device storage.");
      }
    };
    getFileList();
  }, []);

  const updateFilePath = async () => {
    const folderPath = await window.signal.openFolder();
    if (folderPath) setSavePath(folderPath);
  };

  const updateAllSelected = () => {
    setFiles(files.map((file) => ({ ...file, selected: !selectAll })));
    setSelectAll(!selectAll);
  };

  const toggleFileSelection = (index: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, selected: !file.selected } : file,
      ),
    );
  };

  const sendFile = async () => {
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i].selected) {
        setFiles((preState) =>
          preState.map((p) =>
            p.path === files[i].path ? { ...p, state: "moving" } : p,
          ),
        );
        const resultRaw = await window.signal.pullFile({
          fileName: files[i].path,
          path: savePath ? savePath : "",
        });

        try {
          const result = JSON.parse(resultRaw);
          if (result.success) {
            setFiles((preState) =>
              preState.map((p) =>
                p.path === files[i].path ? { ...p, state: "transfared" } : p,
              ),
            );
            successCount++;
          } else {
            console.error(result.error);
            setFiles((preState) =>
              preState.map((p) =>
                p.path === files[i].path ? { ...p, state: "failed" } : p,
              ),
            );
            failCount++;
            toast.error(`Download failed: ${files[i].path.split("/").pop()}`);
          }
        } catch (e: any) {
          setFiles((preState) =>
            preState.map((p) =>
              p.path === files[i].path ? { ...p, state: "failed" } : p,
            ),
          );
          failCount++;
        }
      }
    }

    if (successCount > 0 && failCount === 0) {
      toast.success(`Successfully downloaded ${successCount} items!`);
    } else if (successCount > 0 && failCount > 0) {
      toast.error(`Downloaded ${successCount} items. ${failCount} failed.`);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 glass border-b border-slate-700/50 shadow-md">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(-1)} type="back" />
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <MonitorDown className="text-emerald-400" /> Receive from Phone
          </h1>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-8 overflow-hidden gap-6">
        {/* Controls */}
        <div className="flex gap-4">
          <Button
            onClick={updateFilePath}
            text={savePath ? "Change Dest Folder" : "Select Dest Folder"}
            type={savePath ? "secondary" : "receive"}
            className="flex-1"
          />
          {files.length > 0 && (
            <Button
              onClick={sendFile}
              disabled={!savePath}
              text="Download Selected"
              type={savePath ? "receive" : "secondary"}
              className={`flex-1 ${!savePath ? "opacity-50" : ""}`}
            />
          )}
        </div>

        {savePath && (
          <div className="text-sm font-mono text-slate-400 truncate bg-slate-800/50 p-3 rounded-lg border border-slate-700 shadow-inner">
            <span className="text-slate-500 select-none mr-2">Saving to:</span>
            {savePath}
          </div>
        )}

        {!savePath && (
          <div className="text-sm text-amber-400/80 bg-amber-900/20 p-3 rounded-lg border border-amber-700/30 flex items-center gap-2">
            Please select a destination folder before downloading.
          </div>
        )}

        {/* File List */}
        <div className="flex flex-col flex-1 overflow-hidden glass rounded-2xl border border-slate-700/50">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/40">
            <h2 className="font-medium text-slate-300 flex items-center gap-2">
              <HardDriveDownload size={18} /> /sdcard contents
            </h2>
            {files.length > 0 && (
              <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-slate-400 hover:text-slate-200 transition-colors">
                <span className="uppercase tracking-wider font-semibold">
                  Select All
                </span>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={updateAllSelected}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 accent-emerald-500 cursor-pointer"
                />
              </label>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
            {files.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/10">
                <Loader2
                  size={48}
                  className="mb-4 text-slate-600 animate-spin"
                />
                <p>Loading files from device...</p>
              </div>
            ) : (
              <AnimatePresence>
                {files.map((f, index) => {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.5) }} // Cap massive list initial stagger
                      key={f.path}
                      className={`
                        flex items-center justify-between p-4 rounded-xl transition-all duration-300
                        ${f.state === "transfared" ? "bg-emerald-900/20 border-emerald-500/30 border" : ""}
                        ${f.state === "moving" ? "bg-emerald-900/30 border-emerald-500/50 border shadow-[0_0_15px_rgba(16,185,129,0.2)]" : ""}
                        ${f.state === "failed" ? "bg-red-900/20 border-red-500/30 border" : ""}
                        ${f.state === "pending" ? "bg-slate-800/50 hover:bg-slate-700/50 border-transparent hover:border-slate-600 border" : ""}
                      `}
                    >
                      <div className="flex items-center gap-4 truncate">
                        <div
                          className={`p-2 rounded-lg ${
                            f.state === "transfared"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : f.state === "failed"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          {f.state === "moving" ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : f.state === "transfared" ? (
                            <ShieldCheck size={20} />
                          ) : f.state === "failed" ? (
                            <ShieldAlert size={20} />
                          ) : (
                            <MonitorDown size={20} />
                          )}
                        </div>
                        <span
                          className={`font-mono text-sm tracking-wide truncate max-w-sm ${f.state === "transfared" ? "text-slate-200" : "text-slate-400"}`}
                          title={f.path}
                        >
                          {f.path.split("/").pop()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {f.state === "moving" && f.progress !== undefined && (
                          <span className="text-xs font-semibold tracking-wider text-emerald-400">
                            {f.progress}%
                          </span>
                        )}
                        <Checkbox
                          checked={f.selected}
                          onChange={() => toggleFileSelection(index)}
                          disabled={f.state === "moving"}
                        />
                      </div>

                      {/* Progress Bar */}
                      {(f.state === "moving" ||
                        f.state === "transfared" ||
                        f.state === "failed") && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800/50">
                          <motion.div
                            className={`h-full ${f.state === "failed" ? "bg-red-500" : "bg-emerald-500"}`}
                            initial={{ width: 0 }}
                            animate={{
                              width:
                                f.state === "transfared"
                                  ? "100%"
                                  : `${f.progress || 0}%`,
                            }}
                            transition={{ ease: "linear", duration: 0.3 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Phone2Computer;
