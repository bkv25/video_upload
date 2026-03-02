import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  removeLocalStorage,
  removeLocalStorageToken,
} from "../../utils/common";
import logger from "../../utils/logger";
// import { resetMasterList } from "../MasterSlice/index.slice";

export interface AuthState {
  userData: Record<string, unknown>;
  unreadCount: Record<string, unknown>;
}

const initialState: AuthState = {
  userData: {},
  unreadCount: {},
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction: (state, action: PayloadAction<Record<string, unknown>>) => {
      return (state = {
        ...state,
        userData: { ...action.payload },
      });
    },
    logoutAction: () => initialState,
    unreadCountAction: (
      state,
      action: PayloadAction<Record<string, unknown>>
    ) => {
      return (state = {
        ...state,
        unreadCount: { ...action.payload },
      });
    },
  },
});
export const { logoutAction, loginAction, unreadCountAction } =
  authSlice.actions;

export const loginData =
  (data: Record<string, unknown>) =>
  async (dispatch: (action: unknown) => void) => {
  try {
    dispatch(loginAction(data));
  } catch (error) {
    logger(error);
  }
  };

export const unreadCountData =
  (data: Record<string, unknown>) =>
  async (dispatch: (action: unknown) => void) => {
  try {
    dispatch(unreadCountAction(data));
  } catch (error) {
    logger(error);
  }
  };

export const logout =
  () =>
  async (dispatch: (action: unknown) => void) => {
  try {
    dispatch(logoutAction());
    setTimeout(() => {
    //   dispatch(resetMasterList());
    }, 300);
    removeLocalStorageToken(undefined);
    removeLocalStorage("refreshToken");
  } catch (error) {
    logger(error);
  }
  };

export const selectUserData = (state: { auth: AuthState }) =>
  state.auth.userData;
export const selectUnreadCount = (state: { auth: AuthState }) =>
  state.auth.unreadCount;

export default authSlice.reducer;
