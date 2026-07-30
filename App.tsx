import React, { useEffect } from 'react';
import { Linking, StatusBar, useColorScheme } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { init, fetchService, ENDPOINT } from './src';

init({
  baseUrl: 'https://api.digitalplayground.quest',
  debug: __DEV__,
});

const App = () => {
  return (
    <>
      <StatusBar barStyle={'dark-content'} backgroundColor="transparent" />
      <RootNavigator />
    </>
  );
};

export default App;
