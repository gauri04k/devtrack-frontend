import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;