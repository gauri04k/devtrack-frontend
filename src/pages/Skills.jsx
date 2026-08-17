import { Alert, Button, Card, Col, Container, Form, Modal, Row, Spinner, } from "react-bootstrap";

import { useCallback, useEffect, useMemo, useState, } from "react";

import AppNavbar from "../components/layout/AppNavbar";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import StatusBadge from "../components/common/StatusBadge";

import skillService from "../services/skillService";
import { useAuth } from "../context/AuthContext";


const STATUS_OPTIONS = [
    {
        value: "ALL",
        label: "All Skills",
    },
    {
        value: "LEARNING",
        label: "Learning",
    },
    {
        value: "COMPLETED",
        label: "Completed",
    },
    {
        value: "PAUSED",
        label: "Paused",
    },
];


const EMPTY_FORM = {
    name: "",
    status: "LEARNING",
    targetDate: "",
};

const getToday = () => {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const formatDate = (date) => {
    if (!date) { return "No target date"; }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(
        parsedDate.getTime()
    )) {
        return "Invalid date";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        { day: "2-digit", month: "2-digit", year: "numeric", }
    );
};


const Skills = () => {
    const { auth } = useAuth();
    const [skills, setSkills] = useState([]);

    const [activeFilter, setActiveFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingSkill, setEditingSkill] = useState(null);

    const [formData, setFormData] = useState(EMPTY_FORM);

    const today = useMemo(() => getToday(), []);


    const fetchSkills = useCallback(
        async (status = "") => {
            if (!auth?.userId) {
                setSkills([]);

                setError("Unable to identify the logged-in user.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {

                console.log("SKILLS USER ID:", auth.userId);

                console.log("SKILLS STATUS:", status || "ALL");
                const data = await skillService.getSkills(auth.userId, status);
                console.log("SKILLS API RESPONSE:", data);


                setSkills(Array.isArray(data) ? data : []);

            } catch (err) {
                console.error("Failed to fetch skills:", err);
                console.error("Skills API response:", err.response?.data);

                setSkills([]);

                setError(err.response?.data?.message || err.response?.data?.error || "Unable to load skills.");

            } finally {
                setLoading(false);
            }

        },
        [auth?.userId]
    );

    useEffect(() => {

        if (auth?.userId) {
            fetchSkills();
        }

    }, [
        auth?.userId,
        fetchSkills,
    ]);

    const handleFilterChange = async (
        status
    ) => {

        setActiveFilter(status);

        setSuccess("");
        setError("");

        await fetchSkills(
            status === "ALL"
                ? ""
                : status
        );
    };

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };


    const handleAddSkill = () => {

        setEditingSkill(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setError("");

        setSuccess("");

        setShowModal(true);
    };

    const handleEditSkill = (
        skill
    ) => {

        setEditingSkill(skill);

        setFormData({

            name:
                skill.name || "",

            status:
                skill.status || "LEARNING",

            targetDate:
                skill.targetDate || "",
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingSkill(null);
        setFormData({
            ...EMPTY_FORM,
        });
    };

    const validateForm = () => {

        const name = formData.name.trim();
        if (!name) {
            setError("Skill name is required.");
            return false;
        }


        if (name.length < 2) {
            setError("Skill name must contain at least 2 characters.");
            return false;
        }


        if (name.length > 100) {
            setError("Skill name cannot exceed 100 characters.");
            return false;
        }


        if (!formData.status) {
            setError("Please select a skill status.");
            return false;
        }


        if (formData.targetDate && formData.targetDate < today) {
            setError("Target date cannot be in the past.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {

        event.preventDefault();
        if (!auth?.userId) {
            setError("Unable to identify the logged-in user.");
            return;
        }


        if (!validateForm()) {
            return;
        }


        setSaving(true);
        setError("");
        setSuccess("");


        try {

            const payload = {
                name:
                    formData.name.trim(),

                status:
                    formData.status,

                targetDate:
                    formData.targetDate || null,
            };
            if (editingSkill) {
                console.log("UPDATING SKILL:", editingSkill.id);
                console.log("UPDATE PAYLOAD:", payload);

                await skillService.updateSkill(auth.userId, editingSkill.id, payload);
                setSuccess("Skill updated successfully.");

            }
            else {
                console.log("CREATING SKILL");
                console.log("CREATE PAYLOAD:", payload);
                await skillService.createSkill(auth.userId, payload);
                setSuccess("Skill added successfully.");
            }


            setShowModal(false);
            setEditingSkill(null);

            setFormData({
                ...EMPTY_FORM,
            });


            await fetchSkills(
                activeFilter === "ALL"
                    ? ""
                    : activeFilter
            );

        } catch (err) {

            console.error(
                "Skill save error:",
                err
            );

            console.error(
                "Backend error:",
                err.response?.data
            );


            const backendMessage =
                err.response?.data?.message;


            const backendError =
                err.response?.data?.error;


            if (
                err.response?.status === 400
            ) {

                setError(
                    backendMessage || backendError || "Invalid skill data. Please check the form."
                );

            } else if (
                err.response?.status === 404
            ) {

                setError(backendMessage || "User or skill was not found.");

            } else if (
                err.response?.status === 409
            ) {

                setError(backendMessage || "This skill already exists.");

            } else {

                setError(backendMessage || backendError || "Unable to save skill.");
            }

        } finally {

            setSaving(false);
        }
    };
    const handleDelete = async (
        skill
    ) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${skill.name}"?`
            );


        if (!confirmed) {
            return;
        }


        if (!auth?.userId) {

            setError(
                "Unable to identify the logged-in user."
            );

            return;
        }


        setDeletingId(skill.id);

        setError("");
        setSuccess("");


        try {

            console.log(
                "DELETING SKILL:",
                skill.id
            );


            await skillService.deleteSkill(
                auth.userId,
                skill.id
            );


            setSuccess(
                "Skill deleted successfully."
            );


            await fetchSkills(
                activeFilter === "ALL"
                    ? ""
                    : activeFilter
            );

        } catch (err) {

            console.error(
                "Skill delete error:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to delete skill."
            );

        } finally {

            setDeletingId(null);
        }
    };

    const statistics = useMemo(() => {

        return {

            total:
                skills.length,

            learning:
                skills.filter(
                    (skill) =>
                        skill.status === "LEARNING"
                ).length,

            completed:
                skills.filter(
                    (skill) =>
                        skill.status === "COMPLETED"
                ).length,

            paused:
                skills.filter(
                    (skill) =>
                        skill.status === "PAUSED"
                ).length,
        };

    }, [skills]);


    return (
        <>
            <AppNavbar />


            <main>

                <Container
                    className="py-4 py-lg-5"
                >
                    <div className="d-flexflex-columnflex-md-rowjustify-content-betweenalign-items-md-centergap-3mb-4">

                        <div>
                            <h1 className="fw-bold mb-1">Skills </h1>
                            <p className="text-muted mb-0"> Track the technologies and skills you are currently learning. </p>
                        </div>

                        <Button variant="primary" onClick={handleAddSkill} > + Add Skill</Button>
                    </div>

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
                    <Row className="g-3 mb-4">

                        <Col
                            xs={12}
                            sm={6}
                            lg={3}
                        >

                            <Card
                                className="
                                    border-0
                                    shadow-sm
                                    h-100
                                "
                            >

                                <Card.Body>

                                    <div className="text-muted small mb-2">
                                        Total Skills
                                    </div>

                                    <div className="fs-2 fw-bold">
                                        {statistics.total}
                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>


                        <Col
                            xs={12}
                            sm={6}
                            lg={3}
                        >

                            <Card
                                className="
                                    border-0
                                    shadow-sm
                                    h-100
                                "
                            >

                                <Card.Body>

                                    <div className="text-muted small mb-2">
                                        Learning
                                    </div>

                                    <div className="
                                        fs-2
                                        fw-bold
                                        text-primary
                                    ">
                                        {statistics.learning}
                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>


                        <Col
                            xs={12}
                            sm={6}
                            lg={3}
                        >

                            <Card
                                className="
                                    border-0
                                    shadow-sm
                                    h-100
                                "
                            >

                                <Card.Body>

                                    <div className="text-muted small mb-2">
                                        Completed
                                    </div>

                                    <div className="
                                        fs-2
                                        fw-bold
                                        text-success
                                    ">
                                        {statistics.completed}
                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>


                        <Col
                            xs={12}
                            sm={6}
                            lg={3}
                        >

                            <Card
                                className="
                                    border-0
                                    shadow-sm
                                    h-100
                                "
                            >

                                <Card.Body>

                                    <div className="text-muted small mb-2">
                                        Paused
                                    </div>

                                    <div className="
                                        fs-2
                                        fw-bold
                                        text-warning-emphasis
                                    ">
                                        {statistics.paused}
                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>

                    </Row>

                    <Card
                        className="
                            border-0
                            shadow-sm
                            mb-4
                        "
                    >
                        <Card.Body>

                            <div className="d-flexflex-columnflex-md-rowjustify-content-betweenalign-items-md-centergap-3" >

                                <div>
                                    <h5 className="fw-semibold mb-1">
                                        My Skills
                                    </h5>

                                    <small className="text-muted">
                                        Filter skills by their
                                        current status.
                                    </small>

                                </div>


                                <div
                                    className="
                                        d-flex
                                        flex-wrap
                                        gap-2
                                    "
                                >

                                    {STATUS_OPTIONS.map(
                                        (option) => (

                                            <Button
                                                key={
                                                    option.value
                                                }
                                                variant={
                                                    activeFilter ===
                                                        option.value
                                                        ? "primary"
                                                        : "outline-secondary"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        option.value
                                                    )
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </Button>
                                        )
                                    )}

                                </div>

                            </div>

                        </Card.Body>

                    </Card>

                    {loading ? (

                        <LoadingState
                            message="Loading your skills..."
                        />

                    ) : skills.length === 0 ? (

                        <EmptyState

                            title={
                                activeFilter === "ALL"
                                    ? "No skills added yet"
                                    : `No ${activeFilter.toLowerCase()} skills`
                            }

                            message={
                                activeFilter === "ALL"
                                    ? "Start tracking your developer journey by adding your first skill."
                                    : "There are no skills matching the selected status."
                            }

                            action={
                                activeFilter === "ALL"
                                    ? (
                                        <Button
                                            variant="primary"
                                            onClick={
                                                handleAddSkill
                                            }
                                        >
                                            Add Your First Skill
                                        </Button>
                                    )
                                    : null
                            }
                        />

                    ) : (

                        <Row className="g-4">

                            {skills.map(
                                (skill) => (

                                    <Col
                                        key={
                                            skill.id
                                        }
                                        xs={12}
                                        md={6}
                                        xl={4}
                                    >

                                        <Card
                                            className="
                                                border-0
                                                shadow-sm
                                                h-100
                                            "
                                        >

                                            <Card.Body
                                                className="
                                                    d-flex
                                                    flex-column
                                                "
                                            >

                                                <div
                                                    className="
                                                        d-flex
                                                        justify-content-between
                                                        align-items-start
                                                        gap-3
                                                        mb-3
                                                    "
                                                >

                                                    <div>

                                                        <h5 className="fw-bold mb-1">
                                                            {
                                                                skill.name
                                                            }
                                                        </h5>

                                                        <small className="text-muted">
                                                            Skill #
                                                            {
                                                                skill.id
                                                            }
                                                        </small>

                                                    </div>


                                                    <StatusBadge
                                                        status={
                                                            skill.status
                                                        }
                                                    />

                                                </div>


                                                <div className="mb-4">

                                                    <div className="text-muted small mb-1">
                                                        Target Date
                                                    </div>

                                                    <div className="fw-semibold">

                                                        {
                                                            formatDate(
                                                                skill.targetDate
                                                            )
                                                        }

                                                    </div>

                                                </div>


                                                <div
                                                    className="
                                                        mt-auto
                                                        d-flex
                                                        gap-2
                                                    "
                                                >

                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="flex-grow-1"
                                                        onClick={() =>
                                                            handleEditSkill(
                                                                skill
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>


                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="flex-grow-1"
                                                        disabled={
                                                            deletingId ===
                                                            skill.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                skill
                                                            )
                                                        }
                                                    >

                                                        {
                                                            deletingId ===
                                                                skill.id
                                                                ? (
                                                                    <>
                                                                        <Spinner
                                                                            animation="border"
                                                                            size="sm"
                                                                            className="me-1"
                                                                        />

                                                                        Deleting...
                                                                    </>
                                                                )
                                                                : (
                                                                    "Delete"
                                                                )
                                                        }

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

            </main>

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                backdrop="static"
            >

                <Modal.Header
                    closeButton={!saving}
                >

                    <Modal.Title className="fw-bold">

                        {
                            editingSkill
                                ? "Edit Skill"
                                : "Add Skill"
                        }

                    </Modal.Title>

                </Modal.Header>


                <Form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <Modal.Body>
                        <Form.Group
                            className="mb-3"
                        >

                            <Form.Label>
                                Skill Name
                            </Form.Label>

                            <Form.Control
                                type="text"
                                name="name"
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. Spring Boot"
                                maxLength={100}
                                required
                                disabled={saving}
                            />

                            <Form.Text
                                className="text-muted"
                            >
                                Enter the technology or
                                skill you are learning.
                            </Form.Text>

                        </Form.Group>

                        <Form.Group
                            className="mb-3"
                        >

                            <Form.Label>
                                Status
                            </Form.Label>

                            <Form.Select
                                name="status"
                                value={
                                    formData.status
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                disabled={saving}
                            >

                                <option value="LEARNING">
                                    Learning
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="PAUSED">
                                    Paused
                                </option>

                            </Form.Select>

                        </Form.Group>


                        <Form.Group>

                            <Form.Label>
                                Target Date
                            </Form.Label>

                            <Form.Control
                                type="date"
                                name="targetDate"
                                value={
                                    formData.targetDate
                                }
                                min={today}
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                            />

                            <Form.Text
                                className="text-muted"
                            >
                                Optional. You cannot select
                                a date in the past.
                            </Form.Text>

                        </Form.Group>

                    </Modal.Body>

                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={
                                handleCloseModal
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>


                        <Button
                            variant="primary"
                            type="submit"
                            disabled={saving}
                        >

                            {saving ? (

                                <>
                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />

                                    {
                                        editingSkill
                                            ? "Updating..."
                                            : "Adding..."
                                    }
                                </>

                            ) : (

                                editingSkill
                                    ? "Update Skill"
                                    : "Add Skill"
                            )}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>
        </>
    );
};

export default Skills;