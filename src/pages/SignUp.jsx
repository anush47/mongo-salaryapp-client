import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import axios from "axios";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading completion after initial render
    setIsLoading(false);
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const [showPassword, setShowPassword] = useState(false);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/signup`,
        formData
      );

      console.log("Signup successful. Token:", response.data.token);
      handleLogin(response.data.token);
      // Handle successful signup, e.g., redirect to login page
    } catch (error) {
      console.error("Signup error:", error.message);
      // Handle signup error, e.g., show error message to user
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                  Sign Up
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <label htmlFor="name">Name</label>
                  </div>
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
                    Sign Up
                  </button>
                </form>
                <p className="mt-4 text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="text-decoration-none">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
