import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  vms: [],
};

const appSlice = createSlice({
  name: 'voicemessages',
  initialState,
  reducers: {
    addVoicemessage: (state, action) => {
      const _vms = state.vms;
      _vms.push(action.payload);
      _vms.sort((a, b) => b.dateCreated - a.dateCreated);
      state.vms = _vms;
    },
    resetVoicemessages: (state, action) => {
      state.vms = [];
    },
    markVoicemessageReadOrUnread: (state, action) => {
      const vmindex = state.vms.findIndex(
        vm => vm.id === action.payload?.id || '',
      );
      if (vmindex !== -1) {
        state.vms[vmindex].read = action.payload?.read || false;
      }
    },
  },
});

export const {
  addVoicemessage,
  resetVoicemessages,
  markVoicemessageReadOrUnread,
} = appSlice.actions;

export const selectVms = state => state.voicemessages.vms;

export default appSlice.reducer;
