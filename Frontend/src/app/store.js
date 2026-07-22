import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import workspaceReducer from "../features/workspace/workspaceSlice";
import projectReducer from "../features/project/projectSlice";
import taskReducer from "../features/task/taskSlice";
import notificationReducer from "../features/notification/notificationSlice";
import aiReducer from "../features/ai/aiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    project: projectReducer,
    task: taskReducer,
    notification: notificationReducer,
    ai: aiReducer,
  },
});