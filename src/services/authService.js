import axiosClient from "./axiosClient";

const authService = {
    register: async(userData) => {
        const response = await axiosClient.post(
            "/api/auth/register",
            userData
        );

        return response.data;
    },

    login: async(credentials) => {
        const response = await axiosClient.post(
            "/api/auth/login",
            credentials
        );

        return response.data;
    },
};

export default authService;