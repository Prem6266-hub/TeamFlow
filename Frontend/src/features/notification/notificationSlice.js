import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const readStoredNotifications = () => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem('teamflow-notifications');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load notifications from storage', error);
    return [];
  }
};

const persistNotifications = (items) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('teamflow-notifications', JSON.stringify(items));
};

const initialState = {
  items: readStoredNotifications(),
  loading: false,
  error: null,
  modalOpen: false,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/notifications');
      return response.data.notifications || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove notification');
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notification/clearAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/api/notifications');
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear notifications');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const normalized = action.payload?._id || action.payload?.id
        ? { ...action.payload, _id: action.payload._id || action.payload.id }
        : action.payload;

      state.items = [normalized, ...state.items.filter((item) => (item._id || item.id) !== (normalized?._id || normalized?.id))];
      persistNotifications(state.items);
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      persistNotifications(state.items);
    },
    syncNotifications: (state, action) => {
      state.items = action.payload;
      persistNotifications(state.items);
    },
    openNotificationModal: (state) => {
      state.modalOpen = true;
    },
    closeNotificationModal: (state) => {
      state.modalOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload?.length ? action.payload : state.items;
        state.loading = false;
        persistNotifications(state.items);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.items = state.items.length ? state.items : readStoredNotifications();
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload ? { ...item, isRead: true } : item
        );
        persistNotifications(state.items);
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        persistNotifications(state.items);
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.items = [];
        persistNotifications(state.items);
      });
  },
});

export const {
  addNotification,
  removeNotification,
  syncNotifications,
  openNotificationModal,
  closeNotificationModal,
} = notificationSlice.actions;

export default notificationSlice.reducer;
