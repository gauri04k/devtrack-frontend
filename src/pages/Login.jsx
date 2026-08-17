import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();

    const { login, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            await login(formData);
            navigate("/dashboard", {
                replace: true,
            });

        } catch (error) {

            console.error(error);

            setError(error.response?.data?.message || "Invalid email or password.");
        }
    };

    return (
        <div className="auth-page">
            <div className="card shadow auth-card">
                <div className="card-body p-4 p-md-5">

                    <div className="text-center mb-4">

                        <h1 className="fw-bold">DevTrack</h1>

                        <p className="text-muted"> Personal Developer Progress Tracker</p>

                    </div>

                    {error && (<div className="alert alert-danger"> {error} </div>)}

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input id="email" name="email" type="email" className="form-control" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />

                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label"> Password</label>
                            <input id="password" name="password" type="password" className="form-control" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>

                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}

                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <span className="text-muted"> Don't have an account?</span>{" "}
                        <Link to="/register"> Create account</Link>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;