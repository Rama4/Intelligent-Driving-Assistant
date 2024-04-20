import {createSlice} from '@reduxjs/toolkit';
import {
  TrafficConditionType,
  CognitiveWorkloadType,
} from '../../utils/constants';

const initialState = {
  trafficCondition: TrafficConditionType.SPEED_UNSPECIFIED,
  legDistances: [],
  legDurations: [],
  speedReadingIntervals: [],
  destinationDistance: 0,
  currentSpeed: 0,
  drivingDistance: 0,
  destinationDistanceP: 0,
  cognitiveWorkload: CognitiveWorkloadType.LCW,
  drivingIntervalRef: null,
  drivingScore: 100,
  distanceToDestination: 0,
  timeToDestination: 0,
};

const trafficContextSlice = createSlice({
  name: 'trafficContext',
  initialState,
  reducers: {
    updateTrafficCondition: (state, action) => {
      state.trafficCondition = action.payload;
    },
    updateLegDistances: (state, action) => {
      state.legDistances = action.payload;
    },
    updateLegDurations: (state, action) => {
      state.legDurations = action.payload;
    },
    updateSpeedReadingIntervals: (state, action) => {
      state.speedReadingIntervals = action.payload;
    },
    updateDestinationDistance: (state, action) => {
      state.destinationDistance = action.payload;
    },
    updateCurrentSpeed: (state, action) => {
      state.currentSpeed = action.payload;
    },
    updateDrivingDistance: (state, action) => {
      state.drivingDistance = action.payload;
    },
    updateDestinationDistanceP: (state, action) => {
      state.destinationDistanceP = action.payload;
    },
    updateCognitiveWorkload: (state, action) => {
      state.cognitiveWorkload = action.payload;
    },

    incrementDrivingDistance: (state, action) => {
      state.drivingDistance += 1;
    },
    updateDrivingIntervalRef: (state, action) => {
      state.drivingIntervalRef = action.payload;
    },
    updateDrivingScore: (state, action) => {
      state.drivingScore = action.payload;
    },
    updateDistanceToDestination: (state, action) => {
      state.distanceToDestination = action.payload;
    },
    updateTimeToDestination: (state, action) => {
      state.timeToDestination = action.payload;
    },
  },
});

export const {
  updateTrafficCondition,
  updateLegDistances,
  updateLegDurations,
  updateSpeedReadingIntervals,
  updateDestinationDistance,
  updateCurrentSpeed,
  updateDrivingDistance,
  updateCognitiveWorkload,
  incrementDrivingDistance,
  updateDrivingIntervalRef,
  updateDrivingScore,
  updateDistanceToDestination,
  updateTimeToDestination,
  updateDestinationDistanceP,
} = trafficContextSlice.actions;

export const selectTrafficCondition = state =>
  state.trafficContext.trafficCondition;
export const selectLegDistances = state => state.trafficContext.legDistances;
export const selectLegDurations = state => state.trafficContext.legDurations;

export const selectSpeedReadingIntervals = state =>
  state.trafficContext.speedReadingIntervals;

export const selectDestinationDistance = state =>
  state.trafficContext.destinationDistance;
export const selectCurrentSpeed = state => state.trafficContext.currentSpeed;
export const selectDrivingDistance = state =>
  state.trafficContext.drivingDistance;
export const selectDestinationDistanceP = state =>
  state.trafficContext.destinationDistanceP;
export const selectCognitiveWorkload = state =>
  state.trafficContext.cognitiveWorkload;
export const selectDrivingIntervalRef = state =>
  state.trafficContext.drivingIntervalRef;
export const selectDrivingScore = state => state.trafficContext.drivingScore;
export const selectDistanceToDestination = state =>
  state.trafficContext.distanceToDestination;
export const selectTimeToDestination = state =>
  state.trafficContext.timeToDestination;

export default trafficContextSlice.reducer;
