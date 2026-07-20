import api from "./api";




export const createProject = async (projectData) => {
    const response = await api.post("/api/projects/create", projectData);

    return response.data;
}

export const getWorkspaceProjects = async(workSpaceId) => {
    const response = await api.get(`/api/projects/workspace/${workSpaceId}`);

    return response.data;
}

export const getSingleProject = async(projectId) => {
    const response = await api.get(`/api/projects/${projectId}`);
    console.log("project-single", response.data);
    return response.data;
}

export const updateProject = async(projectId, projectData) => {
    const respone = await api.put(`/api/projects/${projectId}`, projectData);
    return respone.data;
}

export const deleteProject = async(projectId) => {
    const response = await api.delete(`/api/projects/${projectId}`);
    return response.data;
}