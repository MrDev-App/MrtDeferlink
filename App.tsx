import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { init } from './src';
import { NativeModules } from 'react-native';

init({
  baseUrl: 'https://api.theblockyapp.com',
  debug: __DEV__,
});

const { InstallReferrerModule } = NativeModules;

export const getInstallReferrer = () => {
  if (
    InstallReferrerModule &&
    typeof InstallReferrerModule.getInstallReferrer === 'function'
  ) {
    return InstallReferrerModule.getInstallReferrer();
  }
  return Promise.resolve(null);
};

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
