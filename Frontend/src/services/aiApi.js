import api from "./api";

export const generateAITasks = async(data) => {
    const response = await api.post("/api/ai/generate-tasks", data);

    return response.data;
}

export const chatWithAi = async(workSpaceId, message) => {
    const response = await api.post("/api/ai/chat", {
        workspaceId: workSpaceId,
        workSpaceId,
        message,
    });
    return response.data;
}