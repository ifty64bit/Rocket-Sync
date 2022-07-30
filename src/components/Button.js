import React from 'react'

function Button({ text, onClick, type }) {
  if (type==="back") {
    return (
      <button onClick={onClick} className='bg-lime-400 rounded shadow-xl hover:bg-lime-300 transition-colors duration-200'><svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 24 24" stroke="#000000" fill="none" >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <line x1="5" y1="12" x2="19" y2="12" />
      <line x1="5" y1="12" x2="11" y2="18" />
      <line x1="5" y1="12" x2="11" y2="6" />
    </svg></button>
    )
  }
  else if (type === "refresh")
  {
    return (
      <button onClick={onClick} className='bg-lime-400 px-3 py-4 rounded-full shadow-xl hover:bg-lime-300 transition-colors duration-200'><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg></button>
    )
  }
  else {
    return (
      <button onClick={onClick} className='bg-lime-400 px-3 py-4 rounded shadow-xl hover:bg-lime-300 transition-colors duration-200'>{text}</button>
    )
  }
}

export default Button