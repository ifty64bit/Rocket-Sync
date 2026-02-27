import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Computer2Phone from "./pages/Computer2Phone";
import Phone2Computer from "./pages/Phone2Computer";
import AppToaster from "./components/Toaster";

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-primary-500/30 selection:text-primary-200">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/computer2phone" element={<Computer2Phone />} />
        <Route path="/phone2computer" element={<Phone2Computer />} />
      </Routes>
      <AppToaster />
    </div>
  );
}

export default App;
