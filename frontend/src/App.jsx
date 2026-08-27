import { useState } from "react";

import LearnerDashboard from "./components/LearnerDashboard";
import MyLearningPath from "./components/MyLearningPath";
import Progress from "./components/Progress";
import SkillGap from "./components/SkillGap";
import Recommendation from "./components/Recommendation";
import Login from "./components/Login";
import Signup from "./components/Signup";

function getLearnerId() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return payload.learnerId || null;
  } catch (error) {
    console.error("Invalid token");
    return null;
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [learnerId, setLearnerId] = useState(
    getLearnerId()
  );

  const [showSignup, setShowSignup] = useState(false);

  const [currentPage, setCurrentPage] =
    useState("dashboard");

  const handleLogin = () => {
    const id = getLearnerId();

    setLearnerId(id);
    setIsLoggedIn(true);
    setShowSignup(false);
    setCurrentPage("dashboard");
  };

  const handleSignup = () => {
    setShowSignup(false);
  };

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <Signup
          onSignup={handleSignup}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSignup={() => setShowSignup(true)}
      />
    );
  }

  return (
    <>
      {currentPage === "dashboard" && (
        <LearnerDashboard
          onNavigate={setCurrentPage}
          learnerId={learnerId}
        />
      )}

      {currentPage === "learning-path" && (
        <MyLearningPath learnerId={learnerId}
         onBack={() => setCurrentPage("dashboard")} />
      )}

      {currentPage === "progress" && (
        <Progress learnerId={learnerId} 
        onBack={() => setCurrentPage("dashboard")}/>
      )}

      {currentPage === "skill-gap" && (
        <SkillGap learnerId={learnerId} 
        onBack={() => setCurrentPage("dashboard")}/>
      )}

      {currentPage === "recommendation" && (
        <Recommendation learnerId={learnerId} 
        onBack={() => setCurrentPage("dashboard")}/>
      )}
    </>
  );
}

export default App;