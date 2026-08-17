import {Alert,Badge,Button,Card,Col,Container,Form,Modal,Row,Table,} from "react-bootstrap";
import {FaCalendarAlt,FaClock,FaPlus,FaBook,FaHistory,FaEdit,FaTrash,} from "react-icons/fa";

import {useCallback,useEffect,useMemo,useState,} from "react";

import AppNavbar from "../components/layout/AppNavbar";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";

import dailyLogService from "../services/dailyLogService";
import skillService from "../services/skillService";

import { useAuth } from "../context/AuthContext";


const formatDate = (date) => {
    if (!date) {
        return "No date";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Invalid date";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const formatHours = (hours) => {
    const numericHours = Number(hours);

    if (Number.isNaN(numericHours)) {
        return "0";
    }

    return numericHours.toFixed(1);
};


const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const DailyLogs = () => {

    const { auth } = useAuth();

    const [logs, setLogs] = useState([]);

    const [skills, setSkills] = useState([]);

    const [loading, setLoading] = useState(true);

    const [skillsLoading, setSkillsLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [saving, setSaving] = useState(false);

    const [editingLogId, setEditingLogId] = useState(null);

    const [formData, setFormData] = useState({
        skillId: "",
        topic: "",
        hours: "",
        notes: "",
        logDate: getTodayDate(),
    });


    const fetchDailyLogs = useCallback(
        async () => {

            if (!auth?.userId) {
                setLogs([]);
                setError("Unable to identify the logged-in user.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {

                console.log(
                    "DAILY LOGS USER ID:",
                    auth.userId
                );

                const data =
                    await dailyLogService.getDailyLogs(
                        auth.userId
                    );

                console.log(
                    "DAILY LOGS API RESPONSE:",
                    data
                );

                setLogs(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to fetch daily logs:",
                    err
                );

                console.error(
                    "Daily Logs API response:",
                    err.response?.data
                );

                setLogs([]);

                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Unable to load daily logs."
                );

            } finally {

                setLoading(false);

            }

        },
        [auth?.userId]
    );


    const fetchSkills = useCallback(
        async () => {

            if (!auth?.userId) {
                setSkills([]);
                return;
            }

            setSkillsLoading(true);

            try {

                const data =
                    await skillService.getSkills(
                        auth.userId
                    );

                console.log(
                    "SKILLS API RESPONSE:",
                    data
                );

                setSkills(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to fetch skills:",
                    err
                );

                console.error(
                    "Skills API response:",
                    err.response?.data
                );

                setSkills([]);

            } finally {

                setSkillsLoading(false);

            }

        },
        [auth?.userId]
    );


    useEffect(() => {

        if (auth?.userId) {
            fetchDailyLogs();
            fetchSkills();
        }

    }, [
        auth?.userId,
        fetchDailyLogs,
        fetchSkills,
    ]);


    const statistics = useMemo(() => {

        const totalLogs = logs.length;

        const totalHours = logs.reduce(
            (total, log) => {
                return total + Number(log.hours || 0);
            },
            0
        );

        const uniqueSkills = new Set(
            logs
                .filter((log) => log.skillId)
                .map((log) => log.skillId)
        ).size;

        return {
            totalLogs,
            totalHours,
            uniqueSkills,
        };

    }, [logs]);


    const clearError = () => {
        setError("");
    };


    const clearSuccess = () => {
        setSuccess("");
    };


    const resetForm = () => {

        setFormData({
            skillId: "",
            topic: "",
            hours: "",
            notes: "",
            logDate: getTodayDate(),
        });

        setEditingLogId(null);

    };


    const handleOpenCreate = () => {

        setError("");
        setSuccess("");

        resetForm();

        setShowModal(true);

        if (skills.length === 0) {
            fetchSkills();
        }

    };


    const handleCloseModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        resetForm();

    };


    const handleInputChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    const handleEdit = (log) => {

        setError("");
        setSuccess("");

        setEditingLogId(log.id);

        setFormData({
            skillId: log.skillId
                ? String(log.skillId)
                : "",
            topic: log.topic || "",
            hours: log.hours ?? "",
            notes: log.notes || "",
            logDate: log.logDate || getTodayDate(),
        });

        setShowModal(true);

        if (skills.length === 0) {
            fetchSkills();
        }

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!auth?.userId) {
            setError(
                "Unable to identify the logged-in user."
            );
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        const payload = {
            skillId: formData.skillId
                ? Number(formData.skillId)
                : null,
            topic: formData.topic.trim(),
            hours: Number(formData.hours),
            notes: formData.notes.trim(),
            logDate: formData.logDate,
        };

        try {

            if (editingLogId) {

                await dailyLogService.updateDailyLog(
                    auth.userId,
                    editingLogId,
                    payload
                );

                setSuccess(
                    "Daily log updated successfully."
                );

            } else {

                await dailyLogService.createDailyLog(
                    auth.userId,
                    payload
                );

                setSuccess(
                    "Daily log created successfully."
                );

            }

            setShowModal(false);
            resetForm();

            await fetchDailyLogs();

        } catch (err) {

            console.error(
                "Failed to save daily log:",
                err
            );

            console.error(
                "Save daily log response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to save daily log."
            );

        } finally {

            setSaving(false);

        }

    };


    const handleDelete = async (logId) => {

        if (!auth?.userId) {
            setError(
                "Unable to identify the logged-in user."
            );
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this daily log?"
            );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");

        try {

            await dailyLogService.deleteDailyLog(
                auth.userId,
                logId
            );

            setSuccess(
                "Daily log deleted successfully."
            );

            await fetchDailyLogs();

        } catch (err) {

            console.error(
                "Failed to delete daily log:",
                err
            );

            console.error(
                "Delete daily log response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to delete daily log."
            );

        }

    };


    return (
        <>
            <AppNavbar />

            <main>

                <Container
                    className="py-4 py-lg-5"
                >

                    <div
                        className="
                            d-flex
                            flex-column
                            flex-md-row
                            justify-content-between
                            align-items-md-center
                            gap-3
                            mb-4
                        "
                    >

                        <div>

                            <div
                                className="
                                    d-flex
                                    align-items-center
                                    gap-2
                                    mb-1
                                "
                            >

                                <FaHistory
                                    className="text-primary"
                                />

                                <h1
                                    className="
                                        fw-bold
                                        mb-0
                                    "
                                >
                                    Daily Logs
                                </h1>

                            </div>

                            <p
                                className="
                                    text-muted
                                    mb-0
                                "
                            >
                                Track your daily learning,
                                development activities,
                                and focused hours.
                            </p>

                        </div>

                        <Button
                            variant="primary"
                            onClick={handleOpenCreate}
                        >

                            <FaPlus
                                className="me-2"
                            />

                            Add Daily Log

                        </Button>

                    </div>


                    {error && (

                        <Alert
                            variant="danger"
                            dismissible
                            onClose={clearError}
                        >
                            {error}
                        </Alert>

                    )}


                    {success && (

                        <Alert
                            variant="success"
                            dismissible
                            onClose={clearSuccess}
                        >
                            {success}
                        </Alert>

                    )}


                    {!loading && (

                        <Row
                            className="g-3 mb-4"
                        >

                            <Col
                                xs={12}
                                sm={6}
                                lg={4}
                            >

                                <Card
                                    className="
                                        border-0
                                        shadow-sm
                                        h-100
                                    "
                                >

                                    <Card.Body>

                                        <div
                                            className="
                                                d-flex
                                                justify-content-between
                                                align-items-center
                                            "
                                        >

                                            <div>

                                                <div
                                                    className="
                                                        text-muted
                                                        small
                                                        mb-2
                                                    "
                                                >
                                                    Total Logs
                                                </div>

                                                <div
                                                    className="
                                                        fs-2
                                                        fw-bold
                                                    "
                                                >
                                                    {
                                                        statistics.totalLogs
                                                    }
                                                </div>

                                            </div>

                                            <div
                                                className="
                                                    text-primary
                                                    fs-3
                                                "
                                            >
                                                <FaHistory />
                                            </div>

                                        </div>

                                    </Card.Body>

                                </Card>

                            </Col>


                            <Col
                                xs={12}
                                sm={6}
                                lg={4}
                            >

                                <Card
                                    className="
                                        border-0
                                        shadow-sm
                                        h-100
                                    "
                                >

                                    <Card.Body>

                                        <div
                                            className="
                                                d-flex
                                                justify-content-between
                                                align-items-center
                                            "
                                        >

                                            <div>

                                                <div
                                                    className="
                                                        text-muted
                                                        small
                                                        mb-2
                                                    "
                                                >
                                                    Total Hours
                                                </div>

                                                <div
                                                    className="
                                                        fs-2
                                                        fw-bold
                                                    "
                                                >

                                                    {
                                                        formatHours(
                                                            statistics.totalHours
                                                        )
                                                    }

                                                    <span
                                                        className="
                                                            fs-6
                                                            fw-normal
                                                            text-muted
                                                            ms-1
                                                        "
                                                    >
                                                        hrs
                                                    </span>

                                                </div>

                                            </div>

                                            <div
                                                className="
                                                    text-success
                                                    fs-3
                                                "
                                            >
                                                <FaClock />
                                            </div>

                                        </div>

                                    </Card.Body>

                                </Card>

                            </Col>


                            <Col
                                xs={12}
                                sm={12}
                                lg={4}
                            >

                                <Card
                                    className="
                                        border-0
                                        shadow-sm
                                        h-100
                                    "
                                >

                                    <Card.Body>

                                        <div
                                            className="
                                                d-flex
                                                justify-content-between
                                                align-items-center
                                            "
                                        >

                                            <div>

                                                <div
                                                    className="
                                                        text-muted
                                                        small
                                                        mb-2
                                                    "
                                                >
                                                    Skills Used
                                                </div>

                                                <div
                                                    className="
                                                        fs-2
                                                        fw-bold
                                                    "
                                                >
                                                    {
                                                        statistics.uniqueSkills
                                                    }
                                                </div>

                                            </div>

                                            <div
                                                className="
                                                    text-info
                                                    fs-3
                                                "
                                            >
                                                <FaBook />
                                            </div>

                                        </div>

                                    </Card.Body>

                                </Card>

                            </Col>

                        </Row>

                    )}


                    <Card
                        className="
                            border-0
                            shadow-sm
                        "
                    >

                        <Card.Body
                            className="p-0"
                        >

                            <div
                                className="
                                    p-4
                                    border-bottom
                                    d-flex
                                    flex-column
                                    flex-md-row
                                    justify-content-between
                                    align-items-md-center
                                    gap-2
                                "
                            >

                                <div>

                                    <h5
                                        className="
                                            fw-semibold
                                            mb-1
                                        "
                                    >
                                        Learning Activity
                                    </h5>

                                    <small
                                        className="text-muted"
                                    >
                                        Your recent development
                                        and learning logs.
                                    </small>

                                </div>

                                <Badge
                                    bg="light"
                                    text="dark"
                                    className="
                                        border
                                        px-3
                                        py-2
                                    "
                                >
                                    {logs.length}{" "}
                                    {
                                        logs.length === 1
                                            ? "Entry"
                                            : "Entries"
                                    }
                                </Badge>

                            </div>


                            {loading ? (

                                <div className="px-4">

                                    <LoadingState
                                        message="Loading your daily activity..."
                                    />

                                </div>

                            ) : logs.length === 0 ? (

                                <div className="p-4">

                                    <EmptyState
                                        title="No daily logs yet"
                                        message="Start tracking your development activities by adding your first daily log."
                                        action={
                                            <Button
                                                variant="primary"
                                                onClick={
                                                    handleOpenCreate
                                                }
                                            >

                                                <FaPlus
                                                    className="me-2"
                                                />

                                                Add Your First Log

                                            </Button>
                                        }
                                    />

                                </div>

                            ) : (

                                <div
                                    className="
                                        table-responsive
                                    "
                                >

                                    <Table
                                        hover
                                        responsive
                                        className="
                                            align-middle
                                            mb-0
                                        "
                                    >

                                        <thead
                                            className="
                                                table-light
                                            "
                                        >

                                            <tr>

                                                <th
                                                    className="ps-4"
                                                >
                                                    Date
                                                </th>

                                                <th>
                                                    Topic
                                                </th>

                                                <th>
                                                    Skill
                                                </th>

                                                <th>
                                                    Hours
                                                </th>

                                                <th>
                                                    Notes
                                                </th>

                                                <th
                                                    className="
                                                        text-end
                                                        pe-4
                                                    "
                                                >
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {logs.map(
                                                (log) => (

                                                    <tr
                                                        key={
                                                            log.id
                                                        }
                                                    >

                                                        <td
                                                            className="
                                                                ps-4
                                                                text-nowrap
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    d-flex
                                                                    align-items-center
                                                                    gap-2
                                                                "
                                                            >

                                                                <FaCalendarAlt
                                                                    className="
                                                                        text-muted
                                                                    "
                                                                />

                                                                <span
                                                                    className="
                                                                        fw-medium
                                                                    "
                                                                >
                                                                    {
                                                                        formatDate(
                                                                            log.logDate
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <div
                                                                className="
                                                                    fw-semibold
                                                                "
                                                            >
                                                                {
                                                                    log.topic
                                                                }
                                                            </div>

                                                            <small
                                                                className="
                                                                    text-muted
                                                                "
                                                            >
                                                                Log #
                                                                {
                                                                    log.id
                                                                }
                                                            </small>

                                                        </td>


                                                        <td>

                                                            {log.skillName ? (

                                                                <Badge
                                                                    bg="primary-subtle"
                                                                    text="primary"
                                                                    className="
                                                                        border
                                                                    "
                                                                >
                                                                    {
                                                                        log.skillName
                                                                    }
                                                                </Badge>

                                                            ) : (

                                                                <span
                                                                    className="
                                                                        text-muted
                                                                    "
                                                                >
                                                                    No skill
                                                                </span>

                                                            )}

                                                        </td>


                                                        <td>

                                                            <span
                                                                className="
                                                                    fw-semibold
                                                                    text-nowrap
                                                                "
                                                            >

                                                                {
                                                                    formatHours(
                                                                        log.hours
                                                                    )
                                                                }

                                                                <span
                                                                    className="
                                                                        text-muted
                                                                        fw-normal
                                                                        ms-1
                                                                    "
                                                                >
                                                                    hrs
                                                                </span>

                                                            </span>

                                                        </td>


                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "220px",
                                                                maxWidth:
                                                                    "320px",
                                                            }}
                                                        >

                                                            <span
                                                                className="
                                                                    text-muted
                                                                "
                                                            >
                                                                {
                                                                    log.notes ||
                                                                    "No notes"
                                                                }
                                                            </span>

                                                        </td>


                                                        <td
                                                            className="
                                                                text-end
                                                                pe-4
                                                                text-nowrap
                                                            "
                                                        >

                                                            <Button
                                                                variant="
                                                                    outline-primary
                                                                "
                                                                size="sm"
                                                                className="
                                                                    me-2
                                                                "
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        log
                                                                    )
                                                                }
                                                            >

                                                                <FaEdit
                                                                    className="
                                                                        me-1
                                                                    "
                                                                />

                                                                Edit

                                                            </Button>


                                                            <Button
                                                                variant="
                                                                    outline-danger
                                                                "
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        log.id
                                                                    )
                                                                }
                                                            >

                                                                <FaTrash
                                                                    className="
                                                                        me-1
                                                                    "
                                                                />

                                                                Delete

                                                            </Button>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </Table>

                                </div>

                            )}

                        </Card.Body>

                    </Card>

                </Container>

            </main>


            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
            >

                <Form
                    onSubmit={handleSubmit}
                >

                    <Modal.Header
                        closeButton={!saving}
                    >

                        <Modal.Title>

                            {editingLogId
                                ? "Edit Daily Log"
                                : "Add Daily Log"}

                        </Modal.Title>

                    </Modal.Header>


                    <Modal.Body>

                        <Form.Group
                            className="mb-3"
                        >

                            <Form.Label>
                                Skill
                            </Form.Label>

                            <Form.Select
                                name="skillId"
                                value={formData.skillId}
                                onChange={
                                    handleInputChange
                                }
                                disabled={
                                    skillsLoading ||
                                    saving
                                }
                            >

                                <option value="">
                                    Select a skill
                                </option>

                                {skills.map(
                                    (skill) => (

                                        <option
                                            key={skill.id}
                                            value={skill.id}
                                        >
                                            {
                                                skill.name
                                            }
                                        </option>

                                    )
                                )}

                            </Form.Select>

                            {skills.length === 0 &&
                                !skillsLoading && (

                                    <Form.Text
                                        className="text-muted"
                                    >
                                        No skills found. You
                                        can still create a log
                                        without selecting a
                                        skill.
                                    </Form.Text>

                                )}

                        </Form.Group>


                        <Form.Group
                            className="mb-3"
                        >

                            <Form.Label>
                                Topic
                            </Form.Label>

                            <Form.Control
                                type="text"
                                name="topic"
                                value={formData.topic}
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Enter what you worked on"
                                required
                                disabled={saving}
                            />

                        </Form.Group>


                        <Row>

                            <Col md={6}>

                                <Form.Group
                                    className="mb-3"
                                >

                                    <Form.Label>
                                        Hours
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        name="hours"
                                        value={formData.hours}
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. 2.5"
                                        min="0.1"
                                        step="0.1"
                                        required
                                        disabled={saving}
                                    />

                                </Form.Group>

                            </Col>


                            <Col md={6}>

                                <Form.Group
                                    className="mb-3"
                                >

                                    <Form.Label>
                                        Log Date
                                    </Form.Label>

                                    <Form.Control
                                        type="date"
                                        name="logDate"
                                        value={
                                            formData.logDate
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        disabled={saving}
                                    />

                                </Form.Group>

                            </Col>

                        </Row>


                        <Form.Group
                            className="mb-2"
                        >

                            <Form.Label>
                                Notes
                            </Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="notes"
                                value={formData.notes}
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Add notes about your work"
                                disabled={saving}
                            />

                        </Form.Group>

                    </Modal.Body>


                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={handleCloseModal}
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : editingLogId
                                    ? "Update Log"
                                    : "Create Log"}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </>
    );
};


export default DailyLogs;