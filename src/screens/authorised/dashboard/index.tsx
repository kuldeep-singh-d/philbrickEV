import React from 'react';
import {
  View,
  ImageBackground,
  StatusBar,
  Image,
  Pressable,
} from 'react-native';

import { AppText } from '@components';
import { Svgs } from '@assets/svgs';
import { images } from '@assets/imgaes';
import { useDashboard } from './useDashboard';

export const Dashboard = () => {
  const {
    styles,
    isCharging,
    swipePosition,
    panResponder,
    handleTrackLayout,
    handleAlertsPress,
    handleSettingsPress,
    swipeLabel,
  } = useDashboard();

  return (
    <ImageBackground source={images.dashboardBG} style={styles.container}>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        showHideTransition="fade"
      />
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={handleAlertsPress}>
          <Svgs.Alert width={25} height={25} />
        </Pressable>
        <Image
          resizeMode="contain"
          style={styles.brandLogo}
          source={images.headerLogo}
        />
        <Pressable style={styles.iconButton} onPress={handleSettingsPress}>
          <Svgs.Setting width={25} height={25} />
        </Pressable>
      </View>

      {/* <View style={styles.cardContainer}>
        <View style={styles.controlCard}>
          <View style={styles.controlLeft}>
            <View style={styles.iconWrapperActive}>
              <Svgs.ChargingMode width={30} height={30} />
            </View>
            <AppText
              semibold
              label="Charging Mode"
              style={styles.controlLabel}
            />
          </View>

          <View style={styles.modeAction}>
            <AppText semibold label="<" style={styles.modeArrow} />
            <AppText bold label="32A" style={styles.modeValue} />
            <AppText semibold label=">" style={styles.modeArrow} />
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.controlLeft}>
            <View style={styles.iconWrapperActive}>
              <Svgs.ChargingStatus width={30} height={30} />
            </View>
            <View style={styles.statusTextGroup}>
              <AppText
                semibold
                label="Charging status"
                style={styles.statusLabel}
              />
              <AppText
                label="Connected Waiting for Authentication"
                style={styles.statusDescription}
              />
            </View>
          </View>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <AppText semibold label="DURATION" style={styles.metricTitle} />
            <AppText bold label="00:00:00" style={styles.metricValue} />
            <AppText label="hrs:min:sec" style={styles.metricSubtitle} />
          </View>
          <View style={styles.metricCard}>
            <AppText semibold label="ENERGY" style={styles.metricTitle} />
            <AppText bold label="0.0" style={styles.metricValue} />
            <AppText label="kW delivered" style={styles.metricSubtitle} />
          </View>
          <View style={styles.metricCard}>
            <AppText semibold label="VOLTAGE" style={styles.metricTitle} />
            <AppText bold label="0" style={styles.metricValue} />
            <AppText label="Volts (V)" style={styles.metricSubtitle} />
          </View>
          <View style={styles.metricCard}>
            <AppText semibold label="CURRENT" style={styles.metricTitle} />
            <AppText bold label="0" style={styles.metricValue} />
            <AppText label="Amperes (A)" style={styles.metricSubtitle} />
          </View>
        </View>

        <View style={styles.swipeContainer} onLayout={handleTrackLayout}>
          <View
            style={[
              styles.swipeTrack,
              isCharging ? styles.swipeTrackActive : styles.swipeTrackInactive,
            ]}
          >
            <View style={styles.swipeContent}>
              <View style={styles.swipeIconBox}>
                <Svgs.Charging width={30} height={30} />
              </View>
              <View style={styles.swipeTextRow}>
                <AppText
                  semibold
                  label={
                    isCharging
                      ? 'Swipe to Stop Charge'
                      : 'Swipe to Start Charge'
                  }
                  style={styles.swipeLabel}
                />
                <View style={styles.swipeArrows}>
                  <Svgs.Swipe width={8} height={12} />
                  <Svgs.Swipe
                    width={8}
                    height={12}
                    style={styles.swipeArrowMargin}
                  />
                  <Svgs.Swipe
                    width={8}
                    height={12}
                    style={styles.swipeArrowMargin}
                  />
                </View>
              </View>
            </View>
            <View
              style={[
                styles.swipeHandle,
                isCharging
                  ? styles.swipeHandleActive
                  : styles.swipeHandleInactive,
                { left: swipePosition },
              ]}
              {...panResponder.panHandlers}
            >
              <Svgs.Charging width={30} height={30} />
            </View>
          </View>
        </View>
      </View> */}
    </ImageBackground>
  );
};
