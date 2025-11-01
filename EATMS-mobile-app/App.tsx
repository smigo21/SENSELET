import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { theme } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { loadUserFromStorage } from './src/store/slices/authSlice';

const App = () => {
  useEffect(() => {
    // Load user from storage on app start
    store.dispatch(loadUserFromStorage());
  }, []);

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <AppNavigator />
    </Provider>
  );
};

export default App;
