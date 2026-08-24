import { useEffect, useState } from "react";
import "./LearningDetail.css";

const API_BASE = "http://localhost:8080";
const LEARNER_ID = 1;

function LearningDetail({ skill, onBack }) {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [learningData, setLearningData] = useState(null);

  useEffect(() => {
    loadLearningDetails();
  }, [skill]);

  const loadLearningDetails = async () => {
    try {
      setLoading(true);

      /*
       * We keep the endpoint flexible for now.
       * If the backend endpoint is not available,
       * the professional fallback roadmap is shown.
       */
      const response = await fetch(
        `${API_BASE}/api/recommendations/${LEARNER_ID}`
      );

      if (response.ok) {
        const data = await response.json();

        const selected = Array.isArray(data)
          ? data.find((item) => {
              const title =
                typeof item === "string"
                  ? item
                  : item.title ||
                    item.skill ||
                    item.topic ||
                    "";

              return title === skill;
            })
          : null;

        setLearningData(selected);
      }
    } catch (error) {
      console.log(
        "Using personalized learning roadmap."
      );
    } finally {
      setLoading(false);
    }
  };

  const roadmap = [
    {
      number: "01",
      type: "FOUNDATION",
      title: "Understand the fundamentals",
      description: `Learn the core concepts and terminology of ${skill}.`,
    },
    {
      number: "02",
      type: "PRACTICE",
      title: "Build hands-on knowledge",
      description: `Practice ${skill} through examples, exercises and small implementations.`,
    },
    {
      number: "03",
      type: "PROJECT",
      title: "Apply it to a real project",
      description: `Use ${skill} to build a practical feature for your portfolio.`,
    },
    {
      number: "04",
      type: "VALIDATE",
      title: "Test your understanding",
      description: `Solve practical problems and interview-style questions related to ${skill}.`,
    },
  ];

  const handleComplete = () => {
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className="learning-detail-page">
        <div className="learning-detail-loading">
          <div className="learning-detail-spinner" />
          <p>
            Preparing your learning track...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-detail-page">

      {/* HEADER */}

      <section className="learning-detail-hero">

        <button
          className="learning-detail-back"
          onClick={onBack}
        >
          ← Back to recommendations
        </button>

        <span className="learning-detail-eyebrow">
          PERSONALIZED LEARNING TRACK
        </span>

        <h1>{skill}</h1>

        <p>
          A focused learning journey designed around
          your current career goal and skill gap.
        </p>

      </section>

      {/* OVERVIEW */}

      <section className="learning-detail-overview">

        <div className="learning-detail-overview-content">

          <span className="section-label">
            YOUR NEXT STEP
          </span>

          <h2>
            Master {skill}
          </h2>

          <p>
            Follow the learning sequence below to move
            from fundamentals to practical implementation.
          </p>

          <div className="learning-detail-tags">
            <span>Beginner Friendly</span>
            <span>Hands-on</span>
            <span>Career Focused</span>
          </div>

        </div>

        <div className="learning-detail-progress">

          <span>TRACK PROGRESS</span>

          <strong>
            {completed ? "100%" : "0%"}
          </strong>

          <div className="learning-detail-progress-track">
            <div
              className="learning-detail-progress-fill"
              style={{
                width: completed ? "100%" : "0%",
              }}
            />
          </div>

          <small>
            {completed
              ? "Learning track completed"
              : "Start your learning journey"}
          </small>

        </div>

      </section>

      {/* ROADMAP */}

      <section className="learning-detail-section">

        <div className="learning-detail-section-header">

          <div>
            <span className="section-label">
              LEARNING ROADMAP
            </span>

            <h2>
              Your path to mastery
            </h2>

            <p>
              Complete each stage progressively.
            </p>
          </div>

          <span className="learning-detail-count">
            4 Stages
          </span>

        </div>

        <div className="learning-detail-roadmap">

          {roadmap.map((step) => (

            <div
              className={`learning-detail-step ${
                completed ? "completed" : ""
              }`}
              key={step.number}
            >

              <div className="learning-detail-step-number">
                {completed ? "✓" : step.number}
              </div>

              <div className="learning-detail-step-content">

                <span>
                  {step.type}
                </span>

                <h3>
                  {step.title}
                </h3>

                <p>
                  {step.description}
                </p>

                <button className="learning-detail-resource">
                  Explore resources →
                </button>

              </div>

              <div className="learning-detail-step-arrow">
                →
              </div>

            </div>

          ))}

        </div>

      </section>

      {/* AI INSIGHT */}

      <section className="learning-detail-insight">

        <div className="learning-detail-insight-icon">
          ✦
        </div>

        <div>

          <span className="section-label">
            LEARNPATH AI INSIGHT
          </span>

          <h3>
            Focus on understanding, not just completion.
          </h3>

          <p>
            Build the concept, practice it, and then apply
            it in a real project. This creates stronger
            long-term technical skills.
          </p>

        </div>

      </section>

      {/* COMPLETE */}

      <section className="learning-detail-footer">

        <div>

          <span className="section-label">
            READY TO MOVE FORWARD?
          </span>

          <h3>
            Complete this learning track
          </h3>

          <p>
            Mark this track complete after you have
            finished the recommended learning stages.
          </p>

        </div>

        <button
          className={`learning-detail-complete ${
            completed ? "completed" : ""
          }`}
          onClick={handleComplete}
          disabled={completed}
        >
          {completed
            ? "✓ Track Completed"
            : "Mark as Completed"}
        </button>

      </section>

    </div>
  );
}

export default LearningDetail;