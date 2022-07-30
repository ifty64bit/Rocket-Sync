import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button';

function Home() {
  const [phoneinfo, setPhoneinfo] = useState("");

  const getPhoneInfo = async () => {
    let info = await window.signal.getDevices(`shell getprop ro.product.bootimage.marketname`);
    setPhoneinfo(info);
  }

  useEffect(() => {
    
    getPhoneInfo();
  },[])

  return (
    <>
      <div className="flex flex-col gap-5 h-screen w-screen justify-center items-center">
        <Link to="computer2phone">
          <Button text="Copy Computer To Phone" />
        </Link>
        <Link to="phone2computer">
          <Button text="Copy Phone To Computer" />
        </Link>
        <p>{phoneinfo}</p>
        <Button type="refresh" onClick={ getPhoneInfo } />
      </div>
    </>
  );
}

export default Home;