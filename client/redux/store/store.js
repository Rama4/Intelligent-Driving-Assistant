import {configureStore} from '@reduxjs/toolkit';
import {
  appSlice,
  emergencyContactsSlice,
  voicemessageSlice,
  emergencySlice,
  trafficContextSlice,
} from '../slices';

export const store = configureStore({
  reducer: {
    userData: appSlice,
    emergencyContacts: emergencyContactsSlice,
    emergency: emergencySlice,
    voicemessages: voicemessageSlice,
    trafficContext: trafficContextSlice,
  },
});
