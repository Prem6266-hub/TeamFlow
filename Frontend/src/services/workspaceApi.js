
import api from "./api";

export const getUserWorkspaces = async() => {
    const response = await api.get("/api/workspaces");

    return response.data;
}

export const createWorkspace = async(workspaceData) => {
    const response = await api.post("/api/workspaces", workspaceData);
    return response.data;
}

export const getWorkspaceById = async (workSpaceId) => {
    const response = await api.get(`/api/workspaces/${workSpaceId}`);
    return response.data.workspace;
}

export const updateWorkspace = async(workSpaceId, workspaceData) => {
    const response = await api.put(`/api/workspaces/${workSpaceId}`, workspaceData);

    return response.data;
}

export const deleteWorkspace = async(workSpaceId) => {
    const respone = await api.delete(`/api/workspaces/${workSpaceId}`);
    return respone.data;
}

export const inviteMember = async (
    workSpaceId,
    email
) => {
    const response = await api.post(
        `/api/workspaces/${workSpaceId}/invite`,
        { email }
    );

    return response.data;
};

export const removeMember = async (
    workSpaceId,
    memberId
) => {
    const response = await api.delete(
        `/api/workspaces/${workSpaceId}/members/${memberId}`
    );

    return response.data;
};

export const getWorkspaceMembers =
async (workSpaceId) => {

    const response =
    await api.get(
        `/api/workspaces/${workSpaceId}/members`
    );

    return response.data;
};

export const getWorkspaceActivities =
async (workSpaceId) => {

    const response =
    await api.get(
        `/api/workspaces/${workSpaceId}/activities`
    );

    return response.data;
};

export const clearWorkspaceActivities = async (workSpaceId) => {
    const response = await api.delete(`/api/workspaces/${workSpaceId}/activities`);
    return response.data;
};