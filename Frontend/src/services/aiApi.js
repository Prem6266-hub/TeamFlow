import api from "./api";

export const generateAITasks = async(data) => {
    const response = await api.post("/api/ai/generate-tasks", data);

    return response.data;
}