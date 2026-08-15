import axiosClient from "./axiosClient";

const dashboardService = {

    getDashboard: async(userId) => {

        const response = await axiosClient.get(
            `/api/users/${userId}/dashboard`
        );

        return response.data;
    },

};

export default dashboardService;