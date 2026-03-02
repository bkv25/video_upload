import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import themeData from "./theme.json";

export interface ThemeColor {
  primary: string;
  primaryDark: string;
  secondary: string;
  inputText: string;
  bgColor: string;
  borderColor: string;
  navHover: string;
  bodyBg: string;
  grayBg: string;
  googleBg: string;
  errorColor: string;
  lightPrimary: string;
  navLink: string;
  textColor: string;
  textPlaceholder: string;
}

export interface ThemeData {
  theme_color: ThemeColor;
  site_logo: string;
}

export interface ThemeState {
  theme: ThemeData;
}

const initialState: ThemeState = {
  theme: themeData as ThemeData,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    updateColors: (state, action: PayloadAction<Partial<ThemeColor>>) => {
      state.theme.theme_color = {
        ...state.theme.theme_color,
        ...action.payload,
      };
    },
    updateImagePath: (state, action: PayloadAction<string>) => {
      state.theme.site_logo = action.payload;
    },
    resetTheme: (state) => {
      state.theme = themeData as ThemeData;
    },
  },
});

export const {
  updateColors,
  updateImagePath,
  resetTheme,
} = themeSlice.actions;

export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme;
export const selectThemeColors = (state: { theme: ThemeState }) =>
  state.theme.theme.theme_color;
export const selectThemeImagePath = (state: { theme: ThemeState }) =>
  state.theme.theme.site_logo ?? "";

export default themeSlice.reducer;
