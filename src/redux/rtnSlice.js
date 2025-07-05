import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realtimenotification",
  initialState: {
    likeNotification: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
      const payload = action.payload;

      if (Array.isArray(payload)) {
        payload.forEach((notif) => {
          if (notif.type === "dislike") {
            // Remove all notifications for this post and user
            state.likeNotification = state.likeNotification.filter(
              (n) =>
                !(
                  n.postId === notif.postId &&
                  n.userId === notif.userId
                )
            );
          } else if (notif.type === "like") {
            state.likeNotification.push({
              ...notif,
              seen: false,
              timestamp: Date.now(),
            });
          }
        });
      } else {
        if (payload.type === "dislike") {
          state.likeNotification = state.likeNotification.filter(
            (n) =>
              !(
                n.postId === payload.postId &&
                n.userId === payload.userId
              )
          );
        } else if (payload.type === "like") {
          state.likeNotification.push({
            ...payload,
            seen: false,
            timestamp: Date.now(),
          });
        }
      }
    },
    markAllNotificationsSeen: (state) => {
      state.likeNotification = state.likeNotification.map((n) => ({
        ...n,
        seen: true,
      }));
    },
  },
});

export const { setLikeNotification, markAllNotificationsSeen } = rtnSlice.actions;
export default rtnSlice.reducer;
