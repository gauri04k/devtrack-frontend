import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();

    const { register, loading } = useAuth();
    const [formData, setFormData] = useState({ name: "", email: "", password: "", });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        setSuccess("");

        try {

            await register(formData);
            setSuccess("Registration successful. Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {

            console.error(error);
            setError(error.response?.data?.message || "Registration failed.");
        }
    };

    return (
        <div className="auth-page">
            <div className="card shadow auth-card">
                <div className="card-body p-4 p-md-5">
                    <div className="text-center mb-4">
                        <h1 className="fw-bold">Create Account</h1>

                        <p className="text-muted"> Start tracking your developer journey</p>

                    </div>

                    {error && (<div className="alert alert-danger">{error}</div>)}

                    {success && (<div className="alert alert-success">{success}</div>)}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label"> Name </label>
                            <input id="name" name="name" type="text" className="form-control" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label"> Email </label>
                            <input id="email" name="email" type="email" className="form-control" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>

                            <input id="password" name="password" type="password" className="form-control" value={formData.password} onChange={handleChange} placeholder="Minimum 8 characters" minLength="8" required />
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={loading} >

                            {loading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                    />
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}

                        </button>

                    </form>

                    <div className="text-center mt-4">

                        <span className="text-muted">
                            Already have an account?
                        </span>{" "}

                        <Link to="/login">
                            Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;