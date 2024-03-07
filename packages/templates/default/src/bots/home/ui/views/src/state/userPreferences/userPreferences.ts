import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const localUserPreferencesString = JSON.stringify({
  theme: 'dark',
  motion: 'normal',
});
let localUserPreferences: UserPreferences | undefined = undefined;
if (localUserPreferencesString) {
  localUserPreferences = JSON.parse(localUserPreferencesString);
}
// console.log({localUserPreferences, localUserPreferencesString})

interface UserPreferences {
  theme: 'dark' | 'light';
  motion: 'reduced' | 'normal';
}

const initialState: UserPreferences = {
  theme: localUserPreferences?.theme ?? 'dark',
  motion: localUserPreferences?.motion ?? 'reduced',
};

// initial application of preferences
document.body.dataset.theme = initialState.theme;
document.body.dataset.motion = initialState.motion;

const UserPreferences = createSlice({
  name: 'user preferences',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = state.theme;
      // localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    toggleMotion: (state) => {
      state.motion = state.motion === 'reduced' ? 'normal' : 'reduced';
      document.body.dataset.motion = state.motion;
      // localStorage.setItem('userPreferences', JSON.stringify(state));
    },
  },
});

export const actions = UserPreferences.actions;
export default UserPreferences.reducer;
