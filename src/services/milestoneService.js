import axiosClient from "./axiosClient";

const milestoneService = {
    getMilestones: async(projectId) => {
        const response = await axiosClient.get(
            `/api/projects/${projectId}/milestones`
        );

        return response.data;
    },

    createMilestone: async(projectId, milestoneData) => {
        const response = await axiosClient.post(
            `/api/projects/${projectId}/milestones`,
            milestoneData
        );

        return response.data;
    },

    updateMilestone: async(milestoneId, milestoneData) => {
        const response = await axiosClient.put(
            `/api/milestones/${milestoneId}`,
            milestoneData
        );

        return response.data;
    },

    deleteMilestone: async(milestoneId) => {
        const response = await axiosClient.delete(
            `/api/milestones/${milestoneId}`
        );

        return response.data;
    },
};

export default milestoneService;