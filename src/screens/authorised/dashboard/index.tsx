import {
  View,
  Image,
  Pressable,
  StatusBar,
  ScrollView,
  ImageBackground,
} from 'react-native';
import React from 'react';
import { Svgs } from '@assets/svgs';
import { AppButton, AppText } from '@components';
import { images } from '@assets/imgaes';
import { useDashboard } from './useDashboard';
import { formatMetric } from './dashboardData';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface MetricProps {
  label: string;
  value: string;
  style: ReturnType<typeof useDashboard>['styles'];
}

const Metric = ({ label, value, style }: MetricProps) => (
  <View style={style.metric}>
    <AppText label={label} style={style.metricLabel} />
    <AppText bold label={value} style={style.metricValue} />
  </View>
);

interface PhaseRowProps {
  phase: 'R' | 'Y' | 'B';
  voltage: number;
  current: number;
  style: ReturnType<typeof useDashboard>['styles'];
}

const PhaseRow = ({ phase, voltage, current, style }: PhaseRowProps) => (
  <View style={style.phaseRow}>
    <AppText medium label={phase} style={style.phaseValue} />
    <AppText
      medium
      label={`${formatMetric(voltage)} V`}
      style={style.phaseValue}
    />
    <AppText
      medium
      label={`${formatMetric(current)} A`}
      style={style.phaseValue}
    />
  </View>
);

const ChargeHandleBackground = () => (
  <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
    <Defs>
      <LinearGradient id="chargeHandle" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#32C45A" />
        <Stop offset="1" stopColor="#0AAFC5" />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" rx="18" fill="url(#chargeHandle)" />
  </Svg>
);

export const Dashboard = () => {
  const {
    styles,
    dashboard,
    handleAlertsPress,
    handleSendStartTest,
    handleSettingsPress,
    handleTrackLayout,
    isCharging,
    mqttTest,
    panResponder,
    swipePosition,
  } = useDashboard();
  const { telemetry } = dashboard;
  const chargingStatus =
    telemetry.cpStatus === undefined
      ? 'Waiting for charger data'
      : telemetry.cpStatusText;

  return (
    <ImageBackground
      resizeMode="cover"
      style={styles.container}
      source={images.dashboardBG}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel={
              dashboard.hasFault
                ? `${telemetry.activeFaults.length} active charger faults`
                : 'Open alerts'
            }
            hitSlop={8}
            style={styles.iconButton}
            accessibilityRole="button"
            onPress={handleAlertsPress}
          >
            <Svgs.Alert width={25} height={25} />
          </Pressable>

          <Image
            resizeMode="contain"
            style={styles.brandLogo}
            source={images.headerLogo}
          />

          <Pressable
            hitSlop={8}
            style={styles.iconButton}
            accessibilityRole="button"
            onPress={handleSettingsPress}
            accessibilityLabel="Open settings"
          >
            <Svgs.Setting width={25} height={25} />
          </Pressable>
        </View>

        <View style={styles.heroSpace} />

        <View
          style={[
            styles.connectionPill,
            !dashboard.isConnected && styles.connectionPillDisconnected,
          ]}
        >
          <View
            style={[
              styles.connectionDot,
              !dashboard.isConnected && styles.connectionDotDisconnected,
            ]}
          />
          <AppText
            medium
            label={dashboard.connectionLabel}
            style={[
              styles.connectionText,
              !dashboard.isConnected && styles.connectionTextDisconnected,
            ]}
          />
        </View>

        <View style={[styles.card, styles.statusCard]}>
          <Svgs.ChargingStatus width={36} height={36} />
          <View style={styles.statusCopy}>
            <AppText
              semibold
              label="Charging status"
              style={styles.statusTitle}
            />
            <AppText
              medium
              numberOfLines={2}
              label={chargingStatus}
              style={styles.statusDescription}
            />
          </View>
        </View>

        <View style={[styles.card, styles.metricsCard]}>
          <Metric
            label="Power"
            value={`${formatMetric(telemetry.power)} kW`}
            style={styles}
          />
          <Metric
            label="Temperature"
            value={`${formatMetric(telemetry.temperature)} °C`}
            style={styles}
          />
          <Metric
            label="Current"
            value={`${formatMetric(dashboard.current)} A`}
            style={styles}
          />
        </View>

        <View style={[styles.card, styles.phaseCard]}>
          <View style={styles.sectionTitleRow}>
            <Svgs.ThreePhase width={30} height={30} />
            <AppText
              semibold
              label="Three Phase Parameters"
              style={styles.sectionTitle}
            />
          </View>

          <View style={styles.phaseTable}>
            <View style={styles.phaseHeader}>
              <AppText label="Phase" style={styles.phaseHeaderText} />
              <AppText label="Voltage" style={styles.phaseHeaderText} />
              <AppText label="Current" style={styles.phaseHeaderText} />
            </View>
            <PhaseRow
              phase="R"
              voltage={telemetry.phases.R.voltage}
              current={telemetry.phases.R.current}
              style={styles}
            />
            <PhaseRow
              phase="Y"
              voltage={telemetry.phases.Y.voltage}
              current={telemetry.phases.Y.current}
              style={styles}
            />
            <PhaseRow
              phase="B"
              voltage={telemetry.phases.B.voltage}
              current={telemetry.phases.B.current}
              style={styles}
            />
          </View>
        </View>

        <View style={[styles.card, styles.sessionCard]}>
          <Metric
            label="Timer (hh:mm:ss)"
            value={telemetry.duration}
            style={styles}
          />
          <Metric
            label="Voltage (V)"
            value={`${formatMetric(telemetry.voltage)} V`}
            style={styles}
          />
        </View>

        <View style={styles.swipeContainer} onLayout={handleTrackLayout}>
          <View
            style={[styles.swipeTrack, isCharging && styles.swipeTrackCharging]}
          >
            <View
              style={[
                styles.swipePrompt,
                isCharging && styles.swipePromptCharging,
              ]}
            >
              {!isCharging ? (
                <View style={styles.swipeArrows}>
                  {[0, 1, 2].map(index => (
                    <Svgs.Swipe
                      key={index}
                      width={8}
                      height={12}
                      style={index ? styles.swipeArrowSpacing : undefined}
                    />
                  ))}
                </View>
              ) : null}

              <AppText
                semibold
                label={
                  isCharging ? 'Swipe to Stop Charge' : 'Swipe to Start Charge'
                }
                style={styles.swipeLabel}
              />

              {isCharging ? (
                <View style={[styles.swipeArrows, styles.swipeArrowsCharging]}>
                  {[0, 1, 2].map(index => (
                    <Svgs.Swipe
                      key={index}
                      width={8}
                      height={12}
                      style={[
                        styles.swipeArrowReverse,
                        index ? styles.swipeArrowSpacing : undefined,
                      ]}
                    />
                  ))}
                </View>
              ) : null}
            </View>

            <View
              accessibilityLabel={
                isCharging
                  ? 'Swipe left to stop charging'
                  : 'Swipe right to start charging'
              }
              accessibilityRole="adjustable"
              style={[
                styles.swipeHandle,
                isCharging && styles.swipeHandleCharging,
                { left: swipePosition },
              ]}
              {...panResponder.panHandlers}
            >
              {!isCharging ? <ChargeHandleBackground /> : null}
              <Svgs.Charging width={31} height={38} />
            </View>
          </View>
        </View>

        {/* mqttTestCard */}
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
      </ScrollView>
    </ImageBackground>
  );
};
