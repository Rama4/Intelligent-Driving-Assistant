import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  contact: '',
};

const emergencyContactsSlice = createSlice({
  name: 'emergencyContacts',
  initialState,
  reducers: {
    updateContacts: (state, action) => {
      state.contact = action.payload;
    },
    resetContacts: (state, action) => {
      state.contact = '';
    },
  },
});

export const {updateContacts, addContact, resetContacts} =
  emergencyContactsSlice.actions;

export const selectEmergencyContacts = state => state.emergencyContacts.contact;

export default emergencyContactsSlice.reducer;
