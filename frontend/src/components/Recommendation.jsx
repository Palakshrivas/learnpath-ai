import { useEffect, useState } from "react";
import "./Recommendation.css";
import LearningDetail from "./LearningDetail";

const API_BASE = "http://localhost:8080";
const LEARNER_ID = 1;

function Recommendation() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/recommendations/${LEARNER_ID}`
      );

      if (!response.ok) {
        throw new Error("Failed to load recommendations");
      }

      const data = await response.json();

      setRecommendations(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load your recommendations.");
    } finally {
      setLoading(false);
    }
  };

  if (selectedSkill) {
    return (
      <LearningDetail
        skill={selectedSkill}
        onBack={() => setSelectedSkill(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="recommendation-page">
        <div className="recommendation-loading">
          <div className="recommendation-spinner" />
          <p>
            Generating your recommendations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-page">

      {/* HEADER */}

      <section className="recommendation-hero">

        <div>
          <span className="recommendation-eyebrow">
            LEARNPATH AI · RECOMMENDATIONS
          </span>

          <h1>
            Recommended For You
          </h1>

          <p>
            Discover what you should learn next based
            on your current profile and career path.
          </p>
        </div>

        <button
          className="recommendation-refresh"
          onClick={loadRecommendations}
        >
          ↻ Refresh
        </button>

      </section>

      {/* ERROR */}

      {error && (
        <div className="recommendation-error">
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <section className="recommendation-summary">

        <div>
          <span className="section-label">
            PERSONALIZED LEARNING
          </span>

          <h2>
            Your next best learning moves
          </h2>

          <p>
            These recommendations are generated from
            your current learning profile.
          </p>
        </div>

        <div className="recommendation-count">
          <strong>
            {recommendations.length}
          </strong>

          <span>
            Recommendations
          </span>
        </div>

      </section>

      {/* RECOMMENDATIONS */}

      <section className="recommendation-section">

        <div className="recommendation-section-header">

          <div>
            <span className="section-label">
              LEARNING QUEUE
            </span>

            <h2>
              What to learn next
            </h2>
          </div>

          <span className="recommendation-badge">
            Personalized
          </span>

        </div>

        {recommendations.length === 0 ? (

          <div className="recommendation-empty">

            <div className="recommendation-empty-icon">
              ✦
            </div>

            <h3>
              No recommendations yet
            </h3>

            <p>
              Complete your learner profile and generate
              a learning path to receive recommendations.
            </p>

          </div>

        ) : (

          <div className="recommendation-list">

            {recommendations.map(
              (recommendation, index) => {

                const title =
                  typeof recommendation === "string"
                    ? recommendation
                    : recommendation.title ||
                      recommendation.skill ||
                      recommendation.topic ||
                      `Recommendation ${index + 1}`;

                const description =
                  typeof recommendation === "string"
                    ? `Build practical knowledge in ${recommendation} to strengthen your career readiness.`
                    : recommendation.description ||
                      recommendation.reason ||
                      "This recommendation can strengthen your technical profile.";

                return (
                  <div
                    className="recommendation-card"
                    key={`${title}-${index}`}
                  >

                    <div className="recommendation-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="recommendation-content">

                      <div className="recommendation-title-row">

                        <h3>
                          {title}
                        </h3>

                        <span>
                          Recommended
                        </span>

                      </div>

                      <p>
                        {description}
                      </p>

                      <button
                        className="recommendation-start"
                        onClick={() =>
                          setSelectedSkill(title)
                        }
                      >
                        Start learning →
                      </button>

                    </div>

                    <div
                      className="recommendation-arrow"
                      onClick={() =>
                        setSelectedSkill(title)
                      }
                    >
                      →
                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

      {/* AI INSIGHT */}

      <section className="recommendation-insight">

        <div className="recommendation-insight-icon">
          ✦
        </div>

        <div>

          <span className="section-label">
            LEARNPATH AI INSIGHT
          </span>

          <h3>
            Learn with a clear direction.
          </h3>

          <p>
            Follow your recommendations in sequence,
            practice what you learn, and apply each skill
            through real projects.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Recommendation;