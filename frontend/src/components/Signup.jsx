import { useState } from "react";
import "./Signup.css";

const API_BASE = "http://localhost:8080";

function Signup({ onSignup }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    experienceLevel: "Beginner",
    careerGoal: "",
    interests: "",
    currentSkills: "",
    weeklyLearningHours: 5,
    targetDurationMonths: 6,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/learners`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create account"
        );
      }

      onSignup();
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        error.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">

        <div className="signup-brand">
          <div className="signup-logo">✦</div>

          <div>
            <h2>LearnPath AI</h2>
            <span>Personalized Career Learning</span>
          </div>
        </div>

        <div className="signup-header">
          <span className="signup-eyebrow">
            CREATE YOUR ACCOUNT
          </span>

          <h1>Start your learning journey</h1>

          <p>
            Tell us a little about yourself and we'll
            personalize your learning experience.
          </p>
        </div>

        {error && (
          <div className="signup-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="signup-field">
            <label>Full name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="signup-field">
            <label>Email address</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="signup-field">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={6}
              required
            />
          </div>

          <div className="signup-field">
            <label>Experience level</label>

            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
            >
              <option value="Beginner">
                Beginner
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>
            </select>
          </div>

          <div className="signup-field">
            <label>Career goal</label>

            <input
              type="text"
              name="careerGoal"
              value={formData.careerGoal}
              onChange={handleChange}
              placeholder="e.g. Java Full Stack Developer"
              required
            />
          </div>

          <div className="signup-field">
            <label>Current skills</label>

            <input
              type="text"
              name="currentSkills"
              value={formData.currentSkills}
              onChange={handleChange}
              placeholder="Java, SQL, HTML, CSS"
            />
          </div>

          <div className="signup-field">
            <label>Interests</label>

            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="Backend, AI, Web Development"
            />
          </div>

          <div className="signup-row">

            <div className="signup-field">
              <label>Weekly learning hours</label>

              <input
                type="number"
                name="weeklyLearningHours"
                min="1"
                max="40"
                value={formData.weeklyLearningHours}
                onChange={handleChange}
              />
            </div>

            <div className="signup-field">
              <label>Target duration</label>

              <input
                type="number"
                name="targetDurationMonths"
                min="1"
                max="36"
                value={formData.targetDurationMonths}
                onChange={handleChange}
              />
            </div>

          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account →"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default Signup;