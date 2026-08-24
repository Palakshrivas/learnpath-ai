import { useState } from "react";
import "./LearnerProfile.css";

function LearnerProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    experienceLevel: "",
    careerGoal: "",
    interests: "",
    currentSkills: "",
    weeklyLearningHours: "",
    targetDurationMonths: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/learners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          weeklyLearningHours: Number(formData.weeklyLearningHours),
          targetDurationMonths: Number(formData.targetDurationMonths)
        })
      });

      if (response.ok) {
        alert("Profile saved successfully!");
      } else {
        alert("Failed to save profile");
      }
    } catch (error) {
      alert("Backend is not running");
    }
  };

  return (
    <div className="page">

      <nav className="navbar">
        <div className="logo">
          <span>✦</span> LearnPath AI
        </div>

        <div className="nav-status">
          AI Learning Assistant
        </div>
      </nav>

      <main className="container">

        <div className="hero">
          <p className="eyebrow">PERSONALIZED LEARNING</p>

          <h1>
            Build your learning
            <span> journey.</span>
          </h1>

          <p>
            Tell us about yourself and your goals. We'll create a
            personalized learning path designed for you.
          </p>
        </div>

        <div className="profile-card">

          <div className="card-header">
            <div>
              <h2>Learner Profile</h2>
              <p>Help us understand your learning needs.</p>
            </div>

            <div className="step">
              STEP <strong>1</strong> OF 3
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="section-title">
              <span>01</span>
              Basic Information
            </div>

            <div className="form-grid">

              <div className="field">
                <label>Full Name</label>
                <input
                  name="name"
                  placeholder="e.g. Piyush Chaurasiya"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Experience Level</label>

                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="field">
                <label>Career Goal</label>
                <input
                  name="careerGoal"
                  placeholder="e.g. Java Full Stack Developer"
                  value={formData.careerGoal}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="section-title">
              <span>02</span>
              Skills & Interests
            </div>

            <div className="form-grid">

              <div className="field">
                <label>Current Skills</label>
                <textarea
                  name="currentSkills"
                  placeholder="Java, SQL, HTML, CSS..."
                  value={formData.currentSkills}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Interests</label>
                <textarea
                  name="interests"
                  placeholder="AI, Backend, Web Development..."
                  value={formData.interests}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="section-title">
              <span>03</span>
              Learning Preferences
            </div>

            <div className="form-grid">

              <div className="field">
                <label>Weekly Learning Hours</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  name="weeklyLearningHours"
                  placeholder="e.g. 10"
                  value={formData.weeklyLearningHours}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Target Duration (Months)</label>
                <input
                  type="number"
                  min="1"
                  name="targetDurationMonths"
                  placeholder="e.g. 6"
                  value={formData.targetDurationMonths}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-footer">
              <p>
                Your information will be used to generate your
                personalized learning roadmap.
              </p>

              <button type="submit">
                Create My Learning Path
                <span>→</span>
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  );
}

export default LearnerProfile;