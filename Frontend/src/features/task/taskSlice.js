import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { createTask, getProjectTasks, getSingleTask, deleteTask, updateTask, updateTaskStatus, addComment, uploadAttachment, getAttachments, getTaskComments, deleteAttachment } from "../../services/taskApi";
import { deleteTaskComment } from "../../services/taskApi";

const initialState = {
    tasks: [],
    currentTask: null,

    comments: [],
    attachments: [],

    loading: false,
    error: null,
    success: false,
}

const appendUniqueComment = (comments, incomingComment) => {
  if (!incomingComment) return comments;

  const matchesExistingComment = comments.some((existingComment) => {
    const existingId = existingComment?._id?.toString();
    const incomingId = incomingComment?._id?.toString();

    if (existingId && incomingId && existingId === incomingId) {
      return true;
    }

    return Boolean(
      existingComment?.text === incomingComment?.text &&
      existingComment?.user?._id?.toString() === incomingComment?.user?._id?.toString() &&
      existingComment?.createdAt === incomingComment?.createdAt,
    );
  });

  if (matchesExistingComment) {
    return comments;
  }

  return [...comments, incomingComment];
};

export const fetchTasks = createAsyncThunk("task/fetchTasks", async(projectId, thunkAPI) => {
    try {
        return await getProjectTasks(projectId);
    } catch (err) {
        return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
})

export const createNewTask = createAsyncThunk(
  "task/createTask",
  async (taskPayload, thunkAPI) => {
    try {
      const payload = taskPayload?.taskData
        ? {
            ...taskPayload.taskData,
            projectId: taskPayload.projectId ?? taskPayload.taskData.projectId,
          }
        : taskPayload;

      return await createTask(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
  }
);

export const fetchTask = createAsyncThunk(
  "task/fetchTask",
  async (taskId, thunkAPI) => {
    try {
      return await getSingleTask(
        taskId
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
  }
);

export const editTask = createAsyncThunk(
  "task/updateTask",
  async (
    {
      taskId,
      taskData,
    },
    thunkAPI
  ) => {
    try {
      return await updateTask(
        taskId,
        taskData
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
  }
);

export const changeTaskStatus = createAsyncThunk(
  "task/updateStatus",
  async (
    {
      taskId,
      status,
    },
    thunkAPI
  ) => {
    try {
      return await updateTaskStatus(
        taskId,
        status
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
  }
);

export const removeTask = createAsyncThunk(
  "task/deleteTask",
  async (
    taskId,
    thunkAPI
  ) => {
    try {
      await deleteTask(taskId);

      return taskId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
  }
);

export const fetchComments = createAsyncThunk(
  "task/fetchComments",
  async (
    taskId,
    thunkAPI
  ) => {

    try {

      return await getTaskComments(
        taskId
      );

    } catch (err) {

      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );

    }

  }
);

export const createComment = createAsyncThunk(
  "task/addComment",
  async (
    {
      taskId,
      comment,
    },
    thunkAPI
  ) => {

    try {

      return await addComment(
        taskId,
        comment
      );

    } catch (err) {

      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );

    }

  }
);

export const removeComment = createAsyncThunk(
  "task/removeComment",
  async (
    { taskId, commentId },
    thunkAPI
  ) => {
    try {
      return await deleteTaskComment(taskId, commentId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchAttachments = createAsyncThunk(
  "task/fetchAttachments",
  async (
    taskId,
    thunkAPI
  ) => {

    try {

      return await getAttachments(
        taskId
      );

    } catch (err) {

      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );

    }

  }
);

export const addAttachment = createAsyncThunk(
  "task/uploadAttachment",
  async (
    {
      taskId,
      formData,
    },
    thunkAPI
  ) => {

    try {

      return await uploadAttachment(
        taskId,
        formData
      );

    } catch (err) {

      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );

    }

  }
);

export const removeAttachment = createAsyncThunk(
  "task/removeAttachment",
  async (
    {
      taskId,
      attachmentId,
    },
    thunkAPI
  ) => {
    try {
      return await deleteAttachment(
        taskId,
        attachmentId
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
  }
);


const taskSlice = createSlice({
    name: "task",
    initialState,

    reducers: {
        resetTaskState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
      appendComment: (state, action) => {
        state.comments = appendUniqueComment(state.comments, action.payload);
      },
      setComments: (state, action) => {
        state.comments = action.payload ?? [];
      },
      removeCommentLocal: (state, action) => {
        const commentId = action.payload;
        state.comments = state.comments.filter((c) => (c._id || c.id) !== commentId);
      },
    },

    extraReducers: (
        builder
    ) => {
        builder

        //fetch task reducer
        .addCase(
  fetchTasks.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  fetchTasks.fulfilled,
  (state, action) => {
    state.loading = false;

    state.tasks =
      action.payload?.tasks ?? [];
  }
)

.addCase(
  fetchTasks.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.payload;
  }
)

//create task 
.addCase(
  createNewTask.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  createNewTask.fulfilled,
  (state, action) => {
    state.loading = false;

    if (action.payload?.task) {
      state.tasks.push(
        action.payload.task
      );
    }
  }
)

.addCase(
  createNewTask.rejected,
  (state, action) => {
    console.log(action.payload)
    state.loading = false;

    state.error =
      action.payload;
  }
)

//fetch single task
.addCase(
  fetchTask.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  fetchTask.fulfilled,
  (state, action) => {
    state.loading = false;

    state.currentTask =
      action.payload.task;
  }
)

.addCase(
  fetchTask.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.payload;
  }
)

//edit task
.addCase(
  editTask.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  editTask.fulfilled,
  (state, action) => {
    state.loading = false;

    state.tasks =
      state.tasks.map(
        (task) =>
          task._id ===
          action.payload?.task?._id
            ? action.payload.task
            : task
      );

    state.currentTask =
      action.payload?.task ?? null;
  }
)

.addCase(
  editTask.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.payload;
  }
)

// status change 
.addCase(
  changeTaskStatus.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  changeTaskStatus.fulfilled,
  (state, action) => {
    state.loading = false;

    state.tasks = state.tasks.map(
  (task) =>
    task._id === action.payload.task._id
      ? action.payload.task
      : task
);

state.currentTask = action.payload.task;
  }
)

.addCase(
  changeTaskStatus.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.payload;
  }
)

//delete reducer
.addCase(
  removeTask.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  removeTask.fulfilled,
  (state, action) => {
    state.loading = false;

    state.tasks =
      state.tasks.filter(
        (task) =>
          task._id !==
          action.payload
      );
  }
)

.addCase(
  removeTask.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.payload;
  }
)

//fetchcomment
.addCase(
  fetchComments.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  fetchComments.fulfilled,
  (state, action) => {

    state.comments =
      action.payload?.comments ?? [];

  }
)

.addCase(
  fetchComments.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.payload;
  }
)

//add comment
.addCase(
  createComment.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  createComment.fulfilled,
  (state, action) => {

    state.comments =
      action.payload?.comments ?? [];

  }
)

.addCase(
  createComment.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.payload;
  }
)

.addCase(
  removeComment.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  removeComment.fulfilled,
  (state, action) => {
    state.loading = false;
    const commentId = action.payload?.commentId || action.payload?.commentId;
    if (commentId) {
      state.comments = state.comments.filter((c) => (c._id || c.id) !== commentId);
    }
  }
)

.addCase(
  removeComment.rejected,
  (state, action) => {
    state.loading = false;
    state.error = action.payload;
  }
)

//fetch attachment
.addCase(
  fetchAttachments.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  fetchAttachments.fulfilled,
  (state, action) => {

    state.attachments =
      action.payload?.attachments ?? [];

  }
)

.addCase(
  fetchAttachments.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.payload;
  }
)

//upload attachment
.addCase(
  addAttachment.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  addAttachment.fulfilled,
  (state) => {
    state.loading = false;
  }
)

.addCase(
  addAttachment.rejected,
  (state, action) => {
    console.log(action.payload)
    state.loading = false;

    state.error =
      action.payload;
  }
)

//remove attachment
.addCase(
  removeAttachment.pending,
  (state) => {
    state.loading = true;
  }
)

.addCase(
  removeAttachment.fulfilled,
  (state, action) => {
    state.loading = false;
    state.attachments = state.attachments.filter(
      (attachment) =>
        attachment._id !== action.payload.attachmentId
    );
  }
)

.addCase(
  removeAttachment.rejected,
  (state, action) => {
    console.log(action.payload)
    state.loading = false;
    state.error = action.payload;
  }
)
    }
})



export const {
  resetTaskState,
  appendComment,
  setComments,
  removeCommentLocal,
} = taskSlice.actions;

export default taskSlice.reducer;