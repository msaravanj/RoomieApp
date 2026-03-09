import React, { useEffect, useRef } from "react";
import "./App.css";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Navbar from "@/components/Navbar";
import Signup from "@/pages/Signup";
import NewPlace from "@/pages/NewPlace";
import Rooms from "@/pages/Rooms";
import ChatPage from "@/pages/ChatPage";
import ChatBotPage from "@/pages/ChatBotPage";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { clearAuthSession, getAuthExpiresAt } from "@/util/auth";

const AuthWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    const expiresAt = getAuthExpiresAt();

    if (!expiresAt) return undefined;

    const remainingMs = expiresAt - Date.now();

    if (remainingMs <= 0) {
      clearAuthSession();
      navigate("/login");
      return undefined;
    }

    logoutTimerRef.current = setTimeout(() => {
      clearAuthSession();
      navigate("/login");
    }, remainingMs);

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [navigate, location.key]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <AuthWatcher />
      <div>
        <Navbar />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        {localStorage.getItem("token") ? null : (
          <Route path="/login" element={<Login />} />
        )}
        {localStorage.getItem("token") ? null : (
          <Route path="/signup" element={<Signup />} />
        )}
        {localStorage.getItem("token") && (
          <Route path="/new-place" element={<NewPlace />} />
        )}
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chatbot" element={<ChatBotPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
