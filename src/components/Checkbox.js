import React from 'react'

function Checkbox({ setFiles, value }) {
    const handelChange = () => {
        setFiles((preState) => {
            return preState.map((p) => {
              if (p.path === value.path) return { ...p, selected: !value.selected };
              return p;
            });
          });
    }
  return (
      <input onChange={handelChange} type={"checkbox"} checked={value.selected? "checked": ""} />
  )
}

export default Checkbox