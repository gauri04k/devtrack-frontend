import { useEffect, useState, } from "react";

import { Alert, Button, Card, Col, Container, Form, Modal, Row, Spinner, } from "react-bootstrap";

import { FaEdit, FaPlus, FaTrash, FaProjectDiagram, } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/layout/AppNavbar";
import projectService from "../services/projectService";


function Projects() {
    const { auth, } = useAuth();
    const [projects, setProjects,] = useState([]);

    const [loading, setLoading,] = useState(true);
    const [error, setError,] = useState("");

    const [success, setSuccess,] = useState("");
    const [statusFilter, setStatusFilter,] = useState("ALL");

    const [showModal, setShowModal,] = useState(false);

    const [editingProject, setEditingProject,] = useState(null);

    const [formData, setFormData,] = useState({
        title: "",
        description: "",
        status: "ACTIVE",
    });

    const [submitting, setSubmitting,] = useState(false);

    const [deletingId, setDeletingId,] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, [auth?.userId, statusFilter]);


    const fetchProjects = async () => {
        if (!auth?.userId) {
            setError("Unable to identify the logged-in user.");
            setLoading(false);

            return;
        }


        try {
            setLoading(true);
            setError("");
            console.log("PROJECTS USER ID:", auth.userId);

            let data;
            if (statusFilter === "ALL") {

                data = await projectService.getAllProjects(auth.userId);

            } else {
                data = await projectService.getProjectsByStatus(auth.userId, statusFilter);
            }

            console.log("PROJECTS API RESPONSE:", data);


            setProjects(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error("Projects API error:", err);
            console.error("Projects API response:", err.response?.data);

            setError(err.response?.data?.message || "Unable to load projects.");

        } finally {
            setLoading(false);

        }

    };
    const handleAddProject = () => {
        setEditingProject(null);
        setFormData({
            title: "", description: "", status: "ACTIVE",
        });

        setError("");
        setSuccess("");
        setShowModal(true);

    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setFormData({
            title: project.title || "",
            description: project.description || "",
            status: project.status || "ACTIVE",
        });


        setError("");
        setSuccess("");
        setShowModal(true);

    };

    const handleCloseModal = () => {
        if (submitting) {
            return;
        }


        setShowModal(false);
        setEditingProject(null);
        setFormData({

            title: "",
            description: "",
            status: "ACTIVE",

        });

    };

    const handleChange = (event) => {

        const { name, value, } = event.target;
        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (!formData.title.trim()) {
            setError("Project title is required.");
            return;
        }


        try {
            setSubmitting(true);
            if (editingProject) {
                console.log("UPDATING PROJECT:", editingProject.id);


                await projectService.updateProject(
                    auth.userId,
                    editingProject.id,
                    {
                        title: formData.title.trim(),
                        description: formData.description.trim(),
                        status: formData.status,
                    }

                );

                setSuccess("Project updated successfully.");
            } else {

                console.log("CREATING PROJECT");
                await projectService.createProject(
                    auth.userId,
                    {

                        title: formData.title.trim(),
                        description: formData.description.trim(),
                        status: formData.status,

                    }

                );


                setSuccess("Project created successfully.");

            }


            setShowModal(false);
            setEditingProject(null);
            setFormData({
                title: "",
                description: "",
                status: "ACTIVE",
            });

            await fetchProjects();

        } catch (err) {

            console.error("Save project error:", err);
            console.error("Save project response:", err.response?.data);
            setError(err.response?.data?.message || err.response?.data || "Unable to save project.");

        } finally {
            setSubmitting(false);
        }

    };

    const handleDeleteProject = async (projectId) => {

        const confirmed = window.confirm("Are you sure you want to delete this project?");


        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(projectId);
            setError("");
            setSuccess("");


            console.log("DELETING PROJECT:", projectId);


            await projectService.deleteProject(auth.userId, projectId);


            setSuccess("Project deleted successfully.");

            await fetchProjects();
        } catch (err) {
            console.error("Delete project error:", err);
            console.error("Delete project response:", err.response?.data);


            setError(err.response?.data?.message || err.response?.data || "Unable to delete project.");

        } finally {
            setDeletingId(null);
        }

    };

    const getStatusClass = (status) => {
        switch (status) {
            case "ACTIVE":
                return "bg-primary";

            case "COMPLETED":
                return "bg-success";

            case "ON_HOLD":
                return "bg-warning text-dark";

            default:
                return "bg-secondary";

        }

    };

    const activeCount = projects.filter((project) => project.status === "ACTIVE").length;
    const completedCount = projects.filter((project) => project.status === "COMPLETED").length;
    const onHoldCount = projects.filter((project) => project.status === "ON_HOLD").length;


    return (
        <>
            <AppNavbar />
            <Container className="py-4 py-lg-5">

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <div>
                        <h1 className="fw-bold mb-1"> Projects</h1>
                        <p className="text-muted mb-0">Manage your projects and track their progress.</p>
                    </div>


                    <Button variant="primary" onClick={handleAddProject}>
                        <FaPlus className="me-2" />
                        Add Project
                    </Button>
                </div>

                {success && (
                    <Alert variant="success" dismissible onClose={() =>
                        setSuccess("")
                    }
                    >
                        {success}
                    </Alert>

                )}
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                <Row className="g-4 mb-4">
                    <Col xs={12} md={4}>

                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="text-muted small">
                                    Active Projects
                                </div>


                                <div className="fs-2 fw-bold text-primary">
                                    {activeCount}
                                </div>

                            </Card.Body>
                        </Card>
                    </Col>


                    <Col xs={12} md={4}>

                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="text-muted small">
                                    Completed Projects
                                </div>


                                <div className="fs-2 fw-bold text-success">
                                    {completedCount}
                                </div>

                            </Card.Body>
                        </Card>

                    </Col>


                    <Col xs={12} md={4}>

                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="text-muted small">
                                    On Hold
                                </div>


                                <div className="fs-2 fw-bold text-warning">
                                    {onHoldCount}
                                </div>

                            </Card.Body>

                        </Card>

                    </Col>

                </Row>

                <Card className="border-0 shadow-sm mb-4">

                    <Card.Body>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                            <div>
                                <h5 className="fw-bold mb-1">My Projects</h5>


                                <small className="text-muted">
                                    Filter projects by their current status.
                                </small>

                            </div>


                            <div className="d-flex gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    variant={
                                        statusFilter === "ALL"
                                            ? "primary"
                                            : "outline-primary"
                                    } onClick={() =>
                                        setStatusFilter("ALL")
                                    }
                                >
                                    All
                                </Button>


                                <Button
                                    size="sm"
                                    variant={
                                        statusFilter === "ACTIVE"
                                            ? "primary"
                                            : "outline-primary"
                                    }
                                    onClick={() =>
                                        setStatusFilter("ACTIVE")
                                    }
                                >
                                    Active

                                </Button>


                                <Button
                                    size="sm"
                                    variant={
                                        statusFilter === "COMPLETED"
                                            ? "success"
                                            : "outline-success"
                                    }
                                    onClick={() =>
                                        setStatusFilter("COMPLETED")
                                    }
                                >

                                    Completed

                                </Button>


                                <Button
                                    size="sm"
                                    variant={
                                        statusFilter === "ON_HOLD"
                                            ? "warning"
                                            : "outline-warning"
                                    }
                                    onClick={() =>
                                        setStatusFilter("ON_HOLD")
                                    }
                                >

                                    On Hold

                                </Button>

                            </div>

                        </div>

                    </Card.Body>

                </Card>

                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" />

                        <p className="text-muted mt-3">
                            Loading projects...

                        </p>

                    </div>

                )}

                {!loading && !error && projects.length === 0 && (

                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center py-5">
                            <FaProjectDiagram size={45} className="text-muted mb-3" />


                            <h5 className="fw-bold">
                                No Projects Found
                            </h5>


                            <p className="text-muted">
                                You haven't added any projects yet.
                            </p>

                            <Button variant="primary" onClick={handleAddProject}>
                                <FaPlus className="me-2" />
                                Add Your First Project

                            </Button>
                        </Card.Body>

                    </Card>
                )}

                {!loading && projects.length > 0 && (

                    <Row className="g-4">
                        {projects.map(
                            (project) => (

                                <Col xs={12} md={6} lg={4} key={project.id}>

                                    <Card className="border-0 shadow-sm h-100">
                                        <Card.Body className="d-flex flex-column">

                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <h5 className="fw-bold mb-0">
                                                    {project.title}

                                                </h5>


                                                <span className={`badge ${getStatusClass(project.status)}`}>
                                                    {project.status === "ON_HOLD" ? "ON HOLD" : project.status}
                                                </span>

                                            </div>


                                            <p className="text-muted flex-grow-1">{project.description ? project.description : "No description provided."}</p>

                                            <div className="d-flex gap-2 mt-3">

                                                <Button variant="outline-primary" className="flex-grow-1" onClick={() => handleEditProject(project)}>
                                                    <FaEdit className="me-2" /> Edit
                                                </Button>

                                                <Button variant="outline-danger" onClick={() => handleDeleteProject(project.id)} disabled={deletingId === project.id}>

                                                    {deletingId === project.id ? (
                                                        <Spinner size="sm" animation="border" />
                                                    ) : (
                                                        <FaTrash />
                                                    )}

                                                </Button>

                                            </div>

                                        </Card.Body>

                                    </Card>

                                </Col>

                            )
                        )}

                    </Row>

                )}

            </Container>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">
                        {editingProject ? "Edit Project" : "Add Project"}
                    </Modal.Title>
                </Modal.Header>


                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label> Project Title </Form.Label>
                            <Form.Control type="text" name="title" value={formData.title}
                                onChange={handleChange} placeholder="Enter project title" minLength={3} maxLength={150} required disabled={submitting} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={4} name="description" value={formData.description}
                                onChange={handleChange} placeholder="Describe your project..." disabled={submitting} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status </Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange} disabled={submitting}>
                                <option value="ACTIVE">
                                    Active
                                </option>


                                <option value="COMPLETED">
                                    Completed
                                </option>


                                <option value="ON_HOLD">
                                    On Hold
                                </option>

                            </Form.Select>

                        </Form.Group>

                    </Modal.Body>


                    <Modal.Footer>

                        <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                            Cancel
                        </Button>


                        <Button variant="primary" type="submit" disabled={submitting}>

                            {submitting ? (
                                <>
                                    <Spinner size="sm" animation="border" className="me-2" />
                                    Saving...
                                </>

                            ) : (
                                editingProject ? "Update Project" : "Create Project"
                            )}

                        </Button>
                    </Modal.Footer>
                </Form>

            </Modal>

        </>
    );

}


export default Projects;