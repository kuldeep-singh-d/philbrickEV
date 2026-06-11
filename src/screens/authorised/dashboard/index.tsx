import React from 'react';
import {
  View,
  ImageBackground,
  StatusBar,
  Image,
  Pressable,
} from 'react-native';

import { Svgs } from '@assets/svgs';
import { images } from '@assets/imgaes';
import { AppButton, AppText } from '@components';
import { useDashboard } from './useDashboard';

export const Dashboard = () => {
  const {
    styles,
    handleAlertsPress,
    handleSettingsPress,
    handleSendStartTest,
    mqttTest,
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

      <View style={styles.mqttTestCard}>
        <AppText
          semibold
          label="MQTT Connection Test"
          style={styles.testTitle}
        />

        <View style={styles.testRow}>
          <AppText label="Device" style={styles.testLabel} />
          <AppText
            medium
            label={mqttTest.deviceName}
            style={styles.testValue}
          />
        </View>

        <View style={styles.testRow}>
          <AppText label="Topic" style={styles.testLabel} />
          <AppText
            medium
            label={mqttTest.deviceTopic}
            style={styles.testValue}
          />
        </View>

        <View style={styles.testRow}>
          <AppText label="Connection" style={styles.testLabel} />
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                mqttTest.connectionStatus === 'connected'
                  ? styles.statusDotConnected
                  : styles.statusDotDisconnected,
              ]}
            />
            <AppText
              medium
              label={mqttTest.connectionStatus}
              style={styles.testValue}
            />
          </View>
        </View>

        <View style={styles.receivedBox}>
          <AppText
            semibold
            label="Latest Received Data"
            style={styles.receivedTitle}
          />
          <AppText
            label={`Topic: ${mqttTest.latestMessage?.topic || 'Waiting...'}`}
            style={styles.receivedMeta}
          />
          <AppText
            selectable
            numberOfLines={5}
            label={mqttTest.latestMessage?.message || 'No data received yet.'}
            style={styles.receivedMessage}
          />
        </View>

        <AppButton
          title={`Send ${mqttTest.payload}`}
          loader={mqttTest.isPublishing}
          disabled={!mqttTest.canPublish}
          onPress={handleSendStartTest}
          style={styles.testButton}
        />

        {mqttTest.publishResult || mqttTest.error ? (
          <AppText
            numberOfLines={3}
            label={mqttTest.publishResult || mqttTest.error}
            style={[
              styles.testFeedback,
              mqttTest.error && !mqttTest.publishResult
                ? styles.testFeedbackError
                : undefined,
            ]}
          />
        ) : null}
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
