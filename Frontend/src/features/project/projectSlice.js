import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getWorkspaceProjects, createProject, getSingleProject, updateProject, deleteProject } from "../../services/projectApi";

const initialState = {
  projects: [],
  currentProject: null,

  loading: false,
  error: null,
  success: false,
};

export const fetchProjects = createAsyncThunk("project/fetchProjects", async(workSpaceId, thunkAPI) => {
    try {
      console.log("workspc id: ", workSpaceId);
        return await getWorkspaceProjects(workSpaceId);
    } catch (err) {
         return thunkAPI.rejectWithValue(
          err.response?.data?.message
        );
    }
});

export const createNewProject = createAsyncThunk("project/createNewProect", async(projectData, thunkAPI) => {
    try {
        return await createProject(projectData);

    } catch (err) {
         return thunkAPI.rejectWithValue(
                err.response?.data?.message
            );
    }
})

export const fetchSingleProject = createAsyncThunk("project/fetchSignleProject", async(projectId, thunkAPI) => {
    try {
        return await getSingleProject(projectId);
    } catch (err) {
         return thunkAPI.rejectWithValue(
                err.response?.data?.message
            );
    }
})

export const editProject = createAsyncThunk("project/editProject", async({projectId, projectData}, thunkAPI) => {
    try {
        return await updateProject(projectId, projectData)
    } catch (err) {
         return thunkAPI.rejectWithValue(
                err.response?.data?.message
            );
    }
})

export const removeProject = createAsyncThunk("project/removeProject", async(projectId, thunkAPI) => {
    try {
         await deleteProject(projectId);
         return projectId;
    } catch (err) {
         return thunkAPI.rejectWithValue(
                err.response?.data?.message
            );
    }
})

const projectSlice = createSlice({
    name: "project",
    initialState,

    reducers: {
        resetProjectState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    },

    extraReducers: (builder) => {
        builder

        //fetch Projects

        .addCase(
            fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
        )

        .addCase(
        fetchProjects.fulfilled,
        (state, action) => {
          console.log(action.payload)
          state.loading = false;
          state.success = true;

          state.projects = action.payload.projects;
        }
      )

      .addCase(
        fetchProjects.rejected,
        (state, action) => {
          
        console.log(action.payload)
          state.loading = false;
          state.error =
            action.payload;
        }
      )

      //createProject
      .addCase(
            createNewProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
        )

        .addCase(
        createNewProject.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          if (action.payload?.project) {
            state.projects.unshift(action.payload.project);
          }
        }
      )

      .addCase(
        createNewProject.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
        }
      )

      //getsingleproject
      .addCase(
            fetchSingleProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
        )

        .addCase(
        fetchSingleProject.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.currentProject = action.payload;
        }
      )

      .addCase(
        fetchSingleProject.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
        }
      )

      //update project
      .addCase(
            editProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
        )

        .addCase(
        editProject.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;
state.projects = state.projects.map(
            (project) =>
                project._id === action.payload._id
                    ? action.payload
                    : project
        );

        state.currentProject = action.payload;
        }
      )

      .addCase(
        editProject.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
        }
      )

      //delete project
      .addCase(
            removeProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
        )

        .addCase(
        removeProject.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          state.projects = state.projects.filter((projectId) => projectId._id !== action.payload);
        }
      )

      .addCase(
        removeProject.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload;
        }
      );
    }
})


export const {
    resetProjectState,
} = projectSlice.actions;


export default projectSlice.reducer;