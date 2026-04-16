import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  form: {},
  response: ""
};

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    setAIData: (state, action) => {
      state.form = { ...state.form, ...action.payload };
    },
    setResponse: (state, action) => {
      state.response = action.payload;
    }
  }
});

export const { setAIData, setResponse } = crmSlice.actions;
export default crmSlice.reducer;