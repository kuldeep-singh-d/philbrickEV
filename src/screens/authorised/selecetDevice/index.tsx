import React from 'react';
import useStyles from './styles';
import { AppText } from '@components';
import AuthorisedScreen from '../components/AuthorisedScreen';

export const SelectDevice = () => {
  const styles = useStyles();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Select Device" style={styles.heading} />
      {/* <AppText
        style={styles.description}
        label="Device selection will be available soon."
      /> */}
    </AuthorisedScreen>
  );
};

export default SelectDevice;
