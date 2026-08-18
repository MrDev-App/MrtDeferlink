@App.tsx
this gonna be handle by developer.

// for Android install referrer 
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
