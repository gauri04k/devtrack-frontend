import { useEffect, useState } from "react";

import { Alert, Button, Card, Col, Container, Form, Modal, Row, Spinner, } from "react-bootstrap";

import { FaEdit, FaPlus, FaTrash, FaProjectDiagram, FaTasks, FaChevronDown, FaChevronUp, } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/layout/AppNavbar";

import projectService from "../services/projectService";
import milestoneService from "../services/milestoneService";


function Projects() {

    const { auth } = useAuth();

    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showProjectModal, setShowProjectModal] = useState(false);

    const [editingProject, setEditingProject] = useState(null);

    const [projectFormData, setProjectFormData] = useState({
        title: "",
        description: "",
        status: "ACTIVE",
    });

    const [submittingProject, setSubmittingProject] = useState(false);

    const [deletingProjectId, setDeletingProjectId] = useState(null);

    const [expandedProjects, setExpandedProjects] = useState({});

    const [milestones, setMilestones] = useState({});

    const [milestoneLoading, setMilestoneLoading] = useState({});

    const [milestoneError, setMilestoneError] = useState({});

    const [showMilestoneModal, setShowMilestoneModal] = useState(false);

    const [editingMilestone, setEditingMilestone] = useState(null);

    const [selectedProject, setSelectedProject] = useState(null);

    const [milestoneFormData, setMilestoneFormData] = useState({
        title: "",
        status: "PENDING",
        dueDate: "",
    });

    const [submittingMilestone, setSubmittingMilestone] = useState(false);

    const [deletingMilestoneId, setDeletingMilestoneId] = useState(null);


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

                data = await projectService.getProjectsByStatus(
                    auth.userId,
                    statusFilter
                );
            }

            console.log("PROJECTS API RESPONSE:", data);

            setProjects(Array.isArray(data) ? data : []);

        } catch (err) {

            console.error("Projects API error:", err);

            console.error(
                "Projects API response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                "Unable to load projects."
            );

        } finally {

            setLoading(false);

        }
    };

    const fetchMilestones = async (projectId) => {

        try {

            setMilestoneLoading((previous) => ({
                ...previous,
                [projectId]: true,
            }));

            setMilestoneError((previous) => ({
                ...previous,
                [projectId]: "",
            }));

            console.log(
                "MILESTONE PROJECT ID:",
                projectId
            );

            const data =
                await milestoneService.getMilestones(projectId);

            console.log(
                "MILESTONES API RESPONSE:",
                data
            );

            setMilestones((previous) => ({
                ...previous,
                [projectId]: Array.isArray(data) ? data : [],
            }));

        } catch (err) {

            console.error(
                "Milestones API error:",
                err
            );

            console.error(
                "Milestones API response:",
                err.response?.data
            );

            setMilestoneError((previous) => ({
                ...previous,
                [projectId]:
                    err.response?.data?.message ||
                    "Unable to load milestones.",
            }));

        } finally {

            setMilestoneLoading((previous) => ({
                ...previous,
                [projectId]: false,
            }));

        }
    };


    const toggleMilestones = async (projectId) => {

        const currentlyExpanded =
            expandedProjects[projectId];

        setExpandedProjects((previous) => ({
            ...previous,
            [projectId]: !currentlyExpanded,
        }));

        if (!currentlyExpanded) {

            await fetchMilestones(projectId);

        }
    };


    const handleAddProject = () => {

        setEditingProject(null);

        setProjectFormData({
            title: "",
            description: "",
            status: "ACTIVE",
        });

        setError("");

        setSuccess("");

        setShowProjectModal(true);
    };


    const handleEditProject = (project) => {

        setEditingProject(project);

        setProjectFormData({
            title: project.title || "",
            description: project.description || "",
            status: project.status || "ACTIVE",
        });

        setError("");

        setSuccess("");

        setShowProjectModal(true);
    };


    const handleCloseProjectModal = () => {

        if (submittingProject) {
            return;
        }

        setShowProjectModal(false);

        setEditingProject(null);

        setProjectFormData({
            title: "",
            description: "",
            status: "ACTIVE",
        });
    };


    const handleProjectChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setProjectFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleProjectSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccess("");

        if (!projectFormData.title.trim()) {

            setError("Project title is required.");

            return;
        }

        try {

            setSubmittingProject(true);

            if (editingProject) {

                console.log(
                    "UPDATING PROJECT:",
                    editingProject.id
                );

                await projectService.updateProject(
                    auth.userId,
                    editingProject.id,
                    {
                        title:
                            projectFormData.title.trim(),

                        description:
                            projectFormData.description.trim(),

                        status:
                            projectFormData.status,
                    }
                );

                setSuccess(
                    "Project updated successfully."
                );

            } else {

                console.log(
                    "CREATING PROJECT"
                );

                await projectService.createProject(
                    auth.userId,
                    {
                        title:
                            projectFormData.title.trim(),

                        description:
                            projectFormData.description.trim(),

                        status:
                            projectFormData.status,
                    }
                );

                setSuccess(
                    "Project created successfully."
                );
            }

            setShowProjectModal(false);

            setEditingProject(null);

            setProjectFormData({
                title: "",
                description: "",
                status: "ACTIVE",
            });

            await fetchProjects();

        } catch (err) {

            console.error(
                "Save project error:",
                err
            );

            console.error(
                "Save project response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to save project."
            );

        } finally {

            setSubmittingProject(false);

        }
    };


    const handleDeleteProject = async (projectId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingProjectId(projectId);

            setError("");

            setSuccess("");

            console.log(
                "DELETING PROJECT:",
                projectId
            );

            await projectService.deleteProject(
                auth.userId,
                projectId
            );

            setSuccess(
                "Project deleted successfully."
            );

            await fetchProjects();

        } catch (err) {

            console.error(
                "Delete project error:",
                err
            );

            console.error(
                "Delete project response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to delete project."
            );

        } finally {

            setDeletingProjectId(null);

        }
    };


    /* =========================
       MILESTONE HANDLERS
    ========================= */

    const handleAddMilestone = (project) => {

        setSelectedProject(project);

        setEditingMilestone(null);

        setMilestoneFormData({
            title: "",
            status: "PENDING",
            dueDate: "",
        });

        setError("");

        setSuccess("");

        setShowMilestoneModal(true);
    };


    const handleEditMilestone = (project, milestone) => {

        setSelectedProject(project);

        setEditingMilestone(milestone);

        setMilestoneFormData({
            title: milestone.title || "",
            status: milestone.status || "PENDING",
            dueDate: milestone.dueDate || "",
        });

        setError("");

        setSuccess("");

        setShowMilestoneModal(true);
    };


    const handleCloseMilestoneModal = () => {

        if (submittingMilestone) {
            return;
        }

        setShowMilestoneModal(false);

        setSelectedProject(null);

        setEditingMilestone(null);

        setMilestoneFormData({
            title: "",
            status: "PENDING",
            dueDate: "",
        });
    };


    const handleMilestoneChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setMilestoneFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleMilestoneSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccess("");

        if (!milestoneFormData.title.trim()) {

            setError(
                "Milestone title is required."
            );

            return;
        }

        if (!selectedProject) {

            setError(
                "Project information is missing."
            );

            return;
        }

        try {

            setSubmittingMilestone(true);

            const milestoneData = {
                title:
                    milestoneFormData.title.trim(),

                status:
                    milestoneFormData.status,

                dueDate:
                    milestoneFormData.dueDate || null,
            };


            if (editingMilestone) {

                console.log(
                    "UPDATING MILESTONE:",
                    editingMilestone.id
                );

                await milestoneService.updateMilestone(
                    editingMilestone.id,
                    milestoneData
                );

                setSuccess(
                    "Milestone updated successfully."
                );

            } else {

                console.log(
                    "CREATING MILESTONE FOR PROJECT:",
                    selectedProject.id
                );

                await milestoneService.createMilestone(
                    selectedProject.id,
                    milestoneData
                );

                setSuccess(
                    "Milestone created successfully."
                );
            }


            setShowMilestoneModal(false);

            setEditingMilestone(null);

            setSelectedProject(null);

            setMilestoneFormData({
                title: "",
                status: "PENDING",
                dueDate: "",
            });


            await fetchMilestones(
                editingMilestone
                    ? selectedProject.id
                    : selectedProject.id
            );

        } catch (err) {

            console.error(
                "Save milestone error:",
                err
            );

            console.error(
                "Save milestone response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to save milestone."
            );

        } finally {

            setSubmittingMilestone(false);

        }
    };


    const handleDeleteMilestone = async (
        projectId,
        milestoneId
    ) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this milestone?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingMilestoneId(milestoneId);

            setError("");

            setSuccess("");

            console.log(
                "DELETING MILESTONE:",
                milestoneId
            );

            await milestoneService.deleteMilestone(
                milestoneId
            );

            setSuccess(
                "Milestone deleted successfully."
            );

            await fetchMilestones(projectId);

        } catch (err) {

            console.error(
                "Delete milestone error:",
                err
            );

            console.error(
                "Delete milestone response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to delete milestone."
            );

        } finally {

            setDeletingMilestoneId(null);

        }
    };


    /* =========================
       STATUS STYLES
    ========================= */

    const getProjectStatusClass = (status) => {

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


    const getMilestoneStatusClass = (status) => {

        switch (status) {

            case "DONE":
                return "bg-success";

            case "IN_PROGRESS":
                return "bg-primary";

            case "PENDING":
                return "bg-secondary";

            default:
                return "bg-secondary";
        }
    };


    const getMilestoneStatusText = (status) => {

        switch (status) {

            case "IN_PROGRESS":
                return "IN PROGRESS";

            case "DONE":
                return "DONE";

            case "PENDING":
                return "PENDING";

            default:
                return status;
        }
    };

    const activeCount =
        projects.filter(
            (project) =>
                project.status === "ACTIVE"
        ).length;


    const completedCount =
        projects.filter(
            (project) =>
                project.status === "COMPLETED"
        ).length;


    const onHoldCount =
        projects.filter(
            (project) =>
                project.status === "ON_HOLD"
        ).length;

    return (
        <>
            <AppNavbar />

            <Container className="py-4 py-lg-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                    <div>

                        <h1 className="fw-bold mb-1">
                            Projects
                        </h1>

                        <p className="text-muted mb-0">
                            Manage your projects and track their progress.
                        </p>

                    </div>


                    <Button
                        variant="primary"
                        onClick={handleAddProject}
                    >
                        <FaPlus className="me-2" />
                        Add Project
                    </Button>

                </div>
                {success && (

                    <Alert
                        variant="success"
                        dismissible
                        onClose={() =>
                            setSuccess("")
                        }
                    >
                        {success}
                    </Alert>

                )}


                {error && (

                    <Alert
                        variant="danger"
                        dismissible
                        onClose={() =>
                            setError("")
                        }
                    >
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

                                <h5 className="fw-bold mb-1">
                                    My Projects
                                </h5>

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
                                    }
                                    onClick={() =>
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


                {/* ================= LOADING ================= */}

                {loading && (

                    <div className="text-center py-5">

                        <Spinner animation="border" />

                        <p className="text-muted mt-3">
                            Loading projects...
                        </p>

                    </div>

                )}


                {!loading &&
                    !error &&
                    projects.length === 0 && (

                        <Card className="border-0 shadow-sm">

                            <Card.Body className="text-center py-5">

                                <FaProjectDiagram
                                    size={45}
                                    className="text-muted mb-3"
                                />

                                <h5 className="fw-bold">
                                    No Projects Found
                                </h5>

                                <p className="text-muted">
                                    You haven't added any projects yet.
                                </p>

                                <Button
                                    variant="primary"
                                    onClick={handleAddProject}
                                >
                                    <FaPlus className="me-2" />
                                    Add Your First Project
                                </Button>

                            </Card.Body>

                        </Card>
                    )}

                {!loading &&
                    projects.length > 0 && (

                        <Row className="g-4">

                            {projects.map((project) => {

                                const projectMilestones =
                                    milestones[project.id] || [];

                                const isExpanded =
                                    expandedProjects[project.id];

                                return (

                                    <Col
                                        xs={12}
                                        md={6}
                                        lg={4}
                                        key={project.id}
                                    >

                                        <Card className="border-0 shadow-sm h-100">

                                            <Card.Body className="d-flex flex-column">


                                                <div className="d-flex justify-content-between align-items-start mb-3">

                                                    <h5 className="fw-bold mb-0">

                                                        {project.title}

                                                    </h5>


                                                    <span
                                                        className={`badge ${getProjectStatusClass(
                                                            project.status
                                                        )}`}
                                                    >

                                                        {project.status ===
                                                            "ON_HOLD"
                                                            ? "ON HOLD"
                                                            : project.status}

                                                    </span>

                                                </div>

                                                <p className="text-muted">

                                                    {project.description
                                                        ? project.description
                                                        : "No description provided."}

                                                </p>

                                                <Card
                                                    className="border mt-2 mb-3"
                                                >

                                                    <Card.Body className="p-3">

                                                        <div className="d-flex justify-content-between align-items-center">

                                                            <div className="d-flex align-items-center">

                                                                <FaTasks className="text-primary me-2" />

                                                                <strong>
                                                                    Milestones
                                                                </strong>

                                                                {isExpanded &&
                                                                    milestones[
                                                                    project.id
                                                                    ] && (

                                                                        <span className="badge bg-light text-dark ms-2">

                                                                            {
                                                                                projectMilestones.length
                                                                            }

                                                                        </span>
                                                                    )}

                                                            </div>


                                                            <div className="d-flex gap-1">

                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleAddMilestone(
                                                                            project
                                                                        )
                                                                    }
                                                                    title="Add Milestone"
                                                                >
                                                                    <FaPlus />
                                                                </Button>


                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        toggleMilestones(
                                                                            project.id
                                                                        )
                                                                    }
                                                                    title={
                                                                        isExpanded
                                                                            ? "Hide Milestones"
                                                                            : "Show Milestones"
                                                                    }
                                                                >

                                                                    {isExpanded ? (
                                                                        <FaChevronUp />
                                                                    ) : (
                                                                        <FaChevronDown />
                                                                    )}

                                                                </Button>

                                                            </div>

                                                        </div>

                                                        {isExpanded && (

                                                            <div className="mt-3">

                                                                {milestoneLoading[
                                                                    project.id
                                                                ] && (

                                                                        <div className="text-center py-3">

                                                                            <Spinner
                                                                                animation="border"
                                                                                size="sm"
                                                                            />

                                                                            <div className="small text-muted mt-2">
                                                                                Loading milestones...
                                                                            </div>

                                                                        </div>

                                                                    )}


                                                                {milestoneError[
                                                                    project.id
                                                                ] && (

                                                                        <Alert
                                                                            variant="danger"
                                                                            className="small"
                                                                        >
                                                                            {
                                                                                milestoneError[
                                                                                project.id
                                                                                ]
                                                                            }
                                                                        </Alert>

                                                                    )}


                                                                {!milestoneLoading[
                                                                    project.id
                                                                ] &&
                                                                    !milestoneError[
                                                                    project.id
                                                                    ] &&
                                                                    projectMilestones.length ===
                                                                    0 && (

                                                                        <div className="text-center py-3">

                                                                            <div className="text-muted small mb-2">
                                                                                No milestones yet.
                                                                            </div>

                                                                            <Button
                                                                                size="sm"
                                                                                variant="primary"
                                                                                onClick={() =>
                                                                                    handleAddMilestone(
                                                                                        project
                                                                                    )
                                                                                }
                                                                            >
                                                                                <FaPlus className="me-1" />
                                                                                Add Milestone
                                                                            </Button>

                                                                        </div>

                                                                    )}


                                                                {!milestoneLoading[
                                                                    project.id
                                                                ] &&
                                                                    projectMilestones.length >
                                                                    0 && (

                                                                        <div>

                                                                            {projectMilestones.map(
                                                                                (
                                                                                    milestone
                                                                                ) => (

                                                                                    <div
                                                                                        key={
                                                                                            milestone.id
                                                                                        }
                                                                                        className="border rounded p-2 mb-2"
                                                                                    >

                                                                                        <div className="d-flex justify-content-between align-items-start gap-2">

                                                                                            <div className="flex-grow-1">

                                                                                                <div className="fw-semibold">

                                                                                                    {
                                                                                                        milestone.title
                                                                                                    }

                                                                                                </div>


                                                                                                {milestone.dueDate && (

                                                                                                    <small className="text-muted">

                                                                                                        Due:{" "}
                                                                                                        {
                                                                                                            milestone.dueDate
                                                                                                        }

                                                                                                    </small>

                                                                                                )}

                                                                                            </div>


                                                                                            <span
                                                                                                className={`badge ${getMilestoneStatusClass(
                                                                                                    milestone.status
                                                                                                )}`}
                                                                                            >

                                                                                                {getMilestoneStatusText(
                                                                                                    milestone.status
                                                                                                )}

                                                                                            </span>

                                                                                        </div>


                                                                                        <div className="d-flex gap-2 mt-2">

                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline-primary"
                                                                                                onClick={() =>
                                                                                                    handleEditMilestone(
                                                                                                        project,
                                                                                                        milestone
                                                                                                    )
                                                                                                }
                                                                                            >

                                                                                                <FaEdit className="me-1" />

                                                                                                Edit

                                                                                            </Button>


                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline-danger"
                                                                                                onClick={() =>
                                                                                                    handleDeleteMilestone(
                                                                                                        project.id,
                                                                                                        milestone.id
                                                                                                    )
                                                                                                }
                                                                                                disabled={
                                                                                                    deletingMilestoneId ===
                                                                                                    milestone.id
                                                                                                }
                                                                                            >

                                                                                                {deletingMilestoneId ===
                                                                                                    milestone.id ? (
                                                                                                    <Spinner
                                                                                                        animation="border"
                                                                                                        size="sm"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <FaTrash className="me-1" />
                                                                                                        Delete
                                                                                                    </>
                                                                                                )}

                                                                                            </Button>

                                                                                        </div>

                                                                                    </div>

                                                                                )
                                                                            )}

                                                                        </div>

                                                                    )}

                                                            </div>

                                                        )}

                                                    </Card.Body>

                                                </Card>


                                                <div className="d-flex gap-2 mt-auto">

                                                    <Button
                                                        variant="outline-primary"
                                                        className="flex-grow-1"
                                                        onClick={() =>
                                                            handleEditProject(
                                                                project
                                                            )
                                                        }
                                                    >

                                                        <FaEdit className="me-2" />

                                                        Edit

                                                    </Button>


                                                    <Button
                                                        variant="outline-danger"
                                                        onClick={() =>
                                                            handleDeleteProject(
                                                                project.id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingProjectId ===
                                                            project.id
                                                        }
                                                    >

                                                        {deletingProjectId ===
                                                            project.id ? (
                                                            <Spinner
                                                                size="sm"
                                                                animation="border"
                                                            />
                                                        ) : (
                                                            <FaTrash />
                                                        )}

                                                    </Button>

                                                </div>

                                            </Card.Body>

                                        </Card>

                                    </Col>

                                );

                            })}

                        </Row>

                    )}

            </Container>

            <Modal
                show={showProjectModal}
                onHide={handleCloseProjectModal}
                centered
            >

                <Modal.Header closeButton>

                    <Modal.Title className="fw-bold">

                        {editingProject
                            ? "Edit Project"
                            : "Add Project"}

                    </Modal.Title>

                </Modal.Header>


                <Form onSubmit={handleProjectSubmit}>

                    <Modal.Body>

                        <Form.Group className="mb-3">

                            <Form.Label>
                                Project Title
                            </Form.Label>

                            <Form.Control
                                type="text"
                                name="title"
                                value={
                                    projectFormData.title
                                }
                                onChange={
                                    handleProjectChange
                                }
                                placeholder="Enter project title"
                                minLength={3}
                                maxLength={150}
                                required
                                disabled={
                                    submittingProject
                                }
                            />

                        </Form.Group>


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Description
                            </Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                value={
                                    projectFormData.description
                                }
                                onChange={
                                    handleProjectChange
                                }
                                placeholder="Describe your project..."
                                disabled={
                                    submittingProject
                                }
                            />

                        </Form.Group>


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Status
                            </Form.Label>

                            <Form.Select
                                name="status"
                                value={
                                    projectFormData.status
                                }
                                onChange={
                                    handleProjectChange
                                }
                                disabled={
                                    submittingProject
                                }
                            >

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

                        <Button
                            variant="secondary"
                            onClick={
                                handleCloseProjectModal
                            }
                            disabled={
                                submittingProject
                            }
                        >
                            Cancel
                        </Button>


                        <Button
                            variant="primary"
                            type="submit"
                            disabled={
                                submittingProject
                            }
                        >

                            {submittingProject ? (

                                <>
                                    <Spinner
                                        size="sm"
                                        animation="border"
                                        className="me-2"
                                    />

                                    Saving...
                                </>

                            ) : (

                                editingProject
                                    ? "Update Project"
                                    : "Create Project"

                            )}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

            <Modal
                show={showMilestoneModal}
                onHide={
                    handleCloseMilestoneModal
                }
                centered
            >

                <Modal.Header closeButton>

                    <Modal.Title className="fw-bold">

                        {editingMilestone
                            ? "Edit Milestone"
                            : "Add Milestone"}

                    </Modal.Title>

                </Modal.Header>


                <Form onSubmit={handleMilestoneSubmit}>

                    <Modal.Body>

                        {selectedProject && (

                            <div className="bg-light rounded p-3 mb-3">

                                <small className="text-muted">
                                    Project
                                </small>

                                <div className="fw-bold">
                                    {selectedProject.title}
                                </div>

                            </div>

                        )}


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Milestone Title
                            </Form.Label>

                            <Form.Control
                                type="text"
                                name="title"
                                value={
                                    milestoneFormData.title
                                }
                                onChange={
                                    handleMilestoneChange
                                }
                                placeholder="e.g. Implement JWT Authentication"
                                minLength={2}
                                maxLength={150}
                                required
                                disabled={
                                    submittingMilestone
                                }
                            />

                        </Form.Group>


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Status
                            </Form.Label>

                            <Form.Select
                                name="status"
                                value={
                                    milestoneFormData.status
                                }
                                onChange={
                                    handleMilestoneChange
                                }
                                disabled={
                                    submittingMilestone
                                }
                            >

                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="IN_PROGRESS">
                                    In Progress
                                </option>

                                <option value="DONE">
                                    Done
                                </option>

                            </Form.Select>

                        </Form.Group>


                        <Form.Group className="mb-3">

                            <Form.Label>
                                Due Date
                            </Form.Label>

                            <Form.Control
                                type="date"
                                name="dueDate"
                                value={
                                    milestoneFormData.dueDate
                                }
                                onChange={
                                    handleMilestoneChange
                                }
                                disabled={
                                    submittingMilestone
                                }
                            />

                        </Form.Group>

                    </Modal.Body>


                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={
                                handleCloseMilestoneModal
                            }
                            disabled={
                                submittingMilestone
                            }
                        >
                            Cancel
                        </Button>


                        <Button
                            variant="primary"
                            type="submit"
                            disabled={
                                submittingMilestone
                            }
                        >

                            {submittingMilestone ? (

                                <>
                                    <Spinner
                                        size="sm"
                                        animation="border"
                                        className="me-2"
                                    />

                                    Saving...
                                </>

                            ) : (

                                editingMilestone
                                    ? "Update Milestone"
                                    : "Create Milestone"

                            )}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </>
    );
}


export default Projects;