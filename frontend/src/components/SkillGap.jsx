import { useEffect, useMemo, useState } from "react";
import "./SkillGap.css";

const API_BASE = "http://localhost:8080";
const LEARNER_ID = 1;

function SkillGap() {
  const [skillGap, setSkillGap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    loadSkillGap();
  }, []);

  const loadSkillGap = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/skill-gap/${LEARNER_ID}`
      );

      if (!response.ok) {
        throw new Error("Failed to load skill gap");
      }

      const data = await response.json();

      setSkillGap(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load your skill gap analysis.");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: skillGap.length,
      recommended: skillGap.length,
    };
  }, [skillGap]);

  const getSkillDescription = (skill) => {
    const descriptions = {
      "Spring Boot":
        "Build production-ready backend applications, REST APIs and enterprise services using Spring Boot.",

      "React.js":
        "Develop modern, component-based frontend interfaces and connect them with backend APIs.",

      "REST API Development":
        "Learn how to design, build, test and integrate scalable RESTful APIs.",

      "Git & GitHub":
        "Strengthen version control, collaboration and professional software development workflows.",
    };

    return (
      descriptions[skill] ||
      "This skill can strengthen your technical profile and improve your career readiness."
    );
  };

  const getSkillLevel = (index) => {
    if (index === 0) return "Next Focus";
    if (index === 1) return "Recommended";
    return "Recommended";
  };

  if (loading) {
    return (
      <div className="skill-gap-page">
        <div className="skill-gap-loading">
          <div className="skill-gap-spinner" />
          <p>Analyzing your skill profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-gap-page">

      {/* =========================
          HEADER
      ========================== */}

      <section className="skill-gap-hero">
        <div>
          <span className="skill-gap-eyebrow">
            AI CAREER ANALYSIS
          </span>

          <h1>Skill Gap Analysis</h1>

          <p>
            Identify the skills you should develop next and
            focus on the capabilities that matter most for
            your career goal.
          </p>
        </div>

        <button
          className="skill-gap-refresh"
          onClick={loadSkillGap}
        >
          ↻ Re-analyze
        </button>
      </section>

      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div className="skill-gap-error">
          {error}
        </div>
      )}

      {/* =========================
          OVERVIEW
      ========================== */}

      <section className="skill-gap-overview">

        <div className="skill-gap-overview-content">

          <span className="section-label">
            CAREER READINESS
          </span>

          <h2>
            Your recommended skill focus
          </h2>

          <p>
            LearnPath AI analyzed your current profile and
            identified the technical areas that can help you
            move closer to your target career.
          </p>

          <div className="skill-gap-mini-bar">
            <div
              style={{
                width:
                  stats.total > 0
                    ? `${Math.min(
                        100,
                        stats.total * 20
                      )}%`
                    : "0%",
              }}
            />
          </div>

        </div>

        <div className="skill-gap-score">

          <span>SKILL GAPS</span>

          <strong>
            {stats.total}
          </strong>

          <small>
            areas to develop
          </small>

        </div>

      </section>

      {/* =========================
          STATS
      ========================== */}

      <section className="skill-gap-stats">

        <div className="skill-gap-stat">

          <div className="skill-gap-stat-icon purple">
            ◈
          </div>

          <div>
            <span>Skills Identified</span>
            <strong>{stats.total}</strong>
          </div>

        </div>

        <div className="skill-gap-stat">

          <div className="skill-gap-stat-icon red">
            !
          </div>

          <div>
            <span>Next Focus</span>
            <strong>
              {skillGap.length > 0 ? "1" : "0"}
            </strong>
          </div>

        </div>

        <div className="skill-gap-stat">

          <div className="skill-gap-stat-icon orange">
            ◐
          </div>

          <div>
            <span>Recommended</span>
            <strong>{stats.recommended}</strong>
          </div>

        </div>

        <div className="skill-gap-stat">

          <div className="skill-gap-stat-icon green">
            ✓
          </div>

          <div>
            <span>Career Path</span>
            <strong>Java Full Stack</strong>
          </div>

        </div>

      </section>

      {/* =========================
          SKILL LIST
      ========================== */}

      <section className="skill-gap-section">

        <div className="skill-gap-section-header">

          <div>

            <span className="section-label">
              RECOMMENDED FOCUS
            </span>

            <h2>
              Skills you should develop
            </h2>

            <p>
              Your personalized technical skill recommendations.
            </p>

          </div>

          <div className="skill-gap-count">
            {stats.total} identified
          </div>

        </div>

        {skillGap.length === 0 ? (

          <div className="skill-gap-empty">

            <div className="skill-gap-empty-icon">
              ✓
            </div>

            <h3>
              No skill gaps detected
            </h3>

            <p>
              Your current profile looks aligned with
              your selected career goal.
            </p>

          </div>

        ) : (

          <div className="skill-gap-list">

            {skillGap.map((skill, index) => {

              const status = getSkillLevel(index);

              return (
                <div
                  className="skill-gap-card low"
                  key={`${skill}-${index}`}
                >

                  {/* NUMBER */}

                  <div className="skill-gap-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* INFORMATION */}

                  <div className="skill-gap-info">

                    <div className="skill-gap-title-row">

                      <h3>
                        {skill}
                      </h3>

                      <span className="priority-badge low">
                        {status}
                      </span>

                    </div>

                    <p>
                      {getSkillDescription(skill)}
                    </p>

                    <div className="skill-gap-action">
  <span>
    Recommended next step
  </span>

  <button
    className="skill-gap-start-btn"
    onClick={() => setSelectedSkill(skill)}
  >
    Start learning →
  </button>
</div>
                  </div>

                  {/* ARROW */}

                  <div className="skill-gap-arrow">
                    →
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* =========================
          AI INSIGHT
      ========================== */}

      <section className="skill-gap-insight">

        <div className="skill-gap-insight-icon">
          ✦
        </div>

        <div>

          <span className="section-label">
            LEARNPATH AI INSIGHT
          </span>

          <h3>
            Build these skills in sequence.
          </h3>

          <p>
            Start with the first recommended skill and
            progressively build the technical foundation
            required for your Java Full Stack career path.
          </p>

        </div>

      </section>
      {selectedSkill && (
  <div
    className="skill-learning-overlay"
    onClick={() => setSelectedSkill(null)}
  >
    <div
      className="skill-learning-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="skill-learning-close"
        onClick={() => setSelectedSkill(null)}
      >
        ×
      </button>

      <span className="skill-gap-eyebrow">
        LEARNPATH AI · NEXT STEP
      </span>

      <h2>
        {selectedSkill}
      </h2>

      <p className="skill-learning-description">
        Follow this focused learning sequence to strengthen
        your {selectedSkill} skills.
      </p>

      <div className="skill-learning-roadmap">

        <div className="skill-learning-step">
          <div>01</div>
          <section>
            <span>FOUNDATION</span>
            <h3>Understand the fundamentals</h3>
            <p>
              Learn the core concepts, terminology and
              practical basics of {selectedSkill}.
            </p>
          </section>
        </div>

        <div className="skill-learning-step">
          <div>02</div>
          <section>
            <span>PRACTICE</span>
            <h3>Build with hands-on examples</h3>
            <p>
              Solve practical problems and implement small
              features using {selectedSkill}.
            </p>
          </section>
        </div>

        <div className="skill-learning-step">
          <div>03</div>
          <section>
            <span>PROJECT</span>
            <h3>Apply it to a real project</h3>
            <p>
              Build a production-style feature that demonstrates
              your understanding of {selectedSkill}.
            </p>
          </section>
        </div>

        <div className="skill-learning-step">
          <div>04</div>
          <section>
            <span>MASTERY</span>
            <h3>Test and strengthen your skills</h3>
            <p>
              Review concepts, solve interview-style questions
              and identify remaining gaps.
            </p>
          </section>
        </div>

      </div>

      <button
        className="skill-learning-primary"
        onClick={() => setSelectedSkill(null)}
      >
        Start this learning track →
      </button>

    </div>
  </div>
)}

    </div>
  );
}

export default SkillGap;