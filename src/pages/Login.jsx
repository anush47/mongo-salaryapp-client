import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import axios from "axios";

const Login = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Simulate loading completion after initial render
    setIsLoading(false);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = (token) => {
    try {
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage");

      // Redirect to home page after setting token
      window.location.href = "/";
    } catch (error) {
      console.error("Error storing token in localStorage:", error);
      // Handle error storing token
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/login`,
        formData
      );

      const token = response.data.token;
      console.log("Login successful. Token:", token);
      handleLogin(token);
    } catch (error) {
      console.error("Login error:", error.response.data);
      setErrorMessage(error.response.data.message); // Assuming the API returns an error message
      setShowErrorModal(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <div
        className={`mt-3 fade ${isLoading ? "fade-out" : "fade-in"}`}
        style={{
          transition: "opacity 0.25s ease-in-out",
          opacity: isLoading ? 0 : 1,
        }}
      >
        <Header title="Salary App" />
        <div className="container d-flex flex-grow-1 justify-content-center align-items-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-body p-4">
                <h3 className="card-title text-center mb-4 text-primary">
                  Login
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <label htmlFor="email">Email</label>
                  </div>
                  <div className="form-floating mb-3 position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <label htmlFor="password">Password</label>
                    <button
                      type="button"
                      className="btn btn-outline-secondary position-absolute end-0 top-50 translate-middle-y"
                      onClick={togglePasswordVisibility}
                      style={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 mt-3"
                  >
                    Login
                  </button>
                </form>
                <p className="mt-4 text-center">
                  <Link to="/forgot-password" className="text-decoration-none">
                    Forgot Password?
                  </Link>
                </p>
                <p className="mt-2 text-center">
                  Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <div
        className={`modal fade ${showErrorModal ? "show" : ""}`}
        style={{ display: showErrorModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="errorModalLabel"
        aria-hidden={!showErrorModal}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="errorModalLabel">
                Login Error
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleCloseErrorModal}
              ></button>
            </div>
            <div className="modal-body">
              <p>{errorMessage}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseErrorModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
