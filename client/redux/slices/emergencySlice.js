import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  collisionDetected: false,
  collisionDetectedAcceleromter: false,
  peaks: 0,
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    updateCollisionDetected: (state, action) => {
      state.collisionDetected = action.payload;
    },
    updateCollisionDetectedAcceleromter: (state, action) => {
      state.collisionDetectedAcceleromter = action.payload;
    },
    updatePeaks: (state, action) => {
      state.peaks = action.payload;
    },

    incrementPeaks: (state, action) => {
      state.peaks++;
    },

    resetEmergencyState: (state, action) => {
      state.collisionDetected = false;
    },
  },
});

export const {
  updateCollisionDetected,
  resetEmergencyState,
  updateCollisionDetectedAcceleromter,
  updatePeaks,
  incrementPeaks,
} = emergencySlice.actions;

export const selectCollisionDetected = state =>
  state.emergency.collisionDetected;

export const selectCollisionDetectedAcceleromter = state =>
  state.emergency.collisionDetectedAcceleromter;
export const selectPeaks = state => state.emergency.peaks;

export default emergencySlice.reducer;
