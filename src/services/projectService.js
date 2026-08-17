import api from "./axiosClient";

const projectService = {

    createProject: async(userId, projectData) => {

        const response = await api.post(
            `/api/users/${userId}/projects`,
            projectData
        );

        return response.data;
    },


    getAllProjects: async(userId) => {

        const response = await api.get(
            `/api/users/${userId}/projects`
        );

        return response.data;
    },


    getProjectById: async(userId, projectId) => {

        const response = await api.get(
            `/api/users/${userId}/projects/${projectId}`
        );

        return response.data;
    },


    updateProject: async(
        userId,
        projectId,
        projectData
    ) => {

        const response = await api.put(
            `/api/users/${userId}/projects/${projectId}`,
            projectData
        );

        return response.data;
    },


    deleteProject: async(
        userId,
        projectId
    ) => {

        const response = await api.delete(
            `/api/users/${userId}/projects/${projectId}`
        );

        return response.data;
    },


    getProjectsByStatus: async(
        userId,
        status
    ) => {

        const response = await api.get(
            `/api/users/${userId}/projects/status/${status}`
        );

        return response.data;
    },

};


export default projectService;