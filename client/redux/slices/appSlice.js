import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  heartRate: null,
  respRate: null,
  symptoms: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

const appSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    updateHeartRate: (state, action) => {
      state.heartRate = action.payload;
    },
    setRespRate: (state, action) => {
      state.respRate = action.payload;
    },
    setSymptomVal: (state, action) => {
      state.symptoms[action.payload?.index] = action.payload?.value;
    },
  },
});

export const {updateHeartRate, setRespRate, setSymptomVal} = appSlice.actions;

export const selectHeartRate = state => state.userData.heartRate;
export const selectRespRate = state => state.userData.respRate;
export const selectSymptoms = state => state.userData.symptoms;

export default appSlice.reducer;
