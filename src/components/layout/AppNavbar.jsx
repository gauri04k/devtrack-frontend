import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import { FaTachometerAlt, FaBook, FaProjectDiagram, FaHistory, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

function AppNavbar() {
    const { auth, logout, } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };


    return (
        <Navbar expand="lg" bg="dark" data-bs-theme="dark" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
                    DevTrack
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">

                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/dashboard">
                            <FaTachometerAlt className="me-2" />
                            Dashboard
                        </Nav.Link>

                        <Nav.Link as={Link} to="/skills">
                            <FaBook className="me-2" />
                            Skills
                        </Nav.Link>

                        <Nav.Link as={Link} to="/projects">
                            <FaProjectDiagram className="me-2" />
                            Projects
                        </Nav.Link>

                        <Nav.Link as={Link} to="/daily-logs">
                            <FaHistory className="me-2" />
                            Daily Logs
                        </Nav.Link>
                    </Nav>


                    <Nav className="align-items-lg-center">
                        <Navbar.Text className="me-lg-3">
                            {auth?.name || "Developer"}
                        </Navbar.Text>


                        <Button variant="outline-light" size="sm" onClick={handleLogout}>
                            <FaSignOutAlt className="me-2" />
                            Logout
                        </Button>
                    </Nav>
                </Navbar.Collapse>

            </Container>
        </Navbar>
    );
}
export default AppNavbar;