import { Spinner } from "react-bootstrap";

const LoadingState = ({message = "Loading...",}) => {
    return (
        <div className="text-center py-5">

            <Spinner animation="border" role="status" className="mb-3"/>

            <div className="text-muted">{message}</div>

        </div>
    );
};

export default LoadingState;