import {createContext,useContext,useEffect,useState,} from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({children,}) => {
    const [auth, setAuth] = useState(() => {
        const storedAuth = localStorage.getItem("devtrack_auth");

        if (!storedAuth) {
            return null;
        }

        try {
            return JSON.parse(storedAuth);
        } catch (error) {
            console.error("Invalid stored authentication:",error);
            localStorage.removeItem("devtrack_auth");

            return null;
        }
    });

    const [loading, setLoading] = useState(false);
    const isAuthenticated = Boolean(auth?.token);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await authService.login(credentials);
            localStorage.setItem("devtrack_auth",JSON.stringify(response));
            setAuth(response);

            return response;

        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {

            const response = await authService.register(userData);
            return response;

        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("devtrack_auth");
        setAuth(null);
    };

    useEffect(() => {
        const handleLogout = () => {
            localStorage.removeItem("devtrack_auth");
            setAuth(null);
        };

        window.addEventListener("auth:logout",handleLogout);
        return () => {
            window.removeEventListener("auth:logout",handleLogout);
        };
    }, []);


    return (
        <AuthContext.Provider
            value={{ auth, isAuthenticated, loading, login, register, logout,}}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};