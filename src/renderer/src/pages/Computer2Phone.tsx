import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";

interface FileItem {
  path: string;
  state: "pending" | "moving" | "transfared" | "failed";
  selected: boolean;
  progress?: number;
}

function Computer2Phone() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [path, setPath] = useState<string>("");
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
    if (path === "") return;
    const updatePath = async () => {
      let entries = await window.signal.getAllinPath(path);
      // Some `dir /b` output contains an empty line at the end
      if (entries[entries.length - 1] === "") entries.pop();

      setFiles(
        entries.map((e) => ({ path: e, state: "pending", selected: true })),
      );
    };
    updatePath();
  }, [path]);

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

  const openFolder = async () => {
    const result = await window.signal.openFolder();
    if (result) setPath(result);
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

        let resultRaw = await window.signal.sendFile({
          path: path,
          fileName: files[i].path,
        });

        try {
          let result = JSON.parse(resultRaw);
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
            toast.error(
              `Transfer failed for ${files[i].path.split("\\").pop()}`,
            );
          }
        } catch (e) {
          setFiles((preState) =>
            preState.map((p) =>
              p.path === files[i].path ? { ...p, state: "failed" } : p,
            ),
          );
          failCount++;
          toast.error(`Transfer failed: Unexpected ADB response.`);
        }
      }
    }

    if (successCount > 0 && failCount === 0) {
      toast.success(`Successfully transferred ${successCount} items!`);
    } else if (successCount > 0 && failCount > 0) {
      toast.error(`Transferred ${successCount} items. ${failCount} failed.`);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 glass border-b border-slate-700/50 shadow-md">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(-1)} type="back" />
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Smartphone className="text-primary-400" /> Sending to Phone
          </h1>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-8 overflow-hidden gap-6">
        {/* Controls */}
        <div className="flex gap-4">
          <Button
            onClick={openFolder}
            text={path ? "Change Folder" : "Select Source Folder"}
            type={path ? "secondary" : "primary"}
            className="flex-1"
          />
          {files.length > 0 && (
            <Button
              onClick={sendFile}
              text="Transfer Selected"
              type="send"
              className="flex-1"
            />
          )}
        </div>

        {path && (
          <div className="text-sm font-mono text-slate-400 truncate bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-500 select-none mr-2">Source:</span>
            {path}
          </div>
        )}

        {/* File List */}
        <div className="flex flex-col flex-1 overflow-hidden glass rounded-2xl border border-slate-700/50">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/40">
            <h2 className="font-medium text-slate-300">Files to Transfer</h2>
            {files.length > 0 && (
              <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-slate-400 hover:text-slate-200 transition-colors">
                <span className="uppercase tracking-wider font-semibold">
                  Select All
                </span>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={updateAllSelected}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 accent-primary-500 cursor-pointer"
                />
              </label>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
            {files.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/10">
                <FolderOpen size={48} className="mb-4 text-slate-600" />
                <p>No files selected. Select a source folder.</p>
              </div>
            ) : (
              <AnimatePresence>
                {files.map((f, index) => {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={f.path}
                      className={`
                        relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 overflow-hidden
                        ${f.state === "transfared" ? "bg-emerald-900/20 border-emerald-500/30 border" : ""}
                        ${f.state === "moving" ? "bg-primary-900/30 border-primary-500/50 border shadow-[0_0_15px_rgba(34,197,94,0.2)]" : ""}
                        ${f.state === "failed" ? "bg-red-900/20 border-red-500/30 border" : ""}
                        ${f.state === "pending" ? "bg-slate-800/50 hover:bg-slate-700/50 border-transparent hover:border-slate-600 border" : ""}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            f.state === "transfared"
                              ? "bg-primary-500/20 text-primary-400"
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
                            <Smartphone size={20} />
                          )}
                        </div>
                        <span
                          className={`font-medium ${f.state === "transfared" ? "text-slate-200" : "text-slate-400"}`}
                        >
                          {f.path.split("\\").pop()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {f.state === "moving" && f.progress !== undefined && (
                          <span className="text-xs font-semibold tracking-wider text-primary-400">
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
                            className={`h-full ${f.state === "failed" ? "bg-red-500" : "bg-primary-500"}`}
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

export default Computer2Phone;
