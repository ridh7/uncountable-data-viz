import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { theme } from "./theme.ts";
import { BrowserRouter } from "react-router-dom";

const root = document.documentElement;
Object.entries(theme.colors).forEach(([key, value]) => {
  root.style.setProperty(
    `--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
    value,
  );
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
