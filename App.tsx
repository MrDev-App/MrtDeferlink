import React, { useEffect } from 'react';
import { Linking, StatusBar, useColorScheme } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { init, fetchService, ENDPOINT } from './src';
import { NativeModules } from 'react-native';

init({
  baseUrl: 'https://api.digitalplayground.quest',
  debug: __DEV__,
});

const { InstallReferrerModule } = NativeModules;

export const getInstallReferrer = () =>
  InstallReferrerModule.getInstallReferrer();

const App = () => {
  useEffect(() => {
    getInstallReferrer().then((referrer: any) => {
      console.log('Install Referrer:', referrer);
    });
  }, []);
  return (
    <>
      <StatusBar barStyle={'dark-content'} backgroundColor="transparent" />
      <RootNavigator />
    </>
  );
};

export default App;
