import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "@/redux/api/authApi";
import { userApi } from "@/redux/api/userApi";
import { adminApi } from "@/redux/api/adminApi";
import { publicApi } from "@/redux/api/publicApi";
import authReducer from "@/redux/slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      adminApi.middleware,
      publicApi.middleware
    ),
});

setupListeners(store.dispatch);

export default store;