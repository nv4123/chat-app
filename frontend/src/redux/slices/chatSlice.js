import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const initialState = {
  messages: [],
  activeChat: null,
  activeChatRoomId: null,
  typingUsers: [],
  onlineUsers: [],
  chatRooms: [],  // Store chat rooms here
};

// Fetch all messages of a chat room
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatRoomId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/messages/chat/${chatRoomId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue('Failed to fetch messages');
    }
  }
);

// Send a message to backend
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatRoomId, receiverId, message }, thunkAPI) => {
    try {
      const res = await axiosInstance.post('/messages', {
        chatRoomId,
        receiver: receiverId,
        text: message,  // Ensure the correct structure based on your backend
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue('Failed to send message');
    }
  }
);

// Create a new chat room
export const createChatRoom = createAsyncThunk(
  'chat/createChatRoom',
  async ({ senderId, receiverId }, thunkAPI) => {
    try {
      const res = await axiosInstance.post('/chatrooms/create', { senderId, receiverId });
      return res.data;  // Return the new chat room object
    } catch (err) {
      return thunkAPI.rejectWithValue('Failed to create chat room');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload.userId;
      state.activeChatRoomId = action.payload.chatRoomId;
    },
    addMessage: (state, action) => {
      const exists = state.messages.find(m => m._id === action.payload._id && m.chatRoomId === state.activeChatRoomId);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    updateMessageStatus: (state, action) => {
      const message = state.messages.find(m => m._id === action.payload.messageId && m.chatRoomId === state.activeChatRoomId);
      if (message) {
        message.status = action.payload.status;
      }
    },
    bulkUpdateMessageStatus: (state, action) => {
      const { senderId, receiverId, status } = action.payload;
      state.messages.forEach((msg) => {
        if (
          msg.chatRoomId === state.activeChatRoomId && 
          msg.sender === senderId && 
          msg.receiver === receiverId && 
          msg.status !== 'seen'
        ) {
          msg.status = status;
        }
      });
    },
    setTypingUsers: (state, action) => {
      state.typingUsers = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.activeChat = null;
      state.activeChatRoomId = null;
    },
    addChatRoom: (state, action) => {
      state.chatRooms.push(action.payload); // Add the new chat room
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.filter(m => m.chatRoomId === state.activeChatRoomId);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (action.payload.chatRoomId === state.activeChatRoomId) {
          state.messages.push(action.payload);
        }
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.chatRooms.push(action.payload);  // Store newly created chat room
      });
  },
});

export const {
  setActiveChat,
  addMessage,
  updateMessageStatus,
  bulkUpdateMessageStatus,
  setTypingUsers,
  setOnlineUsers,
  clearChat,
  addChatRoom,  // New action to add chat room to state
} = chatSlice.actions;

export default chatSlice.reducer;
