import { configureStore } from "@reduxjs/toolkit";
import crmReducer from "./slice";

export const store = configureStore({
  reducer: {
    crm: crmReducer
  }
});