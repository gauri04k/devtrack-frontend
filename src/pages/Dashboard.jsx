import {
    Button,
    Card,
    Col,
    Container,
    Row,
    Alert,
    Spinner,
} from "react-bootstrap";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import axiosClient from "../services/axiosClient";

function Dashboard() {

    const navigate = useNavigate();

    const {
        auth,
        logout,
    } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchDashboard = async () => {

            if (!auth?.userId) {
                console.log("No userId found in auth");
                setLoading(false);
                return;
            }

            console.log(
                "Calling Dashboard API for user:",
                auth.userId
            );

            try {

                const response = await axiosClient.get(
                    `/api/users/${auth.userId}/dashboard`
                );

                console.log(
                    "Dashboard API response:",
                    response.data
                );

                setDashboard(response.data);

            } catch (err) {

                console.error(
                    "Dashboard API error:",
                    err
                );

                if (err.response) {
                    console.error(
                        "Status:",
                        err.response.status
                    );

                    console.error(
                        "Response:",
                        err.response.data
                    );
                }

                setError(
                    "Unable to load dashboard data."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchDashboard();

    }, [auth?.userId]);


    const handleLogout = () => {

        logout();

        navigate("/login", {
            replace: true,
        });
    };


    return (
        <Container className="py-5">

            <Row className="justify-content-center">

                <Col
                    xs={12}
                    md={10}
                    lg={8}
                >

                    <Card className="border-0 shadow-sm">

                        <Card.Body className="p-4">

                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <div>

                                    <h2 className="fw-bold mb-1">
                                        Dashboard
                                    </h2>

                                    <p className="text-muted mb-0">
                                        Welcome to DevTrack
                                    </p>

                                </div>

                                <Button
                                    variant="outline-danger"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>

                            </div>

                            <hr />


                            <h5>
                                Authentication working successfully 
                            </h5>

                            <p className="mb-1">
                                <strong>Name:</strong>{" "}
                                {auth?.name || "User"}
                            </p>

                            <p className="mb-1">
                                <strong>Email:</strong>{" "}
                                {auth?.email || "N/A"}
                            </p>

                            <p className="mb-3">
                                <strong>User ID:</strong>{" "}
                                {auth?.userId || "N/A"}
                            </p>


                            <hr />


                            {/* Dashboard API */}

                            <h5 className="mb-3">
                                Dashboard Data
                            </h5>


                            {loading && (
                                <div>
                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />

                                    Loading dashboard...
                                </div>
                            )}


                            {error && (
                                <Alert variant="danger">
                                    {error}
                                </Alert>
                            )}


                            {!loading && !error && dashboard && (
                                <Card className="bg-light border-0">

                                    <Card.Body>

                                        <pre className="mb-0">
                                            {JSON.stringify(
                                                dashboard,
                                                null,
                                                2
                                            )}
                                        </pre>

                                    </Card.Body>

                                </Card>
                            )}


                        </Card.Body>

                    </Card>

                </Col>

            </Row>

        </Container>
    );
}

export default Dashboard;