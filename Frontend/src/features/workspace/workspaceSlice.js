import {
  asyncThunkCreator,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import {
  getUserWorkspaces,
  createWorkspace,
  getWorkspaceById,
  getWorkspaceActivities,
  getWorkspaceMembers,
  inviteMember,
  removeMember,
  updateWorkspace,
  deleteWorkspace,
  clearWorkspaceActivities,
} from "../../services/workspaceApi";

const initialState = {
  workspaces: [],
  members: [],
  activities: [],
  currentWorkspace: null,
  loading: false,
  success: false,
  error: null,
};

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async (_, thunkAPI) => {
    try {
      return await getUserWorkspaces();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const createNewWorkspace = createAsyncThunk(
  "workspace/createNewWorkspace",
  async (workspaceData, thunkAPI) => {
    try {
      return await createWorkspace(workspaceData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchSingleWorkspace = createAsyncThunk(
  "workspace/fetchSingleWorkspace",
  async (workspaceId, thunkAPI) => {
    try {
      return await getWorkspaceById(workspaceId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchWorkspaceMembers = createAsyncThunk(
  "workspace/fetchWorkspceMember",
  async (workSpaceId, thunkAPI) => {
    try {
      return await getWorkspaceMembers(workSpaceId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const inviteWorkspaceMember = createAsyncThunk(
  "workspace/inviteWorkspaceMember",
  async ({ workSpaceId, email }, thunkAPI) => {
    try {
      return await inviteMember(workSpaceId, email);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const removeWorkspaceMember = createAsyncThunk(
  "workspace/removeWorkspaceMember",
  async ({ workSpaceId, memberId }, thunkAPI) => {
    try {
      return await removeMember(workSpaceId, memberId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const editWorkspace = createAsyncThunk(
  "workspace/editWorkspace",
  async ({ workSpaceId, workspaceData }, thunkAPI) => {
    try {
      return await updateWorkspace(workSpaceId, workspaceData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const removeWorkspace = createAsyncThunk(
  "workspace/removeWorkspace",
  async (workSpaceId, thunkAPI) => {
    try {
      return await deleteWorkspace(workSpaceId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchWorkspaceActivities = createAsyncThunk(
  "workspace/fetchWorkspaceActivities",
  async (workSpaceId, thunkAPI) => {
    try {
      return await getWorkspaceActivities(workSpaceId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const clearWorkspaceActivitiesAction = createAsyncThunk(
  "workspace/clearWorkspaceActivities",
  async (workSpaceId, thunkAPI) => {
    try {
      return await clearWorkspaceActivities(workSpaceId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,

  reducers: {
    resetWorkspaceState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentWorkspace = null;
    },
    setOnlineMembers: (state, action) => {
      const onlineIds = action.payload || [];
      state.members = state.members.map((member) => ({
        ...member,
        online: onlineIds.includes(member._id?.toString?.() || member._id),
      }));
    },
  },

  extraReducers: (builder) => {
    builder

      //fetch workspace

      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload;
      })

      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE WORKSPACE

      .addCase(createNewWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createNewWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (action.payload?.workspace) {
          state.workspaces.unshift(action.payload.workspace);
        }
      })

      .addCase(createNewWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //get single workspace
      .addCase(fetchSingleWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleWorkspace.fulfilled, (state, action) => {
        state.loading = false;

        state.currentWorkspace = action.payload;
      })
      .addCase(fetchSingleWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //get workspace members
      .addCase(fetchWorkspaceMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })

      .addCase(fetchWorkspaceMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //invite workspace member
      .addCase(inviteWorkspaceMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(inviteWorkspaceMember.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (action.payload?.member) {
          const exists = state.members.some((member) => member._id?.toString() === action.payload.member._id?.toString());
          if (!exists) {
            state.members.push(action.payload.member);
          }
        }
      })

      .addCase(inviteWorkspaceMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //remove workspace member
      .addCase(removeWorkspaceMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removeWorkspaceMember.fulfilled, (state, action) => {
        state.loading = false;

        state.members = state.members.filter(
          (member) => member._id !== action.payload,
        );
      })

      .addCase(removeWorkspaceMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //edit workspace
      .addCase(editWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(editWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updatedWorkspace = action.payload?.workspace || action.payload;

        state.workspaces = state.workspaces.map((workspace) =>
          workspace._id === updatedWorkspace?._id ? updatedWorkspace : workspace,
        );

        state.currentWorkspace = updatedWorkspace;
      })

      .addCase(editWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //remove workspace
      .addCase(removeWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removeWorkspace.fulfilled, (state, action) => {
        state.loading = false;

        state.workspaces = state.workspaces.filter(
          (workspace) => workspace._id !== action.meta.arg,
        );

        if (state.currentWorkspace?._id === action.meta.arg) {
          state.currentWorkspace = null;
        }
      })

      .addCase(removeWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //fetch workspace activity
      .addCase(fetchWorkspaceActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchWorkspaceActivities.fulfilled, (state, action) => {
        state.loading = false;

        state.activities = action.payload;
      })

      .addCase(fetchWorkspaceActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(clearWorkspaceActivitiesAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(clearWorkspaceActivitiesAction.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.activities = [];
      })

      .addCase(clearWorkspaceActivitiesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetWorkspaceState, setOnlineMembers } = workspaceSlice.actions;

export default workspaceSlice.reducer;
