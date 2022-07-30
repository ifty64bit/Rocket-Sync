import { useState, useEffect } from 'react'
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

function Phone2Computer() {
    const [files, setfiles] = useState([]);
    const [savePath, setSavePath] = useState([]);
    const [selectAll, setSelectAll] = useState(true); //Checkbox Button State
    const navigate = useNavigate();

    useEffect(() => {
        const getFileList = async () => {
          const list = await window.signal.get('shell ls /sdcard');
          console.log(list);
          setfiles(list.split("\r\n").slice(0, -1).map(e=>Object({ path: e, state: "pending", selected: true })));
        }
        getFileList();
    }, [])

    const updateFilePath = async () => {
      let folderPath = await window.signal.openFolder();
      setSavePath(folderPath);
    };

    const updateAllSelected = () => {
        let _files = [...files];
        setfiles(
          _files.map((file) => {
            return { ...file, selected: selectAll ? false : true };
          })
        );
        setSelectAll(!selectAll);
      }
    
    const sendFile = async () => {
      for (let i = 0; i < files.length; i++) {
        if (files[i].selected) {
          setfiles((preState) => {
            const oldState = [...preState];
            return oldState.map((p) => {
              if (p.path === files[i].path) return { ...p, state: "moving" };
              return p;
            });
          });
          let result = await window.signal.pullFile({ fileName: files[i].path, path: savePath? savePath: '' });

          if (result.includes("0 skipped")) {
            setfiles((preState) => {
              const oldState = [...preState];
              return oldState.map((p) => {
                if (p.path === files[i].path)
                  return { ...p, state: "transfared" };
                return p;
              });
            });
          } else {
            setfiles((preState) => {
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
      <div className="text-xl my-4">Phone To Computer</div>
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
                  [{index + 1}] <Checkbox setFiles={setfiles} value={f} />{" "}
                </span>{" "}
                {f.path.split("/").pop()}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={updateFilePath} text="Select Save Folder" />
        {Boolean(files.length) && (
          <Button onClick={sendFile} text="Copy File To Computer" />
        )}
      </div>
    </div>
  );
}

export default Phone2Computer