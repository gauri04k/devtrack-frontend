import { Badge } from "react-bootstrap";

const STATUS_VARIANTS = {
    LEARNING: "primary",
    COMPLETED: "success",
    PAUSED: "warning",
};

const StatusBadge = ({ status }) => {

    const variant = STATUS_VARIANTS[status] || "secondary";

    const label = status ? status.replaceAll("_", " ") : "UNKNOWN";

    return (
        <Badge bg={variant}>{label}</Badge>
    );
};

export default StatusBadge;