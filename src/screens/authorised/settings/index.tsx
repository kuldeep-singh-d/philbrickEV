import React from 'react';
import { useSettings } from './useSettings';
import { AppButton, AppText } from '@components';
import AuthorisedScreen from '../components/AuthorisedScreen';

export const Settings = () => {
  const { styles, options } = useSettings();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Settings" style={styles.heading} />

      {options.map(option => (
        <AppButton
          key={option.title}
          title={option.title}
          onPress={option.onPress}
          style={styles.optionButton}
        />
      ))}
    </AuthorisedScreen>
  );
};

export default Settings;
