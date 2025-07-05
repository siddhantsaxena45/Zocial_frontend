import { createSlice } from "@reduxjs/toolkit";

const messageNotificationSlice = createSlice({
  name: "messageNotification",
  initialState: {
    messages: [],
  },
  reducers: {
    setMessageNotification: (state, action) => {
      const notification = {
        ...action.payload,
        seen: false,
      };
      state.messages.push(notification);
    },
    markAllMessagesSeen: (state) => {
      state.messages = state.messages.map(n => ({ ...n, seen: true }));
    },
    setAllMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  setMessageNotification,
  markAllMessagesSeen,
  clearMessages,setAllMessages
} = messageNotificationSlice.actions;

export default messageNotificationSlice.reducer;
