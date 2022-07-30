import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Home";
import Computer2Phone from "./pages/Computer2Phone";
import Phone2Computer from "./pages/Phone2Computer";
function App() {
  return (
    <>
        <Routes>
          <Route exact path="/" element={<Index />} />
          <Route path="/computer2phone" element={<Computer2Phone />} />
          <Route path="/phone2computer" element={<Phone2Computer />} />
        </Routes>
    </>
  );
}

export default App;
