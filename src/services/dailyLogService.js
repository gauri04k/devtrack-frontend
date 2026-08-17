import axiosClient from "./axiosClient";

const dailyLogService = {

    getDailyLogs: async(userId) => {
        const response = await axiosClient.get(
            `/api/users/${userId}/logs`
        );

        return response.data;
    },

    getDailyLogById: async(userId, logId) => {
        const response = await axiosClient.get(
            `/api/users/${userId}/logs/${logId}`
        );

        return response.data;
    },

    getLogsByDate: async(userId, date) => {
        const response = await axiosClient.get(
            `/api/users/${userId}/logs/date`, {
                params: {
                    date,
                },
            }
        );

        return response.data;
    },

    getWeeklyHours: async(userId) => {
        const response = await axiosClient.get(
            `/api/users/${userId}/logs/weekly-summary`
        );

        return response.data;
    },

    createDailyLog: async(userId, logData) => {
        const response = await axiosClient.post(
            `/api/users/${userId}/logs`,
            logData
        );

        return response.data;
    },

    updateDailyLog: async(userId, logId, logData) => {
        const response = await axiosClient.put(
            `/api/users/${userId}/logs/${logId}`,
            logData
        );

        return response.data;
    },
    deleteDailyLog: async(userId, logId) => {

        const response = await axiosClient.delete(
            `/api/users/${userId}/logs/${logId}`
        );

        return response.data;
    },
};

export default dailyLogService;