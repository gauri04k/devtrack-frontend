import { Button, Card, Col, Container, Row, Alert, Spinner, } from "react-bootstrap";
import { useEffect, useState, } from "react";
import { Link, } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import AppNavbar from "../components/layout/AppNavbar";
import dashboardService from "../services/dashboardService";


function Dashboard() {
    const { auth, } = useAuth();
    const [dashboard, setDashboard,] = useState(null);
    const [loading, setLoading,] = useState(true);
    const [error, setError,] = useState("");


    useEffect(() => {

        const fetchDashboard = async () => {
            console.log("DASHBOARD AUTH:", auth);

            if (!auth?.userId) {
                console.error("No userId found in auth.");
                setError("Unable to identify the logged-in user.")
                setLoading(false);

                return;
            }


            try {
                console.log("DASHBOARD USER ID:", auth.userId);
                const data = await dashboardService.getDashboard(auth.userId);

                console.log("DASHBOARD API RESPONSE:", data);
                setDashboard(data);

            } catch (err) {

                console.error("Dashboard API error:", err);
                console.error("Dashboard API response:", err.response?.data);

                setError(err.response?.data?.message || "Unable to load dashboard.");

            } finally {
                setLoading(false);
            }

        };
        fetchDashboard();
    }, [auth?.userId]);


    return (
        <>
            <AppNavbar />
            <Container className="py-4 py-lg-5">
                <div className="mb-4">

                    <h1 className="fw-bold mb-1">Welcome, {auth?.name || "Developer"}</h1>
                    <p className="text-muted mb-0">
                        Track your learning progress and
                        keep building your developer journey.
                    </p>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                        <p className="text-muted mt-3">
                            Loading dashboard...
                        </p>
                    </div>

                )}

                {error && (<Alert variant="danger">{error}</Alert>)}

                {!loading && !error && dashboard && (
                    <>
                        <Row className="g-4 mb-4">
                            <Col xs={12} md={6} lg={3}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>

                                        <div className="text-muted small">
                                            Learning Skills
                                        </div>

                                        <div className="fs-2 fw-bold text-primary">
                                            {dashboard.learningSkills ?? 0}

                                        </div>

                                    </Card.Body>

                                </Card>

                            </Col>

                            <Col xs={12} md={6} lg={3}>

                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="text-muted small">
                                            Completed Skills
                                        </div>


                                        <div className="fs-2 fw-bold text-success">
                                            {dashboard.completedSkills ?? 0}
                                        </div>

                                    </Card.Body>
                                </Card>

                            </Col>

                            <Col xs={12} md={6} lg={3}>

                                <Card className="border-0 shadow-sm h-100">

                                    <Card.Body>
                                        <div className="text-muted small"> Weekly Hours</div>

                                        <div className="fs-2 fw-bold">
                                            {dashboard.weeklyHours ?? 0}
                                        </div>

                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} md={6} lg={3}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="text-muted small">
                                            Active Projects
                                        </div>

                                        <div className="fs-2 fw-bold">
                                            {dashboard.activeProjects ?? 0}
                                        </div>

                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row className="g-4">
                            <Col xs={12} lg={8}>

                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">

                                            <div>
                                                <h5 className="fw-bold mb-1">Recent Activity</h5>
                                                <small className="text-muted">
                                                    Your latest learning sessions
                                                </small>
                                            </div>
                                        </div>
                                        {dashboard.recentActivity?.length ? (
                                            <div className="table-responsive">
                                                <table className="table align-middle mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Topic</th>
                                                            <th>Hours</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>


                                                    <tbody>
                                                        {dashboard.recentActivity.map((activity) => (
                                                            <tr key={activity.id}>
                                                                <td className="fw-semibold">{activity.topic}</td>
                                                                <td>{activity.hours}</td>
                                                                <td>{activity.logDate}</td>
                                                            </tr>
                                                        )
                                                        )}

                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (

                                            <p className="text-muted mb-0">
                                                No recent activity.
                                            </p>
                                        )}

                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} lg={4}>

                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="d-flex flex-column">
                                        <h5 className="fw-bold">
                                            Continue Learning
                                        </h5>

                                        <p className="text-muted">
                                            Manage the skills you are
                                            currently learning.
                                        </p>

                                        <Button as={Link} to="/skills" variant="primary" className="mt-auto" >
                                            Manage Skills
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>

                )}

            </Container>

        </>
    );
}

export default Dashboard;