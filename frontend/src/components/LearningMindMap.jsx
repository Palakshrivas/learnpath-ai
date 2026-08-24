import "./LearningMindMap.css";

function LearningMindMap({
  learningPath = [],
  progress = [],
  onClose,
}) {
  const getStatus = (topic) => {
    const item = progress.find(
      (progressItem) => progressItem.topic === topic
    );

    if (item?.completed) {
      return "completed";
    }

    return "upcoming";
  };

  return (
    <div className="mindmap-overlay" onClick={onClose}>

      <div
        className="mindmap-modal"
        onClick={(event) => event.stopPropagation()}
      >

        {/* HEADER */}

        <div className="mindmap-header">

          <div>
            <p className="mindmap-eyebrow">
              AI LEARNING MAP
            </p>

            <h2>
              Your Learning Journey
            </h2>

            <p>
              Follow your personalized path from fundamentals
              to your career goal.
            </p>
          </div>

          <button
            className="mindmap-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        {/* MAP */}

        <div className="mindmap-container">

          <div className="mindmap-start">

            <div className="start-node">
              <span>✦</span>

              <strong>
                {learningPath.length > 0
                  ? "Your Goal"
                  : "Learning Path"}
              </strong>

              <small>
                Personalized by AI
              </small>
            </div>

          </div>

          {learningPath.length === 0 ? (

            <div className="mindmap-empty">

              <div className="empty-icon">
                ◈
              </div>

              <h3>
                Generate your learning path first
              </h3>

              <p>
                Your personalized learning roadmap
                will appear here.
              </p>

            </div>

          ) : (

            <div className="mindmap-path">

              {learningPath.map((topic, index) => {

                const status = getStatus(topic);

                return (
                  <div
                    className="mindmap-step"
                    key={`${topic}-${index}`}
                  >

                    {/* CONNECTOR */}

                    {index > 0 && (
                      <div
                        className={`mindmap-connector ${
                          status === "completed"
                            ? "connector-completed"
                            : ""
                        }`}
                      />
                    )}

                    {/* NODE */}

                    <div
                      className={`mindmap-node ${status}`}
                    >

                      <div className="node-number">

                        {status === "completed"
                          ? "✓"
                          : index + 1}

                      </div>

                      <div className="node-content">

                        <span>
                          STEP{" "}
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <h3>
                          {topic}
                        </h3>

                        <small>
                          {status === "completed"
                            ? "Completed"
                            : index === 0
                            ? "Start here"
                            : "Upcoming"}
                        </small>

                      </div>

                      <div className="node-status">
                        {status === "completed"
                          ? "✓"
                          : "→"}
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>

        {/* LEGEND */}

        <div className="mindmap-footer">

          <div className="mindmap-legend">

            <div>
              <span className="legend-dot completed-dot" />
              Completed
            </div>

            <div>
              <span className="legend-dot current-dot" />
              Current
            </div>

            <div>
              <span className="legend-dot upcoming-dot" />
              Upcoming
            </div>

          </div>

          <div className="mindmap-info">
            ✦ AI-generated learning roadmap
          </div>

        </div>

      </div>

    </div>
  );
}

export default LearningMindMap;