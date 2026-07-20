import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser, loginUser, logoutUser, updateProfileUser } from "../../services/authApi";

const readStoredAuth = () => {
  try {
    const storedUser = localStorage.getItem("teamflowUser");
    const storedToken = localStorage.getItem("teamflowToken");

    if (!storedUser || !storedToken) {
      return { user: null, token: null };
    }

    return {
      user: JSON.parse(storedUser),
      token: storedToken,
    };
  } catch (error) {
    localStorage.removeItem("teamflowUser");
    localStorage.removeItem("teamflowToken");
    return { user: null, token: null };
  }
};

const { user, token } = readStoredAuth();

const initialState = {
  user,
  token,
  loading: false,
  error: null,
  success: false,
};

export const register = createAsyncThunk(
  "/api/auth/register",
  async (userData, thunkAPI) => {
    try {
      return await registerUser(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
  }
);

export const login = createAsyncThunk(
  "/api/auth/login",
  async (userData, thunkAPI) => {
    try {
      return await loginUser(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "/api/auth/profile",
  async (profileData, thunkAPI) => {
    try {
      return await updateProfileUser(profileData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update profile");
    }
  }
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

  localStorage.removeItem(
    "teamflowUser"
  );

  localStorage.removeItem(
    "teamflowToken"
  );

  state.user = null;
  state.token = null;
},

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },


  extraReducers: (builder) => {

  builder

  // LOGIN

  .addCase(login.pending, (state) => {
    state.loading = true;
  })

  .addCase(login.fulfilled, (state, action) => {
  state.loading = false;

  state.user = action.payload.user;
  state.token = action.payload.token;

  localStorage.setItem(
    "teamflowUser",
    JSON.stringify(action.payload.user)
  );

  localStorage.setItem(
    "teamflowToken",
    action.payload.token
  );
})
  .addCase(login.rejected, (state, action) => {
    console.log(action.payload);
    state.loading = false;
    state.error = action.payload;
  })

  // REGISTER

  .addCase(register.pending, (state) => {
    state.loading = true;
  })

  .addCase(register.fulfilled, (state, action) => {
  state.loading = false;

  state.user = action.payload.user;
  state.token = action.payload.token;

  localStorage.setItem(
    "teamflowUser",
    JSON.stringify(action.payload.user)
  );

  localStorage.setItem(
    "teamflowToken",
    action.payload.token
  );
})

  .addCase(register.rejected, (state, action) => {
    console.log(action);
    state.loading = false;
    state.error = action.payload;
  })

  .addCase(updateProfile.pending, (state) => {
    state.loading = true;
    state.error = null;
  })

  .addCase(updateProfile.fulfilled, (state, action) => {
    state.loading = false;
    state.user = action.payload.user;
    state.success = true;
    localStorage.setItem("teamflowUser", JSON.stringify(action.payload.user));
  })

  .addCase(updateProfile.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

}
});

export const {
  setCredentials,
  logout,
  setLoading,
  setError,
} = authSlice.actions;

export default authSlice.reducer;