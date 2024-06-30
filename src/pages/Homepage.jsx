import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import { FiUser, FiLogOut } from "react-icons/fi";
import axios from "axios";

const Homepage = () => {
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for fetching user profile

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found"); // No token, redirect to login

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error fetching user profile:", error.message);
        setIsLoggedIn(false); // Ensure isLoggedIn is false on error
      } finally {
        setLoading(false); // Update loading state after fetch completes
      }
    };

    fetchUserProfile();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setUser({});
    setIsLoggedIn(false);
    //window.location.href = "/login"; // Redirect to login page after sign out
  };

  return (
    <div className="container mt-5">
      <Header title="SALARY APP" />
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="bg-light rounded border shadow-lg p-4">
            {loading ? (
              <div className="text-center">
                <p>Loading...</p>
              </div>
            ) : !isLoggedIn ? (
              <div>
                <h2 className="text-center mb-4 text-primary">
                  Welcome to Salary App
                </h2>
                <p className="text-center">
                  Your ultimate tool for managing company salaries.
                </p>
                <div className="text-center mt-4">
                  <Link to="/login" className="btn btn-primary">
                    Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h2 className="text-primary">Welcome, {user.name}!</h2>
                    <p>Your ultimate tool for managing company salaries.</p>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-3">{user?.email}</span>
                    <Link to="/" className="me-3 text-dark">
                      <FiUser size={24} />
                    </Link>
                    <button
                      className="btn btn-outline-dark"
                      onClick={handleSignOut}
                    >
                      <FiLogOut size={24} />
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <Link to="/companies" className="btn btn-outline-dark">
                    View Companies
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
