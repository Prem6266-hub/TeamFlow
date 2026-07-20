import api from "./api";

export const createTask = async (taskData) => {
    const response = await api.post("/api/tasks/create", taskData);
    return response.data;
}

export const getProjectTasks = async(projectId) => {
    const response = await api.get(`/api/tasks/project/${projectId}`);
    return response.data;
}

export const getSingleTask = async (
    taskId
) => {
    const response = await api.get(
        `/api/tasks/${taskId}`
    );

    return response.data;
};

export const updateTask = async (
    taskId,
    taskData
) => {
    const response = await api.put(
        `/api/tasks/${taskId}`,
        taskData
    );

    return response.data;
};

export const updateTaskStatus = async (
    taskId,
    status
) => {
    const response = await api.patch(
        `/api/tasks/${taskId}/status`,
        { status }
    );

    return response.data;
};

export const deleteTask = async (
    taskId
) => {
    const response = await api.delete(
        `/api/tasks/${taskId}`
    );

    return response.data;
};

export const addComment = async (
    taskId,
    comment
) => {
    const response = await api.post(
        `/api/tasks/${taskId}/comment`,
        { text: comment }
    );

    return response.data;
};

export const getTaskComments = async (
    taskId
) => {
    const response = await api.get(
        `/api/tasks/${taskId}/comments`
    );

    return response.data;
};

export const deleteTaskComment = async (taskId, commentId) => {
    const response = await api.delete(`/api/tasks/${taskId}/comments/${commentId}`);
    return response.data;
};

export const uploadAttachment = async (
    taskId,
    fileOrFormData
) => {
    const formData =
        fileOrFormData instanceof FormData
            ? fileOrFormData
            : (() => {
                const payload = new FormData();
                payload.append("file", fileOrFormData);
                return payload;
            })();

    const response =
        await api.post(
            `/api/tasks/${taskId}/attachment`,
            formData
        );

    return response.data;
};

export const getAttachments = async (
    taskId
) => {
    const response = await api.get(
        `/api/tasks/${taskId}/attachments`
    );

    return response.data;
};

export const deleteAttachment = async (
    taskId,
    attachmentId
) => {
    const response = await api.delete(
        `/api/tasks/${taskId}/attachments/${attachmentId}`
    );

    return response.data;
};