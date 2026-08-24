import { useEffect, useState } from "react";
import "./LearnerDashboard.css";

function LearnerDashboard() {
  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);

  const [learningPath, setLearningPath] = useState([]);
  const [generating, setGenerating] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

 useEffect(() => {
  fetch("http://localhost:8080/api/learners/1")
    .then((response) => response.json())
    .then((data) => {
      setLearner(data);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });

  fetch("http://localhost:8080/api/recommendations/1")
    .then((response) => response.json())
    .then((data) => {
      setRecommendations(data);
      setLoadingRecommendations(false);
    })
    .catch(() => {
      setLoadingRecommendations(false);
    });
}, []);

  const generateLearningPath = async () => {
    setGenerating(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/learning-path/generate/1"
      );

      if (!response.ok) {
        throw new Error("Failed to generate learning path");
      }

      const data = await response.json();

      setLearningPath(data);
    } catch (error) {
      alert("Unable to generate learning path");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Preparing your learning dashboard...</p>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="dashboard-error">
        <h2>Profile not found</h2>
        <p>Please complete your learner profile first.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✦</div>
          <span>
            LearnPath <b>AI</b>
          </span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>

          <div className="nav-item active">
            <span>⌂</span>
            Dashboard
          </div>

          <div className="nav-item">
            <span>◈</span>
            My Learning Path
          </div>

          <div className="nav-item">
            <span>✓</span>
            Progress
          </div>

          <div className="nav-item">
            <span>◇</span>
            Projects
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">TOOLS</p>

          <div className="nav-item">
            <span>✧</span>
            AI Assistant
          </div>

          <div className="nav-item">
            <span>⚙</span>
            Settings
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="mini-profile">

            <div className="avatar">
              {learner.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{learner.name}</strong>
              <small>Learner</small>
            </div>

          </div>
        </div>

      </aside>

      {/* MAIN */}
      <main className="dashboard-main">

        {/* HEADER */}
        <header className="dashboard-header">

          <div>
            <p className="welcome-small">
              YOUR LEARNING SPACE
            </p>

            <h1>
              Welcome back, {learner.name.split(" ")[0]} 👋
            </h1>

            <p className="header-description">
              Here's your personalized learning overview.
            </p>
          </div>

          <button className="ai-button">
            <span>✦</span>
            Ask AI Assistant
          </button>

        </header>

        {/* CAREER GOAL */}
        <section className="goal-card">

          <div className="goal-content">

            <div className="goal-icon">
              ◎
            </div>

            <div>
              <p className="card-label">
                CURRENT CAREER GOAL
              </p>

              <h2>
                {learner.careerGoal}
              </h2>

              <p>
                Your learning path will be personalized around this goal.
              </p>
            </div>

          </div>

          <div className="goal-badge">
            {learner.experienceLevel}
          </div>

        </section>

        {/* STATS */}
        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon purple">
              ◈
            </div>

            <div>
              <span>Learning Hours</span>
              <strong>
                {learner.weeklyLearningHours} hrs
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
                {learner.targetDurationMonths}
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
                {learner.experienceLevel}
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
                {learningPath.length > 0 ? "Active" : "Ready"}
              </strong>
              <small>
                {learningPath.length > 0
                  ? "path generated"
                  : "path generation"}
              </small>
            </div>

          </div>

        </section>

        {/* SKILLS + INTERESTS */}
        <section className="content-grid">

          {/* SKILLS */}
          <div className="dashboard-card">

            <div className="card-heading">

              <div>
                <h3>Your Skills</h3>
                <p>
                  Skills you've already mentioned.
                </p>
              </div>

              <span className="card-number">
                01
              </span>

            </div>

            <div className="skill-list">

              {learner.currentSkills
                .split(",")
                .map((skill, index) => (
                  <span key={index}>
                    {skill.trim()}
                  </span>
                ))}

            </div>

          </div>

          {/* INTERESTS */}
          <div className="dashboard-card">

            <div className="card-heading">

              <div>
                <h3>Your Interests</h3>
                <p>
                  Topics you're interested in learning.
                </p>
              </div>

              <span className="card-number">
                02
              </span>

            </div>

            <div className="interest-list">

              {learner.interests
                .split(",")
                .map((interest, index) => (
                  <div
                    key={index}
                    className="interest-item"
                  >
                    <span>✦</span>
                    {interest.trim()}
                  </div>
                ))}

            </div>

          </div>

        </section>

        {/* AI LEARNING ENGINE */}
        <section className="ai-card">

          <div className="ai-glow"></div>

          <div className="ai-card-icon">
            ✦
          </div>

          <div className="ai-card-content">

            <p className="card-label">
              AI LEARNING ENGINE
            </p>

            <h2>
              {learningPath.length > 0
                ? "Your personalized path is ready."
                : "Your personalized path is next."}
            </h2>

            <p>
              LearnPath AI analyzes your experience, skills,
              interests and career goal to build a structured
              learning roadmap for you.
            </p>

          </div>

          <button
            className="generate-button"
            onClick={generateLearningPath}
            disabled={generating}
          >
            {generating
              ? "Generating..."
              : learningPath.length > 0
              ? "Regenerate Path"
              : "Generate Learning Path"}

            <span>→</span>
          </button>

        </section>

        {/* RECOMMENDATIONS */}
<section className="recommendations-section">

  <div className="recommendations-header">
    <div>
      <p className="card-label">AI RECOMMENDATIONS</p>
      <h2>Recommended For You</h2>
      <p>
        Resources selected according to your current skills and career goal.
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

      {recommendations.map((recommendation, index) => (
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
                : index === recommendations.length - 1
                ? "PROJECT"
                : "RESOURCE"}
            </span>

            <h3>{recommendation}</h3>

            <p>
              Recommended based on your learning profile.
            </p>

          </div>

          <button className="resource-button">
            Explore →
          </button>

        </div>
      ))}

    </div>
  )}

</section>

        {/* LEARNING ROADMAP */}
        {learningPath.length > 0 && (
          <section className="roadmap-section">

            <div className="roadmap-header">

              <div>
                <p className="card-label">
                  YOUR PERSONALIZED ROADMAP
                </p>

                <h2>
                  Learning Path
                </h2>

                <p>
                  A structured journey created based on your
                  current profile and career goal.
                </p>
              </div>

              <div className="roadmap-count">
                {learningPath.length} Steps
              </div>

            </div>

            <div className="roadmap">

              {learningPath.map((step, index) => (

                <div
                  className="roadmap-item"
                  key={index}
                >

                  <div className="roadmap-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="roadmap-line"></div>

                  <div className="roadmap-content">

                    <span>
                      {index === 0
                        ? "FOUNDATION"
                        : index === learningPath.length - 1
                        ? "PROJECT"
                        : "SKILL DEVELOPMENT"}
                    </span>

                    <h3>
                      {step}
                    </h3>

                    <p>
                      Build your knowledge and practical
                      skills in {step}.
                    </p>

                  </div>

                  <div className="roadmap-status">
                    Upcoming
                  </div>

                </div>

              ))}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default LearnerDashboard;