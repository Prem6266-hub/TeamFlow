import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

import { generateAITasks } from "../../services/aiApi";

const initialState = {
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

const aiSlice = createSlice({
    name: "ai",
    initialState,

    reducers: {},

    extrareducers: (builder) => {
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
          );
    }
})


export default aiSlice.reducer;