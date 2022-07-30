import { useState, useEffect } from "react";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import { useNavigate } from 'react-router-dom';

function Computer2Phone() {
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState("");
  const [selectAll, setSelectAll] = useState(true); //Checkbox Button State
  const navigate = useNavigate();

  useEffect(() => {
    //skip first run
    if (path==="") {
      return;
    }
    const updatePath = async () => {
    //entries var will conatin the list of file and folder name
    let entries = await window.signal.getAllinPath(path);
    entries.pop();
    entries = entries.map((e) => {
      return { path: e, state: "pending", selected: true };
    });
    setFiles(entries);
    }
    //Invoke Function
    updatePath();
  }, [path]);
  
  const updateAllSelected = () => {
    //let _files = files.map(f => f.selected = selectAll?false:true);
    let _files = [...files];
        setFiles(
          _files.map((file) => {
            return { ...file, selected: selectAll ? false : true };
          })
        );
        setSelectAll(!selectAll);
  }

  const openFolder = async () => {
    //Path Var will contain absolute path of folder
    const result = await window.signal.openFolder();
    setPath(result)
  };

  const sendFile = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].selected) {
        setFiles((preState) => {
          const oldState = [...preState];
          return oldState.map((p) => {
            if (p.path === files[i].path) return { ...p, state: "moving" };
            return p;
          });
        });

        let result = await window.signal.sendFile({ path: path, fileName: files[i].path });
        console.log(result);

        if (result.includes("0 skipped")) {
          setFiles((preState) => {
            const oldState = [...preState];
            return oldState.map((p) => {
              if (p.path === files[i].path)
                return { ...p, state: "transfared" };
              return p;
            });
          });
        } else {
          setFiles((preState) => {
            const oldState = [...preState];
            return oldState.map((p) => {
              if (p.path === files[i].path) return { ...p, state: "failed" };
              return p;
            });
          });
        }
      }
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="text-xl my-4">Computer To Phone</div>
      <div><Button onClick={() => navigate(-1)} type={"back"}/></div>
      <div className="bg-zinc-100 my-3 shadow-md">
        {Boolean(files.length) && (
          <div>Select ALL <input type={'checkbox'} checked={selectAll ? "checked" : ""} onChange={updateAllSelected} /></div>
        )}
        <ul>
          {files.map((f, index) => {
            return (
              <li
                className={`py-1 px-2 flex justify-between items-center ${
                  f.state === "transfared" ? "bg-green-400" : ""
                } ${f.state === "moving" ? "bg-yellow-animation" : ""} ${
                  f.state === "failed" ? "bg-red-500" : ""
                }`}
                key={index}
              >
                <span>
                  {" "}
                  [{index + 1}] <Checkbox setFiles={setFiles} value={f} />{" "}
                </span>{" "}
                {f.path.split("/").pop()}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={openFolder} text="Select Folder" />
        {Boolean(files.length) && (
          <Button onClick={sendFile} text="Copy File To Phone" />
        )}
        {Boolean(files.length) && (
          <Button onClick={() => setFiles([])} text="Clear File" />
        )}
      </div>
    </div>
  );
}

export default Computer2Phone;
