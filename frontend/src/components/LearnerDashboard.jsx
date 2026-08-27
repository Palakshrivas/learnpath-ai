import { useEffect, useState } from "react";
import "./LearnerDashboard.css";
import LearningMindMap from "./LearningMindMap";

function LearnerDashboard({ onNavigate,learnerId }) {
  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);

  const [learningPath, setLearningPath] = useState([]);
  const [generating, setGenerating] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const [progress, setProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // AI Assistant
  const [showAI, setShowAI] = useState(false);
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);

  const [chat, setChat] = useState([
    {
      sender: "ai",
      text: "Hi! I'm your LearnPath AI assistant. I can help you with your learning path, skills, Java, Spring Boot, React, SQL and career preparation.",
    },
  ]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/learners/${learnerId}`)
      .then((response) => response.json())
      .then((data) => {
        setLearner(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Learner fetch error:", error);
        setLoading(false);
      });

    fetch(`http://localhost:8080/api/recommendations/${learnerId}`)
      .then((response) => response.json())
      .then((data) => {
        setRecommendations(data);
        setLoadingRecommendations(false);
      })
      .catch((error) => {
        console.error("Recommendations error:", error);
        setLoadingRecommendations(false);
      });

    fetch(`http://localhost:8080/api/progress/${learnerId}`)
      .then((response) => response.json())
      .then((data) => {
        setProgress(data);
        setLoadingProgress(false);
      })
      .catch((error) => {
        console.error("Progress error:", error);
        setLoadingProgress(false);
      });
  }, []);

  const generateLearningPath = () => {
    setGenerating(true);

    fetch(`http://localhost:8080/api/learning-path/generate/${learnerId}`)
      .then((response) => response.json())
      .then((data) => {
        setLearningPath(data);
        setGenerating(false);
      })
      .catch((error) => {
        console.error("Learning path error:", error);
        setGenerating(false);
      });
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || aiLoading) return;

    setChat((previous) => [
      ...previous,
      {
        sender: "user",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
    setAiLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/ai/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const data = await response.text();

      setChat((previous) => [
        ...previous,
        {
          sender: "ai",
          text: data,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      setChat((previous) => [
        ...previous,
        {
          sender: "ai",
          text: "I'm unable to connect right now. Please make sure the LearnPath AI backend is running.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };
  const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.reload();
};

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const completedCount = progress.filter(
    (item) => item.completed
  ).length;

  const totalProgressTopics = learningPath.length;

  const progressPercentage =
    totalProgressTopics > 0
      ? Math.round(
          (completedCount / totalProgressTopics) * 100
        )
      : completedCount > 0
      ? 100
      : 0;

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your learning space...
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            <h2>
              LearnPath <span>AI</span>
            </h2>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>

          <div className="sidebar-item active">
            <span>⌂</span>
            Dashboard
          </div>

          <div className="sidebar-item"
             onClick={() => onNavigate("learning-path")}>
            <span>◇</span>
            My Learning Path
          </div>

          <div className="sidebar-item"
            onClick={() => onNavigate("progress")}>
            <span>✓</span>
            Progress
          </div>

          <div className="sidebar-item"
             onClick={() => onNavigate("projects")}>
            <span>◇</span>
            Projects
          </div>
        </div>

        <div className="sidebar-section tools-section">
          <p className="sidebar-label">TOOLS</p>

          <div
            className="sidebar-item"
            onClick={() => setShowAI(true)}
          >
            <span>✦</span>
            AI Assistant
          </div>
          <div
            className="sidebar-item"
            onClick={() => onNavigate("skill-gap")}>
           <span>◇</span>
              Skill Gap Analysis
            </div>
            <div
              className="sidebar-item"
              onClick={() => onNavigate("recommendation")}
>
  <span>✦</span>
  Recommendations
</div>

          <div className="sidebar-item">
            <span>⚙</span>
            Settings
          </div>
        </div>
        <button
  className="logout-button"
  onClick={handleLogout}
>
  ↪ Logout
</button>

        <div className="profile-mini">

          <div className="profile-avatar">
            {learner?.name?.charAt(0)?.toUpperCase() || "P"}
          </div>

          <div>
            <strong>
              {learner?.name || "Learner"}
            </strong>

            <span>Learner</span>
          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <p className="eyebrow">
              YOUR LEARNING SPACE
            </p>

            <h1>
              Welcome back,{" "}
              {learner?.name || "Learner"} 👋
            </h1>

            <p className="subtitle">
              Here's your personalized learning overview.
            </p>

          </div>

          <button
            className="assistant-button"
            onClick={() => setShowAI(true)}
          >
            ✦ &nbsp; Ask AI Assistant
          </button>

        </div>

        {/* ================= CAREER ================= */}

        <section className="career-card">

          <div className="career-icon">
            ◎
          </div>

          <div className="career-content">

            <p className="card-label">
              CURRENT CAREER GOAL
            </p>

            <h2>
              {learner?.careerGoal ||
                "Your Career Goal"}
            </h2>

            <p>
              Your learning path will be personalized
              around this goal.
            </p>

          </div>

          <div className="level-badge">
            {learner?.experienceLevel ||
              "Beginner"}
          </div>

        </section>

        {/* ================= STATS ================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon purple">
              ◈
            </div>

            <div>
              <span>Learning Hours</span>

              <strong>
                {learner?.weeklyLearningHours || 0} hrs
              </strong>

              <small>per week</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue">
              ◷
            </div>

            <div>
              <span>Target Duration</span>

              <strong>
                {learner?.targetDurationMonths || 0}
              </strong>

              <small>months</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>Experience</span>

              <strong>
                {learner?.experienceLevel ||
                  "Beginner"}
              </strong>

              <small>current level</small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              ✦
            </div>

            <div>
              <span>Learning Status</span>

              <strong>
                {learningPath.length > 0
                  ? "Active"
                  : "Ready"}
              </strong>

              <small>
                {learningPath.length > 0
                  ? "path generated"
                  : "path generation"}
              </small>
            </div>

          </div>

        </section>

        {/* ================= SKILLS ================= */}

        <section className="info-grid">

          <div className="info-card">

            <div className="info-card-header">

              <div>
                <h2>Your Skills</h2>

                <p>
                  Skills you've already mentioned.
                </p>
              </div>

              <span>01</span>

            </div>

            <div className="tags">

              {(learner?.currentSkills || "")
                .split(",")
                .filter((skill) => skill.trim())
                .map((skill, index) => (
                  <span
                    className="tag"
                    key={index}
                  >
                    {skill.trim()}
                  </span>
                ))}

            </div>

          </div>

          <div className="info-card">

            <div className="info-card-header">

              <div>
                <h2>Your Interests</h2>

                <p>
                  Topics you're interested in learning.
                </p>
              </div>

              <span>02</span>

            </div>

            <div className="tags">

              {(learner?.interests || "")
                .split(",")
                .filter((interest) => interest.trim())
                .map((interest, index) => (
                  <span
                    className="interest-tag"
                    key={index}
                  >
                    ✦ {interest.trim()}
                  </span>
                ))}

            </div>

          </div>

        </section>

        {/* ================= AI ENGINE ================= */}

        <section className="learning-engine">

          <div className="engine-icon">
            ✦
          </div>

          <div className="engine-content">

            <p className="card-label">
              AI LEARNING ENGINE
            </p>

            <h2>
              Your personalized path is next.
            </h2>

            <p>
              LearnPath AI analyzes your experience,
              skills, interests and career goal to build
              a structured learning roadmap for you.
            </p>

          </div>

          <button
            className="generate-button"
            onClick={generateLearningPath}
            disabled={generating}
          >
            {generating
              ? "Generating..."
              : "Generate Learning Path →"}
          </button>
          <button
      className="view-map-dashboard-btn"
      onClick={() => setShowMindMap(true)}
      disabled={learningPath.length === 0}
>
  🗺️ View Learning Map
</button>

        </section>

        {/* ================= LEARNING PATH ================= */}

        {learningPath.length > 0 && (

          <section className="learning-path-section">

            <div className="section-heading">

              <div>

                <p className="card-label">
                  PERSONALIZED ROADMAP
                </p>

                <h2>
                  Your Learning Path
                </h2>

                <p>
                  A structured path based on your
                  current skills and career goal.
                </p>

              </div>

              <div className="path-count">
                {learningPath.length} Steps
              </div>

            </div>

            <div className="learning-path-list">

              {learningPath.map((topic, index) => {

                const completed = progress.some(
                  (item) =>
                    item.topic === topic &&
                    item.completed
                );

                return (

                  <div
                    className={`path-item ${
                      completed
                        ? "completed"
                        : ""
                    }`}
                    key={index}
                  >

                    <div className="path-number">
                      {completed
                        ? "✓"
                        : index + 1}
                    </div>

                    <div className="path-info">

                      <span>
                        STEP{" "}
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <h3>{topic}</h3>

                    </div>

                    <div className="path-status">
                      {completed
                        ? "Completed"
                        : "Not Started"}
                    </div>

                  </div>

                );
              })}

            </div>

          </section>

        )}

        {/* ================= RECOMMENDATIONS ================= */}

        <section className="recommendations-section">

          <div className="recommendations-header">

            <div>

              <p className="card-label">
                AI RECOMMENDATIONS
              </p>

              <h2>
                Recommended For You
              </h2>

              <p>
                Resources selected according to
                your current skills and career goal.
              </p>

            </div>

            <div className="recommendation-badge">
              ✦ Personalized
            </div>

          </div>

          {loadingRecommendations ? (

            <div className="recommendation-loading">
              Finding the best resources for you...
            </div>

          ) : (

            <div className="recommendations-grid">

              {recommendations.map(
                (recommendation, index) => (

                  <div
                    className="recommendation-card"
                    key={index}
                  >

                    <div className="recommendation-icon">
                      {index === 0
                        ? "⚡"
                        : index === 1
                        ? "◈"
                        : index === 2
                        ? "◎"
                        : index === 3
                        ? "⌘"
                        : "✦"}
                    </div>

                    <div className="recommendation-content">

                      <span>
                        {index < 2
                          ? "COURSE"
                          : index ===
                            recommendations.length - 1
                          ? "PROJECT"
                          : "RESOURCE"}
                      </span>

                      <h3>
                        {recommendation}
                      </h3>

                      <p>
                        Recommended based on your
                        learning profile.
                      </p>

                    </div>

                    <button className="resource-button">
                      Explore →
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ================= PROGRESS ================= */}

        <section className="progress-section">

          <div className="progress-header">

            <div>

              <p className="card-label">
                LEARNING PROGRESS
              </p>

              <h2>
                Your Progress
              </h2>

              <p>
                Track the topics you have completed.
              </p>

            </div>

            <div className="progress-count">
              {completedCount} Completed
            </div>

          </div>

          <div className="progress-overview">

            <div className="progress-overview-top">

              <span>
                Overall Progress
              </span>

              <strong>
                {progressPercentage}%
              </strong>

            </div>

            <div className="progress-bar">

              <div
                className="progress-bar-fill"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />

            </div>

            <p>
              {completedCount} of{" "}
              {totalProgressTopics ||
                progress.length}{" "}
              learning steps completed
            </p>

          </div>

          {loadingProgress ? (

            <div className="progress-loading">
              Loading your progress...
            </div>

          ) : progress.length === 0 ? (

            <div className="progress-empty">
              No completed topics yet. Start your
              learning path!
            </div>

          ) : (

            <div className="progress-list">

              {progress.map((item) => (

                <div
                  className="progress-item"
                  key={item.id}
                >

                  <div className="progress-check">
                    {item.completed ? "✓" : "○"}
                  </div>

                  <div className="progress-info">

                    <h3>
                      {item.topic}
                    </h3>

                    <span>
                      {item.completed
                        ? "Completed"
                        : "In Progress"}
                    </span>

                  </div>

                  <div className="progress-status">
                    {item.completed
                      ? "100%"
                      : "In Progress"}
                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* =====================================================
          PROFESSIONAL AI ASSISTANT
      ===================================================== */}

      {showAI && (

        <div
          className="ai-overlay"
          onClick={() => setShowAI(false)}
        >

          <div
            className="ai-assistant-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* AI HEADER */}

            <div className="ai-header">

              <div className="ai-title">

                <div className="ai-avatar">
                  ✦
                </div>

                <div>
                  <h2>
                    LearnPath AI
                  </h2>

                  <div className="ai-status">
                    <span></span>
                    AI Assistant · Online
                  </div>
                </div>

              </div>

              <button
                className="ai-close"
                onClick={() => setShowAI(false)}
              >
                ×
              </button>

            </div>

            {/* CHAT */}

            <div className="ai-chat">

              <div className="ai-welcome">

                <div className="ai-welcome-icon">
                  ✦
                </div>

                <h3>
                  How can I help you learn?
                </h3>

                <p>
                  Ask me anything about your
                  learning path, technical skills,
                  projects or career preparation.
                </p>

              </div>

              {chat.map((item, index) => (

                <div
                  key={index}
                  className={`chat-message ${
                    item.sender === "user"
                      ? "user-message"
                      : "ai-message"
                  }`}
                >

                  {item.sender === "ai" && (
                    <div className="message-avatar">
                      ✦
                    </div>
                  )}

                  <div className="message-bubble">
                    {item.text}
                  </div>

                </div>

              ))}

              {aiLoading && (

                <div className="chat-message ai-message">

                  <div className="message-avatar">
                    ✦
                  </div>

                  <div className="message-bubble typing">

                    <span></span>
                    <span></span>
                    <span></span>

                  </div>

                </div>

              )}

            </div>
            <div className="ai-map-action">
  <button
    onClick={() => {
      setShowAI(false);
      setShowMindMap(true);
    }}
    disabled={learningPath.length === 0}
  >
    🗺️ View Learning Map
  </button>

  {learningPath.length === 0 && (
    <span>
      Generate your learning path first
    </span>
  )}
</div>

            {/* SUGGESTIONS */}

            <div className="ai-suggestions">

              <button
                onClick={() => {
                  setMessage(
                    "Give me a Java roadmap"
                  );
                }}
              >
                Java roadmap
              </button>

              <button
                onClick={() => {
                  setMessage(
                    "What should I learn next?"
                  );
                }}
              >
                What should I learn next?
              </button>

              <button
                onClick={() => {
                  setMessage(
                    "How can I improve my skills?"
                  );
                }}
              >
                Improve my skills
              </button>

            </div>

            {/* INPUT */}

            <div className="ai-input-wrapper">

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask your learning assistant..."
                rows="1"
              />

              <button
                className="ai-send"
                onClick={sendMessage}
                disabled={
                  !message.trim() || aiLoading
                }
              >
                ↑
              </button>

            </div>

            <div className="ai-footer">
              LearnPath AI · Personalized learning assistance
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          LEARNING MIND MAP
      ===================================================== */}

      {showMindMap && (
        <LearningMindMap
          learningPath={learningPath}
          progress={progress}
          onClose={() => setShowMindMap(false)}
        />
      )}

    </div>
  );
}

export default LearnerDashboard;