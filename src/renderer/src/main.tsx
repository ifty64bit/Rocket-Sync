import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import "./assets/index.css";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </StrictMode>,
);
