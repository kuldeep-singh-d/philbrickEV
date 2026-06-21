import {
  View,
  Text,
  Image,
  Animated,
  Pressable,
  StatusBar,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  ImageBackground,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import { Svgs } from '@assets/svgs';
import { AppButton, AppText, Loader } from '@components';
import { images } from '@assets/imgaes';
import { useDashboard } from './useDashboard';
import { formatMetric, type PhaseName } from './dashboardData';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface MetricProps {
  label: string;
  value: string;
  unit?: string;
  icon: React.ComponentType<DashboardIconProps>;
  style: ReturnType<typeof useDashboard>['styles'];
}

interface DashboardIconProps {
  color?: string;
  width?: number;
  height?: number;
}

interface MetricValueProps {
  value: string;
  unit?: string;
  variant?: 'default' | 'phase' | 'current';
  style: ReturnType<typeof useDashboard>['styles'];
}

const MetricValue = ({
  value,
  unit,
  variant = 'default',
  style,
}: MetricValueProps) => {
  const valueStyle =
    variant === 'phase'
      ? style.phaseMiniValue
      : variant === 'current'
      ? style.currentValue
      : style.metricValue;
  const unitStyle =
    variant === 'phase'
      ? style.phaseMiniUnit
      : variant === 'current'
      ? style.currentUnit
      : style.metricUnit;

  return (
    <AppText
      bold
      label={
        unit ? (
          <>
            {value}
            <Text style={unitStyle}>{` ${unit}`}</Text>
          </>
        ) : (
          value
        )
      }
      style={valueStyle}
    />
  );
};

const Metric = ({ label, value, unit, icon: Icon, style }: MetricProps) => (
  <View style={style.metric}>
    <View style={style.metricHeader}>
      <View style={style.metricIconContainer}>
        <Icon
          color="#18B94B"
          width={style.metricIcon.width}
          height={style.metricIcon.height}
        />
      </View>
      <AppText
        medium
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        label={label}
        style={style.metricLabel}
      />
    </View>
    <MetricValue value={value} unit={unit} style={style} />
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
    <View style={style.phaseMetricGrid}>
      <View style={style.phaseMiniMetric}>
        <AppText label="Phase" style={style.phaseMiniLabel} />
        <MetricValue value={phase} variant="phase" style={style} />
      </View>
      <View style={style.phaseMiniMetric}>
        <AppText label="Voltage" style={style.phaseMiniLabel} />
        <MetricValue
          unit="V"
          style={style}
          variant="phase"
          value={formatMetric(voltage)}
        />
      </View>
      <View style={style.phaseMiniMetric}>
        <AppText label="Current" style={style.phaseMiniLabel} />
        <MetricValue
          unit="A"
          variant="phase"
          value={formatMetric(current)}
          style={style}
        />
      </View>
    </View>
  </View>
);

interface CurrentControlProps {
  currentControl: ReturnType<typeof useDashboard>['currentControl'];
  style: ReturnType<typeof useDashboard>['styles'];
}

const CurrentControl = ({ currentControl, style }: CurrentControlProps) => {
  const decreaseDisabled =
    !currentControl.canSet || currentControl.value <= currentControl.minimum;
  const increaseDisabled =
    !currentControl.canSet || currentControl.value >= currentControl.maximum;

  return (
    <View style={[style.metric, style.currentControl]}>
      <View style={style.metricHeader}>
        <View style={style.metricIconContainer}>
          <Svgs.DashboardCurrent
            color="#18B94B"
            width={style.metricIcon.width}
            height={style.metricIcon.height}
          />
        </View>
        <AppText medium label="Current (A)" style={style.metricLabel} />
      </View>
      <View style={style.currentControlRow}>
        <Pressable
          hitSlop={8}
          disabled={decreaseDisabled}
          accessibilityRole="button"
          accessibilityLabel="Decrease current"
          onPress={currentControl.handleDecrease}
          style={[
            style.currentArrowButton,
            decreaseDisabled && style.currentArrowButtonDisabled,
          ]}
        >
          <Svgs.Swipe width={9} height={14} style={style.currentArrowLeft} />
        </Pressable>

        <MetricValue
          unit="A"
          variant="current"
          value={String(currentControl.value)}
          style={style}
        />

        <Pressable
          hitSlop={8}
          disabled={increaseDisabled}
          accessibilityRole="button"
          accessibilityLabel="Increase current"
          onPress={currentControl.handleIncrease}
          style={[
            style.currentArrowButton,
            increaseDisabled && style.currentArrowButtonDisabled,
          ]}
        >
          <Svgs.Swipe width={9} height={14} />
        </Pressable>
      </View>
    </View>
  );
};

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

const StatusCardBackground = () => (
  <Svg
    width="100%"
    height="100%"
    pointerEvents="none"
    style={StyleSheet.absoluteFill}
  >
    <Defs>
      <LinearGradient id="statusCardBorder" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#31C44C" />
        <Stop offset="1" stopColor="#0BB2C3" />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" rx="20" fill="url(#statusCardBorder)" />
  </Svg>
);

export const Dashboard = () => {
  const {
    styles,
    dashboard,
    handleAlertsPress,
    handleRetry,
    handleTrackLayout,
    isCharging,
    isSwiping,
    swipeGesture,
    swipePosition,
    currentControl,
  } = useDashboard();
  const { phaseParameters, telemetry } = dashboard;
  const [phaseParametersExpanded, setPhaseParametersExpanded] = useState(false);
  const alertPulseScale = useRef(new Animated.Value(1)).current;
  const chargingStatus =
    telemetry.cpStatus === undefined
      ? 'Waiting for charger data'
      : telemetry.cpStatusText;

  const togglePhaseParameters = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPhaseParametersExpanded(expanded => !expanded);
  }, []);

  useEffect(() => {
    if (!dashboard.hasFault) {
      alertPulseScale.stopAnimation();
      alertPulseScale.setValue(1);
      return;
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(alertPulseScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(alertPulseScale, {
          toValue: 1,
          duration: 300,
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
          {dashboard.hasFault ? (
            <Pressable
              hitSlop={8}
              style={styles.iconButton}
              accessibilityRole="button"
              onPress={handleAlertsPress}
              accessibilityLabel="Open charger alerts"
            >
              <Animated.View
                style={{ transform: [{ scale: alertPulseScale }] }}
              >
                <Svgs.Alert width={25} height={25} />
              </Animated.View>
            </Pressable>
          ) : (
            <View style={[styles.iconButton, styles.hiddenIconButton]} />
          )}

          <Image
            resizeMode="contain"
            style={styles.brandLogo}
            source={images.headerLogo}
          />

          <View style={[styles.iconButton, styles.hiddenIconButton]} />
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

        <View style={styles.statusCardShadow}>
          <View style={styles.statusCardShell}>
            {/* <StatusCardBackground /> */}
            <View style={styles.statusCard}>
              <View style={styles.statusIconContainer}>
                <Svgs.DashboardCharging
                  color="#18B94B"
                  width={styles.statusIcon.width}
                  height={styles.statusIcon.height}
                />
              </View>
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
          </View>
        </View>

        <View style={[styles.card, styles.metricsCard]}>
          <View style={styles.metricsGrid}>
            <Metric
              unit="kW"
              label="Power"
              style={styles}
              icon={Svgs.DashboardPower}
              value={formatMetric(telemetry.power)}
            />
            <Metric
              unit="°C"
              style={styles}
              label="Temperature"
              icon={Svgs.DashboardTemperature}
              value={formatMetric(telemetry.temperature)}
            />
            <Metric
              unit="A"
              label="Current"
              style={styles}
              icon={Svgs.DashboardCurrent}
              value={formatMetric(dashboard.current)}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            style={styles.phaseToggle}
            onPress={togglePhaseParameters}
            accessibilityLabel="Phase Parameters"
            accessibilityState={{ expanded: phaseParametersExpanded }}
          >
            <View style={styles.phaseToggleLabel}>
              <View style={styles.phaseToggleIconContainer}>
                <Svgs.DashboardPhase
                  color="#667085"
                  width={styles.phaseIcon.width}
                  height={styles.phaseIcon.height}
                />
              </View>
              <AppText
                semibold
                label="Phase Parameters"
                style={styles.sectionTitle}
              />
            </View>
            <View style={styles.phaseChevronContainer}>
              <Svgs.DownArrow
                width={16}
                height={16}
                style={
                  phaseParametersExpanded
                    ? styles.phaseToggleIconExpanded
                    : undefined
                }
              />
            </View>
          </Pressable>

          {phaseParametersExpanded ? (
            <View style={styles.expandedPhaseSection}>
              {phaseParameters.visiblePhaseNames.map(phase => (
                <PhaseCard
                  key={phase}
                  phase={phase}
                  style={styles}
                  voltage={phaseParameters.phases[phase].voltage}
                  current={phaseParameters.phases[phase].current}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={[styles.card, styles.sessionCard]}>
          <Metric
            label="Timer (hh:mm:ss)"
            icon={Svgs.DashboardTimer}
            value={dashboard.duration}
            style={styles}
          />
          <CurrentControl currentControl={currentControl} style={styles} />
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

        {/* {dashboard.commandFeedback ? (
          <AppText
            centered
            numberOfLines={3}
            label={dashboard.commandFeedback}
            style={[
              styles.commandFeedback,
              dashboard.commandFeedbackIsError && styles.commandFeedbackError,
            ]}
          />
        ) : null} */}

        {/* {dashboard.chargerError ? (
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
        ) : null} */}

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
      </ScrollView>
      <Loader visible={dashboard.isLoading} loaderColor="#0BB2C3" />
    </ImageBackground>
  );
};
