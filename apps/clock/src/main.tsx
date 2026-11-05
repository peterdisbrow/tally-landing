import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./modern-look.css";
import "./glass-setup.css";
import "./classic-face.css";

// Glass is the default clock look; ?look=classic (or localStorage "clock-look"="classic") shows the original styling.
const look = new URLSearchParams(location.search).get("look") || localStorage.getItem("clock-look") || import.meta.env.VITE_CLOCK_LOOK;
if (look !== "classic") document.documentElement.dataset.look = "glass";

createRoot(document.getElementById("root")!).render(<App />);
