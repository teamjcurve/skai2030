import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminGate from "./components/AdminGate.jsx";

const isAdminRoute = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isAdminRoute ? (
      <AdminGate>
        <AdminDashboard />
      </AdminGate>
    ) : (
      <App />
    )}
  </StrictMode>,
);
