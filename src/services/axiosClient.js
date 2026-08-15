import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 10000,
});

axiosClient.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem("devtrack_auth");

        if (authData) {
            try {
                const { token } = JSON.parse(authData);

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Invalid authentication data:", error);
                localStorage.removeItem("devtrack_auth");
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("devtrack_auth");

            window.dispatchEvent(
                new Event("auth:logout")
            );
        }

        return Promise.reject(error);
    }
);

export default axiosClient;