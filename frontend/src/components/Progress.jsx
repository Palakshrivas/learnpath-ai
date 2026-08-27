import { useEffect, useMemo, useState } from "react";
import "./Progress.css";

const API_BASE = "http://localhost:8080";


function Progress({ learnerId,onBack  }) {
  const [progress, setProgress] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [learner, setLearner] = useState(null);

  const loadLearner = async () => {
  try {
    const response = await fetch(
      `${API_BASE}/api/learners/${learnerId}`
    );

    if (response.ok) {
      const data = await response.json();
      setLearner(data);
    }
  } catch (err) {
    console.error("Learner fetch error:", err);
  }
};
  useEffect(() => {
    loadLearner();
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const [progressResponse, pathResponse] = await Promise.all([
        fetch(`${API_BASE}/api/progress/${learnerId}`),
        fetch(`${API_BASE}/api/learning-path/generate/${learnerId}`),
      ]);

      if (!progressResponse.ok) {
        throw new Error("Failed to load progress");
      }

      const progressData = await progressResponse.json();

      setProgress(Array.isArray(progressData) ? progressData : []);

      if (pathResponse.ok) {
        const pathData = await pathResponse.json();
        setLearningPath(Array.isArray(pathData) ? pathData : []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your progress.");
    } finally {
      setLoading(false);
    }
  };

  const completedTopics = useMemo(
    () => progress.filter((item) => item.completed),
    [progress]
  );

  const completedCount = completedTopics.length;

  const totalTopics =
    learningPath.length > 0
      ? learningPath.length
      : progress.length;

  const remainingCount = Math.max(
    totalTopics - completedCount,
    0
  );

  const percentage =
    totalTopics > 0
      ? Math.min(
          Math.round((completedCount / totalTopics) * 100),
          100
        )
      : 0;

  const getTopicStatus = (topic, index) => {
    const completed = progress.some(
      (item) => item.topic === topic && item.completed
    );

    if (completed) return "completed";

    const firstIncompleteIndex = learningPath.findIndex(
      (pathTopic) =>
        !progress.some(
          (item) =>
            item.topic === pathTopic && item.completed
        )
    );

    if (index === firstIncompleteIndex) {
      return "current";
    }

    return "upcoming";
  };

  if (loading) {
    return (
      <div className="progress-page">
        <div className="progress-loading">
          <div className="progress-spinner" />
          <p>Loading your learning progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">

      {/* HEADER */}

      <section className="progress-hero">
         <button
             className="progress-back-btn"
              onClick={onBack}
       >
    ← Back to Dashboard
  </button>

        <div>
          <span className="progress-eyebrow">
            LEARNING ANALYTICS
          </span>

          <h1>Your Progress</h1>

          <p>
            Track your learning journey and see how far
            you've progressed toward your career goal.
          </p>
        </div>

        <button
          className="refresh-progress-btn"
          onClick={loadProgress}
        >
          ↻ Refresh Progress
        </button>

      </section>

      {/* ERROR */}

      {error && (
        <div className="progress-error">
          {error}
        </div>
      )}

      {/* MAIN PROGRESS */}

      <section className="progress-main-card">

        <div className="progress-main-left">

          <span className="section-label">
            OVERALL COMPLETION
          </span>

          <div className="progress-percentage">
            {percentage}%
          </div>

          <h2>
            {percentage === 100
              ? "Learning path completed!"
              : "Keep building your momentum"}
          </h2>

          <p>
            {completedCount} of {totalTopics} learning
            milestones completed.
          </p>

        </div>

        <div className="progress-circle">

          <div
            className="progress-circle-fill"
            style={{
              "--progress": `${percentage * 3.6}deg`,
            }}
          >
            <div className="progress-circle-inner">
              <strong>{percentage}%</strong>
              <span>Complete</span>
            </div>
          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="progress-stats">

        <div className="progress-stat-card">

          <div className="progress-stat-icon purple">
            ◈
          </div>

          <div>
            <span>Total Milestones</span>
            <strong>{totalTopics}</strong>
          </div>

        </div>

        <div className="progress-stat-card">

          <div className="progress-stat-icon green">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>

        </div>

        <div className="progress-stat-card">

          <div className="progress-stat-icon orange">
            →
          </div>

          <div>
            <span>Remaining</span>
            <strong>{remainingCount}</strong>
          </div>

        </div>

        <div className="progress-stat-card">

          <div className="progress-stat-icon blue">
            ★
          </div>

          <div>
            <span>Current Goal</span>
            <strong>{learner?.careerGoal || "Career Goal"}</strong>
          </div>

        </div>

      </section>

      {/* PROGRESS BAR */}

      <section className="progress-bar-card">

        <div className="progress-bar-header">

          <div>
            <span className="section-label">
              ROADMAP COMPLETION
            </span>

            <h2>Learning journey</h2>
          </div>

          <strong>{percentage}%</strong>

        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="progress-bar-footer">
          <span>Started</span>
          <span>
            {completedCount} milestones completed
          </span>
          <span>Goal</span>
        </div>

      </section>

      {/* TOPIC PROGRESS */}

      <section className="topic-progress-section">

        <div className="topic-progress-heading">

          <div>
            <span className="section-label">
              TOPIC PROGRESS
            </span>

            <h2>Track each milestone</h2>

            <p>
              Your personalized learning roadmap
              and completion status.
            </p>
          </div>

          <div className="topic-count">
            {totalTopics} Topics
          </div>

        </div>

        {learningPath.length === 0 ? (

          <div className="progress-empty">

            <div className="progress-empty-icon">
              ◈
            </div>

            <h3>No learning path yet</h3>

            <p>
              Generate your personalized learning path
              to start tracking progress.
            </p>

          </div>

        ) : (

          <div className="topic-list">

            {learningPath.map((topic, index) => {

              const status = getTopicStatus(
                topic,
                index
              );

              return (
                <div
                  className={`topic-progress-item ${status}`}
                  key={`${topic}-${index}`}
                >

                  <div className="topic-status-icon">

                    {status === "completed"
                      ? "✓"
                      : index + 1}

                  </div>

                  <div className="topic-progress-info">

                    <span className="topic-step">
                      STEP{" "}
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <h3>{topic}</h3>

                    <span
                      className={`topic-status ${status}`}
                    >
                      {status === "completed"
                        ? "Completed"
                        : status === "current"
                        ? "Current"
                        : "Upcoming"}
                    </span>

                  </div>

                  <div className="topic-progress-indicator">

                    {status === "completed" ? (
                      <div className="completed-check">
                        ✓
                      </div>
                    ) : status === "current" ? (
                      <div className="current-dot">
                        <span />
                      </div>
                    ) : (
                      <div className="upcoming-dot">
                        {index + 1}
                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default Progress;