import {
  View,
  Image,
  Animated,
  Pressable,
  StatusBar,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import { Svgs } from '@assets/svgs';
import { AppButton, AppText, Loader } from '@components';
import { images } from '@assets/imgaes';
import { useDashboard } from './useDashboard';
import {
  formatMetric,
  getVisiblePhaseNames,
  type PhaseName,
} from './dashboardData';
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

interface PhaseCardProps {
  phase: PhaseName;
  voltage: number;
  current: number;
  style: ReturnType<typeof useDashboard>['styles'];
}

const PhaseCard = ({ phase, voltage, current, style }: PhaseCardProps) => (
  <View style={style.phaseMetricCard}>
    <View style={style.phaseCardHeader}>
      {/* <View style={style.phaseBadge}>
        <AppText semibold label={phase} style={style.phaseBadgeText} />
      </View> */}
      <AppText semibold label={`Phase ${phase}`} style={style.phaseCardTitle} />
    </View>

    <View style={style.phaseMetricGrid}>
      <View style={style.phaseMiniMetric}>
        <AppText label="Voltage" style={style.phaseMiniLabel} />
        <AppText
          bold
          label={`${formatMetric(voltage)} V`}
          style={style.phaseMiniValue}
        />
      </View>
      <View style={style.phaseMiniMetric}>
        <AppText label="Current" style={style.phaseMiniLabel} />
        <AppText
          bold
          label={`${formatMetric(current)} A`}
          style={style.phaseMiniValue}
        />
      </View>
    </View>
  </View>
);

const ChargeHandleBackground = () => (
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
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
    handleRetry,
    handleSettingsPress,
    handleTrackLayout,
    isCharging,
    isSwiping,
    swipeGesture,
    swipePosition,
  } = useDashboard();
  const { telemetry } = dashboard;
  const visiblePhaseNames = getVisiblePhaseNames(telemetry);
  const alertPulseScale = useRef(new Animated.Value(1)).current;
  const chargingStatus =
    telemetry.cpStatus === undefined
      ? 'Waiting for charger data'
      : telemetry.cpStatusText;

  useEffect(() => {
    if (!dashboard.hasFault) {
      alertPulseScale.stopAnimation();
      alertPulseScale.setValue(1);
      return;
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(alertPulseScale, {
          toValue: 1.16,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(alertPulseScale, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [alertPulseScale, dashboard.hasFault]);

  return (
    <ImageBackground
      resizeMode="cover"
      style={styles.container}
      source={images.dashboardBG}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScrollView
        bounces={false}
        scrollEnabled={!isSwiping}
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
            <Animated.View style={{ transform: [{ scale: alertPulseScale }] }}>
              <Svgs.Alert width={25} height={25} />
            </Animated.View>
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

        {dashboard.connectionError ? (
          <View style={styles.connectionErrorCard}>
            <AppText
              medium
              centered
              numberOfLines={3}
              label={dashboard.connectionError}
              style={styles.connectionErrorText}
            />
            <AppButton
              title="Retry"
              onPress={handleRetry}
              style={styles.retryButton}
            />
          </View>
        ) : null}

        {dashboard.chargerError ? (
          <View style={styles.chargerErrorCard}>
            <AppText
              semibold
              label="Charger alert"
              style={styles.chargerErrorTitle}
            />
            <AppText
              label={dashboard.chargerError}
              style={styles.chargerErrorText}
            />
          </View>
        ) : null}

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

        <View style={[styles.card, styles.phaseSection]}>
          <View style={styles.sectionTitleRow}>
            <Svgs.ThreePhase width={25} height={25} />
            <AppText
              semibold
              label="Phase Parameters"
              style={styles.sectionTitle}
            />
          </View>

          {visiblePhaseNames.map(phase => (
            <PhaseCard
              key={phase}
              phase={phase}
              style={styles}
              voltage={telemetry.phases[phase].voltage}
              current={telemetry.phases[phase].current}
            />
          ))}
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

        <View
          style={[
            styles.swipeContainer,
            !dashboard.canControl && styles.controlDisabled,
          ]}
        >
          <View
            onLayout={handleTrackLayout}
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

            <GestureDetector gesture={swipeGesture}>
              <View
                collapsable={false}
                accessibilityLabel={
                  isCharging
                    ? 'Swipe left to stop charging'
                    : 'Swipe right to start charging'
                }
                accessibilityRole="adjustable"
                style={[
                  styles.swipeHandle,
                  isCharging && styles.swipeHandleCharging,
                  { transform: [{ translateX: swipePosition }] },
                ]}
              >
                {!isCharging ? <ChargeHandleBackground /> : null}
                <Svgs.Charging width={31} height={38} />
              </View>
            </GestureDetector>
          </View>
        </View>

        {dashboard.commandFeedback ? (
          <AppText
            centered
            numberOfLines={3}
            label={dashboard.commandFeedback}
            style={[
              styles.commandFeedback,
              dashboard.commandFeedbackIsError && styles.commandFeedbackError,
            ]}
          />
        ) : null}
      </ScrollView>
      <Loader visible={dashboard.isLoading} loaderColor="#0BB2C3" />
    </ImageBackground>
  );
};
