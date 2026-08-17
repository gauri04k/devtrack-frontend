import { Card } from "react-bootstrap";

const EmptyState = ({
    title = "No data found",
    message = "There is nothing to display yet.",
    action = null,
}) => {
    return (
        <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">

                <div
                    className="mb-3 text-secondary"
                    style={{ fontSize: "2.5rem" }}
                >
                    —
                </div>

                <h5 className="fw-semibold mb-2">
                    {title}
                </h5>

                <p className="text-muted mb-4">
                    {message}
                </p>

                {action}

            </Card.Body>
        </Card>
    );
};

export default EmptyState;