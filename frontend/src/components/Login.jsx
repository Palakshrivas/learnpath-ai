import { useState } from "react";
import "./Login.css";

const API_BASE = "http://localhost:8080";

function Login({ onLogin, onSignup }) {
  const [isResetMode, setIsResetMode] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [resetData, setResetData] = useState({
    email: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetChange = (e) => {
    setResetData({
      ...resetData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/auth/login`,
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
          data.message || "Invalid email or password"
        );
      }

      localStorage.setItem("token", data.token);
      onLogin(data);

    } catch (error) {
      console.error(error);
      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resetData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset password"
        );
      }

      setSuccess(
        "Password reset successful. You can now sign in."
      );

      setResetData({
        email: "",
        newPassword: "",
      });

    } catch (error) {
      console.error(error);
      setError(
        error.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <div className="login-logo">✦</div>

          <div>
            <h2>LearnPath AI</h2>
            <span>Personalized Career Learning</span>
          </div>
        </div>

        <div className="login-header">
          <span className="login-eyebrow">
            {isResetMode ? "RESET PASSWORD" : "WELCOME BACK"}
          </span>

          <h1>
            {isResetMode
              ? "Reset your password"
              : "Continue your journey"}
          </h1>

          <p>
            {isResetMode
              ? "Enter your registered email and create a new password."
              : "Sign in to continue your personalized learning experience."}
          </p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {success && (
          <div className="login-success">
            {success}
          </div>
        )}

        {!isResetMode ? (
          <form onSubmit={handleSubmit}>

            <div className="login-field">
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

            <div className="login-field">
              <label>Password</label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />

              <div className="login-forgot">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

          </form>
        ) : (
          <form onSubmit={handleResetPassword}>

            <div className="login-field">
              <label>Email address</label>

              <input
                type="email"
                name="email"
                value={resetData.email}
                onChange={handleResetChange}
                placeholder="Enter your registered email"
                required
              />
            </div>

            <div className="login-field">
              <label>New Password</label>

              <input
                type="password"
                name="newPassword"
                value={resetData.newPassword}
                onChange={handleResetChange}
                placeholder="Enter your new password"
                minLength="6"
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Resetting..."
                : "Reset Password →"}
            </button>

            <div className="login-forgot">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError("");
                  setSuccess("");
                }}
              >
                ← Back to Sign In
              </button>
            </div>

          </form>
        )}

        {!isResetMode && (
          <div className="login-signup">
            <span>Don't have an account?</span>

            <button
              type="button"
              onClick={onSignup}
            >
              Create an account
            </button>
          </div>
        )}

        <div className="login-footer">
          <span>
            Your learning journey starts here.
          </span>
        </div>

      </div>
    </div>
  );
}

export default Login;