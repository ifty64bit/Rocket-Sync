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
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";

interface FileItem {
  path: string;
  state: "pending" | "moving" | "transfared" | "failed";
  selected: boolean;
}

function Computer2Phone() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [path, setPath] = useState<string>("");
  const [selectAll, setSelectAll] = useState(true);
  const navigate = useNavigate();

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

  const openFolder = async () => {
    const result = await window.signal.openFolder();
    if (result) setPath(result);
  };

  const sendFile = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].selected) {
        setFiles((preState) =>
          preState.map((p) =>
            p.path === files[i].path ? { ...p, state: "moving" } : p,
          ),
        );

        let result = await window.signal.sendFile({
          path: path,
          fileName: files[i].path,
        });

        if (
          result &&
          result.includes("0 skipped") &&
          !result.toLowerCase().includes("failed") &&
          !result.toLowerCase().includes("error")
        ) {
          setFiles((preState) =>
            preState.map((p) =>
              p.path === files[i].path ? { ...p, state: "transfared" } : p,
            ),
          );
        } else {
          setFiles((preState) =>
            preState.map((p) =>
              p.path === files[i].path ? { ...p, state: "failed" } : p,
            ),
          );
        }
      }
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
                        flex items-center justify-between p-4 rounded-xl transition-all duration-300
                        ${f.state === "transfared" ? "bg-emerald-900/20 border-emerald-500/30 border" : ""}
                        ${f.state === "moving" ? "bg-primary-900/30 border-primary-500/50 border shadow-[0_0_15px_rgba(34,197,94,0.2)]" : ""}
                        ${f.state === "failed" ? "bg-red-900/20 border-red-500/30 border" : ""}
                        ${f.state === "pending" ? "bg-slate-800/50 hover:bg-slate-700/50 border-transparent hover:border-slate-600 border" : ""}
                      `}
                    >
                      <div className="flex items-center gap-4 truncate">
                        <Checkbox setFiles={setFiles} value={f} />
                        <span
                          className="font-mono text-sm tracking-wide truncate max-w-sm"
                          title={f.path}
                        >
                          {f.path.split("/").pop()}
                        </span>
                      </div>

                      <div className="flex items-center w-10 justify-end">
                        {f.state === "transfared" && (
                          <ShieldCheck className="text-emerald-400" size={24} />
                        )}
                        {f.state === "moving" && (
                          <Loader2
                            className="animate-spin text-primary-400"
                            size={24}
                          />
                        )}
                        {f.state === "failed" && (
                          <ShieldAlert className="text-red-400" size={24} />
                        )}
                        {f.state === "pending" && (
                          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                            Pending
                          </span>
                        )}
                      </div>
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
