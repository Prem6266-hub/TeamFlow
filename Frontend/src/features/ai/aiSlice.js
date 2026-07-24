import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

import { generateAITasks, chatWithAi } from "../../services/aiApi";


const initialState = {
  messages: [],
  loading: false,
  error: null,
};

export const generateTasks = createAsyncThunk("ai/genearteTasks", async(data,thunkAPI) => {
    try {
        return await generateAITasks(data);
    } catch (err) {
        return thunkAPI.rejectWithValue(
            err.response?.data?.message
        )
    }
});

export const sendMessage = createAsyncThunk("ai/sendMessage", async({workSpaceId, message}, thunkAPI) => {
  try {
    return await chatWithAi(workSpaceId, message);
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message
    )
  }
})

const aiSlice = createSlice({
    name: "ai",
    initialState,

    reducers: {
      addUserMessage: (state, action) => {
        state.messages.push({
          role: "user",
          content: action.payload,
          timestamp: new Date().toISOString(),
        });
      },

      clearChat: (state) => {
        state.messages = [];
      }
    },

    extraReducers: (builder) => {
        builder

        .addCase(generateTasks.pending, (state) => {
            state.loading = true;
        })

        .addCase(
            generateTasks.fulfilled,
            (
              state
            ) => {
              state.loading =
                false;
            }
          )

          .addCase(
            generateTasks.rejected,
            (
              state,
              action
            ) => {
              console.log(action.payload);
              state.loading =
                false;

              state.error =
                action.payload;
            }
          )

          .addCase(
            sendMessage.pending, (state) => {
              state.loading = true;
            }
          )

          .addCase(
        sendMessage.fulfilled,
        (state, action) => {
          state.loading = false;

          state.messages.push({
            role: "assistant",
            content: action.payload?.answer || action.payload?.message || "I could not generate a response.",
            timestamp: new Date().toISOString(),
          });
        }
      )

      .addCase(
        sendMessage.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
    }
})


export const {addUserMessage, clearChat} = aiSlice.actions;


export default aiSlice.reducer;