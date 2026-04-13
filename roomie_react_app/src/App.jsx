import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Navbar from "@/components/Navbar";
import Signup from "@/pages/Signup";
import NewPlace from "@/pages/NewPlace";
import Rooms from "@/pages/Rooms";
import ChatPage from "@/pages/ChatPage";
import ChatBotPage from "@/pages/ChatBotPage";
import ProfilePage from "@/pages/ProfilePage";
import { Toaster } from "@/components/ui/toaster";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  AUTH_CHANGE_EVENT,
  clearAuthSession,
  getAuthExpiresAt,
} from "@/util/auth";
import MapPage from "./components/Map";

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

const LifestyleProfileWatcher = ({ authUserId, onProfileStatusChange }) => {
  const location = useLocation();

  useEffect(() => {
    if (!authUserId) {
      onProfileStatusChange("idle");
      return;
    }

    let isActive = true;
    onProfileStatusChange("loading");

    const loadUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/users/${authUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) {
          if (isActive) {
            onProfileStatusChange("idle");
          }
          return;
        }

        const userData = await response.json();

        if (!isActive) return;

        const lifestyleProfileId = userData?.lifestyleProfileId;
        const hasLifestyleProfile =
          lifestyleProfileId !== null &&
          lifestyleProfileId !== undefined &&
          lifestyleProfileId !== "" &&
          lifestyleProfileId !== 0 &&
          lifestyleProfileId !== "0";

        onProfileStatusChange(hasLifestyleProfile ? "complete" : "missing");
      } catch (error) {
        console.error("Error fetching user for route guard:", error);
        if (isActive) {
          onProfileStatusChange("idle");
        }
      }
    };

    loadUser();

    return () => {
      isActive = false;
    };
  }, [authUserId, location.pathname, onProfileStatusChange]);

  return null;
};

const HousingWatcher = ({ authUserId, onHousingStatusChange }) => {
  const location = useLocation();

  useEffect(() => {
    if (!authUserId) {
      onHousingStatusChange("idle");
      return;
    }

    let isActive = true;
    onHousingStatusChange("loading");

    const loadHousing = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/housings/user/${authUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) {
          if (isActive) {
            onHousingStatusChange("missing");
          }
          return;
        }

        const housingData = await response.json();

        if (!isActive) return;

        onHousingStatusChange(housingData?.id ? "exists" : "missing");
      } catch (error) {
        console.error("Error fetching housing for route guard:", error);
        if (isActive) {
          onHousingStatusChange("missing");
        }
      }
    };

    loadHousing();

    return () => {
      isActive = false;
    };
  }, [authUserId, location.pathname, onHousingStatusChange]);

  return null;
};

function App() {
  const [authUserId, setAuthUserId] = useState(() =>
    localStorage.getItem("userId"),
  );
  const [profileStatus, setProfileStatus] = useState(() =>
    localStorage.getItem("userId") ? "loading" : "idle",
  );
  const [housingStatus, setHousingStatus] = useState(() =>
    localStorage.getItem("userId") ? "loading" : "idle",
  );

  useEffect(() => {
    const syncAuthUserId = () => {
      const nextUserId = localStorage.getItem("userId");
      setAuthUserId(nextUserId);
      setProfileStatus(nextUserId ? "loading" : "idle");
      setHousingStatus(nextUserId ? "loading" : "idle");
    };

    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthUserId);
    window.addEventListener("storage", syncAuthUserId);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthUserId);
      window.removeEventListener("storage", syncAuthUserId);
    };
  }, []);

  return (
    <BrowserRouter>
      <Toaster />
      <AuthWatcher />
      <LifestyleProfileWatcher
        authUserId={authUserId}
        onProfileStatusChange={setProfileStatus}
      />
      <HousingWatcher
        authUserId={authUserId}
        onHousingStatusChange={setHousingStatus}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/rooms"
          element={
            authUserId && profileStatus === "loading" ? null : authUserId &&
              profileStatus === "missing" ? (
              <Navigate to="/chatbot" replace />
            ) : (
              <Rooms />
            )
          }
        />
        <Route
          path="/login"
          element={
            authUserId ? (
              profileStatus === "loading" ? null : profileStatus !==
                "complete" ? (
                <Navigate to="/chatbot" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/signup"
          element={
            authUserId ? (
              profileStatus === "loading" ? null : profileStatus !==
                "complete" ? (
                <Navigate to="/chatbot" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Signup />
            )
          }
        />
        <Route
          path="/new-place"
          element={
            !authUserId ? (
              <Navigate to="/login" replace />
            ) : profileStatus === "loading" ||
              housingStatus === "loading" ? null : profileStatus ===
              "missing" ? (
              <Navigate to="/chatbot" replace />
            ) : housingStatus === "exists" ? (
              <Navigate to="/" replace />
            ) : (
              <NewPlace />
            )
          }
        />
        <Route
          path="/chat"
          element={
            !authUserId ? (
              <Navigate to="/login" replace />
            ) : profileStatus === "loading" ? null : profileStatus ===
              "missing" ? (
              <Navigate to="/chatbot" replace />
            ) : (
              <ChatPage />
            )
          }
        />
        <Route
          path="/chatbot"
          element={
            !authUserId ? (
              <Navigate to="/login" replace />
            ) : profileStatus === "complete" ? (
              <Navigate to="/" replace />
            ) : (
              <ChatBotPage />
            )
          }
        />
        <Route
          path="/profile"
          element={
            !authUserId ? <Navigate to="/login" replace /> : <ProfilePage />
          }
        />
        <Route
          path="*"
          element={
            authUserId && profileStatus === "missing" ? (
              <Navigate to="/chatbot" replace />
            ) : (
              <Home />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
