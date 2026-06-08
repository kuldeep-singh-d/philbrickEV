import React from 'react';
import { images } from '@assets/imgaes';
import { View, ImageBackground, StatusBar, Image } from 'react-native';

import { useDashboard } from './useDashboard';

export const Dashboard = () => {
  const { styles } = useDashboard();

  return (
    <ImageBackground source={images.dashboardBG} style={styles.container}>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        showHideTransition={'fade'}
      />
      <View style={styles.brandHeader}>
        <Image
          resizeMode="contain"
          source={images.headerLogo}
          style={styles.brandLogo}
        />
      </View>
    </ImageBackground>
  );
};
