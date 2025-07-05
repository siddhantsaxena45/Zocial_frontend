import SuggestedUsers from "@/components/SuggestedUsers";
import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        suggestedUsers: [],
        userProfile: null,
        selectedUser: null
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        addUserPost: (state, action) => {
            if (state.userProfile) {
                state.userProfile.posts = [action.payload, ...state.userProfile.posts];
            }
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        }, updateBookmarks: (state, action) => {
            state.user = {
                ...state.user,
                bookmarks: action.payload,
            };
        }, updateUserProfile(state, action) {
      state.userProfile = action.payload;
    },


    },
});

export const { setAuthUser, setSuggestedUsers, setUserProfile, addUserPost, setSelectedUser, updateBookmarks,updateUserProfile } = authSlice.actions;

export default authSlice.reducer;