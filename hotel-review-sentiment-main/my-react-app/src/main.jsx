import React from "react";
import { createRoot } from "react-dom/client";
import LoginPage from "./LoginPage.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoginPage />
  </React.StrictMode>
);
