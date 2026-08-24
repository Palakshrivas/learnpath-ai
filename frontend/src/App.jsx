import { useState } from "react";

import LearnerDashboard from "./components/LearnerDashboard";
import MyLearningPath from "./components/MyLearningPath";
import Progress from "./components/Progress";
import SkillGap from "./components/SkillGap";
import Recommendation from "./components/Recommendation";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <>
      {currentPage === "dashboard" && (
        <LearnerDashboard
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === "learning-path" && (
        <MyLearningPath />
      )}

      {currentPage === "progress" && (
        <Progress />
      )}
      {currentPage === "skill-gap" && (
          <SkillGap />
      )}
      {currentPage === "recommendation" && (
          <Recommendation />
      )}
    </>
  );
}

export default App;