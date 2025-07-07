import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const initialState = {
  users: [],
  isLoading: false,
  error: null,
};

// GET /users
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to fetch users');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;
      const user = state.users.find(u => u._id === userId);
      if (user) {
        user.isOnline = isOnline;
        if (lastSeen) {
          user.lastSeen = lastSeen;
        }
      }
    },
    updateUserLastMessage: (state, action) => {
      const { userId, message, timestamp } = action.payload;
      const user = state.users.find(u => u._id === userId);
      if (user) {
        user.lastMessage = { message, timestamp };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error fetching users';
      });
  },
});

export const { updateUserOnlineStatus, updateUserLastMessage } = usersSlice.actions;
export default usersSlice.reducer;
