import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser, loginUser } from "../../services/authApi";

const user = JSON.parse(localStorage.getItem("teamflowUser")) || null;
const token = localStorage.getItem("teamflowToken") || null;

const initialState = {
  user,
  token,
  loading: false,
  error: null,
  success: false,
};

console.log("User:", user);
console.log("Token:", token);

export const register = createAsyncThunk(
  "/api/auth/register",
  async (userData, thunkAPI) => {
    try {
      return await registerUser(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const login = createAsyncThunk(
  "/api/auth/login",
  async (userData, thunkAPI) => {
    try {
      return await loginUser(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    logout: (state) => {
      localStorage.removeItem("teamflowUser");

      localStorage.removeItem("teamflowToken");

      state.user = null;
      state.token = null;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    reset: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },

  extraReducers: (builder) => {
    builder

      //login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        console.log(action.payload);
        state.loading = false;
        state.error = null;
        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem(
          "teamflowUser",
          JSON.stringify(action.payload.user),
        );

        localStorage.setItem("teamflowToken", action.payload.token);
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //register

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.success = true;

        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem(
          "teamflowUser",
          JSON.stringify(action.payload.user),
        );

        localStorage.setItem("teamflowToken", action.payload.token);
      })

      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCredentials, logout, setLoading, setError, reset } =
  authSlice.actions;

export default authSlice.reducer;
