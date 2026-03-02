import {
  combineReducers,
  configureStore,
  type Reducer,
  type UnknownAction,
} from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import {
  createStateSyncMiddleware,
  initStateWithPrevTab,
} from "redux-state-sync";
import config from "../config";
import { authSlice, themeSlice } from ".";
import logger from "../utils/logger";

const RootReducer = combineReducers({
  auth: authSlice,
//   master: masterSlice,
  theme: themeSlice
});

const encryptor = encryptTransform({
  secretKey: `${config.NAME_KEY}-storage`,
  onError: (error) => {
    // Handle the error.
    logger(error);
  },
});

const persistConfig = {
  key: config.NAME_KEY,
  storage,
  whitelist: ["auth", "master", "theme"],
  transforms: [encryptor],
};

const persistedReducer = persistReducer(
  persistConfig,
  RootReducer as Reducer<ReturnType<typeof RootReducer>, UnknownAction>
);

const middlewares = [
  createStateSyncMiddleware({
    blacklist: ["persist/PERSIST", "persist/REHYDRATE"],
  }),
];

// const defaultMiddleware = getDefaultMiddleware({
//   serializableCheck: {
//     ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//   },
// });

const store = configureStore({
  reducer: persistedReducer,
  // middleware: getDefaultMiddleware({
  //   // https://github.com/rt2zz/redux-persist/issues/988#issuecomment-552242978
  //   serializableCheck: {
  //     ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  //   },
  // }),
  // middleware: () => [...defaultMiddleware, ...middlewares],
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(middlewares),
  devTools: config.NODE_ENV !== "production",
});

initStateWithPrevTab(store);

export default store;

export const Persistor = persistStore(store);
