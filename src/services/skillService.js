import axiosClient from "./axiosClient";

const skillService = {
    getSkills: async(userId, status = "") => {

        const url = status ?
            `/api/users/${userId}/skills/status/${status}` :
            `/api/users/${userId}/skills`;

        const response = await axiosClient.get(url);

        return response.data;
    },

    getSkillById: async(userId, skillId) => {

        const response = await axiosClient.get(
            `/api/users/${userId}/skills/${skillId}`
        );

        return response.data;
    },

    createSkill: async(
        userId,
        skillData
    ) => {

        const response =
            await axiosClient.post(
                `/api/users/${userId}/skills`,
                skillData
            );

        return response.data;
    },

    updateSkill: async(userId, skillId, skillData) => {

        const response =
            await axiosClient.put(
                `/api/users/${userId}/skills/${skillId}`,
                skillData
            );

        return response.data;
    },


    deleteSkill: async(userId, skillId) => {

        const response =
            await axiosClient.delete(
                `/api/users/${userId}/skills/${skillId}`
            );

        return response.data;
    }
};

export default skillService;