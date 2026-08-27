import { useEffect, useMemo, useState } from "react";
import "./MyLearningPath.css";

const API_BASE = "http://localhost:8080";

function MyLearningPath({ learnerId,onBack }) {
  const [learningPath, setLearningPath] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
    loadLearningPath();
  }, []);

  const loadLearningPath = async () => {
    try {
      setLoading(true);
      setError("");

      const [pathResponse, progressResponse] = await Promise.all([
        fetch(`${API_BASE}/api/learning-path/generate/${learnerId}`),
        fetch(`${API_BASE}/api/progress/${learnerId}`),
      ]);

      if (!pathResponse.ok) {
        throw new Error("Unable to load learning path");
      }

      const pathData = await pathResponse.json();

      setLearningPath(Array.isArray(pathData) ? pathData : []);

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgress(Array.isArray(progressData) ? progressData : []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your learning path.");
    } finally {
      setLoading(false);
    }
  };

  const generatePath = async () => {
    try {
      setGenerating(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/learning-path/generate/${learnerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate learning path");
      }

      const data = await response.json();

      setLearningPath(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to generate learning path.");
    } finally {
      setGenerating(false);
    }
  };

  const completedCount = useMemo(() => {
    return learningPath.filter((topic) =>
      progress.some(
        (item) => item.topic === topic && item.completed
      )
    ).length;
  }, [learningPath, progress]);

  const progressPercentage =
    learningPath.length > 0
      ? Math.round((completedCount / learningPath.length) * 100)
      : 0;

  const getTopicStatus = (topic, index) => {
    const completed = progress.some(
      (item) => item.topic === topic && item.completed
    );

    if (completed) return "completed";

    if (index === completedCount) return "current";

    return "upcoming";
  };

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-loading">
          <div className="learning-spinner" />
          <p>Building your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-page">

      {/* HEADER */}

      <section className="learning-hero">
        <button
  className="learning-back-btn"
  onClick={onBack}
>
  ← Back to Dashboard
</button>

        <div>
          <div className="learning-eyebrow">
            PERSONALIZED LEARNING
          </div>

          <h1>
            My Learning Path
          </h1>

          <p>
            A structured roadmap designed around your
            skills, interests and career goal.
          </p>
        </div>

        <button
          className="generate-learning-btn"
          onClick={generatePath}
          disabled={generating}
        >
          {generating
            ? "Generating..."
            : "✦ Generate New Path"}
        </button>

      </section>

      {/* ERROR */}

      {error && (
        <div className="learning-error">
          {error}
        </div>
      )}

      {/* OVERVIEW */}

      <section className="learning-overview">

        <div className="learning-overview-card">

          <div className="overview-icon purple">
            ✦
          </div>

          <div>
            <span>Learning Goal</span>
            <strong>{learner?.careerGoal || "Career Goal"}</strong>
          </div>

        </div>

        <div className="learning-overview-card">

          <div className="overview-icon green">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {completedCount} / {learningPath.length}
            </strong>
          </div>

        </div>

        <div className="learning-overview-card">

          <div className="overview-icon blue">
            ◷
          </div>

          <div>
            <span>Progress</span>
            <strong>{progressPercentage}%</strong>
          </div>

        </div>

      </section>

      {/* PROGRESS */}

      <section className="learning-progress-card">

        <div className="learning-progress-header">

          <div>
            <span className="section-label">
              YOUR PROGRESS
            </span>

            <h2>
              Keep moving forward
            </h2>
          </div>

          <strong>
            {progressPercentage}%
          </strong>

        </div>

        <div className="learning-progress-track">
          <div
            className="learning-progress-fill"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>

      </section>

      {/* ROADMAP */}

      <section className="roadmap-section">

        <div className="roadmap-heading">

          <div>
            <span className="section-label">
              AI GENERATED ROADMAP
            </span>

            <h2>
              Your learning journey
            </h2>

            <p>
              Follow each step in sequence to build
              your skills progressively.
            </p>
          </div>

          <div className="roadmap-count">
            {learningPath.length} Steps
          </div>

        </div>

        {learningPath.length === 0 ? (

          <div className="empty-learning-path">

            <div className="empty-learning-icon">
              ◈
            </div>

            <h3>
              Your learning path is waiting
            </h3>

            <p>
              Generate a personalized roadmap to get started.
            </p>

            <button
              onClick={generatePath}
              className="empty-generate-btn"
            >
              Generate Learning Path →
            </button>

          </div>

        ) : (

          <div className="roadmap">

            {learningPath.map((topic, index) => {

              const status = getTopicStatus(topic, index);

              return (
                <div
                  className={`roadmap-item ${status}`}
                  key={`${topic}-${index}`}
                >

                  {/* CONNECTOR */}

                  {index > 0 && (
                    <div className="roadmap-connector" />
                  )}

                  {/* NODE */}

                  <div className="roadmap-node">

                    <div className="roadmap-number">

                      {status === "completed"
                        ? "✓"
                        : index + 1}

                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="roadmap-content">

                    <div className="roadmap-top">

                      <div>

                        <span className="roadmap-step">
                          STEP{" "}
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <h3>
                          {topic}
                        </h3>

                      </div>

                      <span className="roadmap-status">
                        {status === "completed"
                          ? "Completed"
                          : status === "current"
                          ? "Current"
                          : "Upcoming"}
                      </span>

                    </div>

                    <p>
                      {status === "completed"
                        ? "You have successfully completed this learning milestone."
                        : status === "current"
                        ? "This is your next recommended learning milestone."
                        : "Continue through the roadmap to unlock this milestone."}
                    </p>

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

export default MyLearningPath;