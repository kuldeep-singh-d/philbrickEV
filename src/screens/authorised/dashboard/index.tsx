import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  LayoutAnimation,
  ImageBackground,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDeviceDimensions } from '@hooks';
import { Svgs } from '@assets/svgs';
import { AppButton, AppText, Loader } from '@components';
import { images } from '@assets/imgaes';
import { useDashboard } from './useDashboard';
import { formatMetric, type PhaseName } from './dashboardData';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

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

interface ChargingHeroProps {
  canControl: boolean;
  cpStatus?: number;
  hasFault: boolean;
  isCharging: boolean;
  isConnected: boolean;
  isPublishing: boolean;
  onChargeChange: (nextCharging: boolean) => Promise<void>;
  scrollY: Animated.Value;
  statusText: string;
  styles: ReturnType<typeof useDashboard>['styles'];
}

// Keep the action artwork available for a future UI pass without showing it now.
const SHOW_HERO_ACTION_ICON = false;
const HERO_COLLAPSE_DISTANCE = 80;
const HERO_COMPACT_SCALE = 0.78;

const ChargingHero = ({
  canControl,
  cpStatus,
  hasFault,
  isCharging,
  isConnected,
  isPublishing,
  onChargeChange,
  scrollY,
  statusText,
  styles,
}: ChargingHeroProps) => {
  const { moderateWidth } = useDeviceDimensions();
  const ringRotation = useRef(new Animated.Value(0)).current;
  const pulseProgress = useRef(new Animated.Value(0)).current;
  const particleProgress = useRef(new Animated.Value(0)).current;
  const isEnergyActive = cpStatus === 2 || cpStatus === 5;
  const isError = isConnected && (hasFault || cpStatus === 4 || cpStatus === 7);
  const isVentilation = cpStatus === 2;
  const isFinished = cpStatus === 6;
  const heroStatus = !isConnected
    ? 'NOT CONNECTED'
    : cpStatus === undefined
    ? 'CONNECTED'
    : cpStatus === 1
    ? 'CONNECTED'
    : statusText;
  const accentColor = isError
    ? '#E5484D'
    : isVentilation
    ? '#0BA7B4'
    : isConnected
    ? '#20BE53'
    : '#98A2B3';
  const secondaryColor = isError
    ? '#FF8A8E'
    : isVentilation
    ? '#36D6C5'
    : '#0BB2C3';
  const glowColor = isError
    ? 'rgba(229, 72, 77, 0.12)'
    : isVentilation
    ? 'rgba(11, 167, 180, 0.14)'
    : isFinished
    ? 'rgba(32, 190, 83, 0.16)'
    : isConnected
    ? 'rgba(32, 190, 83, 0.13)'
    : 'rgba(152, 162, 179, 0.12)';
  const actionColor = !canControl
    ? '#98A2B3'
    : isCharging
    ? '#E5484D'
    : '#20BE53';
  const ActionIcon = isCharging ? Svgs.HeroStop : Svgs.HeroStart;

  useEffect(() => {
    if (!isEnergyActive) {
      ringRotation.stopAnimation();
      pulseProgress.stopAnimation();
      particleProgress.stopAnimation();
      ringRotation.setValue(0);
      pulseProgress.setValue(0);
      particleProgress.setValue(0);
      return;
    }

    const ringAnimation = Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseProgress, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseProgress, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const particleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(particleProgress, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particleProgress, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    ringAnimation.start();
    pulseAnimation.start();
    particleAnimation.start();

    return () => {
      ringAnimation.stop();
      pulseAnimation.stop();
      particleAnimation.stop();
    };
  }, [isEnergyActive, particleProgress, pulseProgress, ringRotation]);

  const ringRotate = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const glowScale = pulseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.07],
  });
  const particleOffset = particleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [5, -7],
  });
  const heroHeight = scrollY.interpolate({
    inputRange: [0, HERO_COLLAPSE_DISTANCE],
    outputRange: [moderateWidth(62), moderateWidth(48)],
    extrapolate: 'clamp',
  });
  const heroScale = scrollY.interpolate({
    inputRange: [0, HERO_COLLAPSE_DISTANCE],
    outputRange: [1, HERO_COMPACT_SCALE],
    extrapolate: 'clamp',
  });
  const ringOpacity = scrollY.interpolate({
    inputRange: [0, HERO_COLLAPSE_DISTANCE],
    outputRange: [1, 0.68],
    extrapolate: 'clamp',
  });
  const glowOpacityWhenCollapsed = scrollY.interpolate({
    inputRange: [0, HERO_COLLAPSE_DISTANCE],
    outputRange: [1, 0.32],
    extrapolate: 'clamp',
  });
  const handleActionPress = () => {
    onChargeChange(!isCharging).catch(() => undefined);
  };

  return (
    <Animated.View style={[styles.heroSection, { height: heroHeight }]}>
      <Animated.View
        style={[styles.heroOrbit, { transform: [{ scale: heroScale }] }]}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.heroGlow, { opacity: glowOpacityWhenCollapsed }]}
        >
          <Animated.View
            style={[
              styles.heroGlowFill,
              { backgroundColor: glowColor },
              isEnergyActive && {
                transform: [{ scale: glowScale }],
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.heroEnergyRing, { opacity: ringOpacity }]}
        >
          <Animated.View
            style={[
              styles.heroEnergyRingContent,
              { transform: [{ rotate: ringRotate }] },
            ]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 240 240">
              <Defs>
                <LinearGradient
                  id="heroEnergyGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0" stopColor={accentColor} />
                  <Stop offset="1" stopColor={secondaryColor} />
                </LinearGradient>
              </Defs>
              <Circle
                cx="120"
                cy="120"
                r="110"
                fill="none"
                stroke="#E3E9E5"
                strokeWidth="3"
              />
              <Circle
                cx="120"
                cy="120"
                r="110"
                fill="none"
                opacity={isEnergyActive ? 1 : 0.72}
                stroke="url(#heroEnergyGradient)"
                strokeWidth={isEnergyActive ? 6 : 4}
                strokeDasharray={isEnergyActive ? '30 14' : '690 1'}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>
        </Animated.View>

        {isEnergyActive ? (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroParticle,
                styles.heroParticleOne,
                {
                  backgroundColor: accentColor,
                  transform: [{ translateY: particleOffset }],
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroParticle,
                styles.heroParticleTwo,
                {
                  backgroundColor: secondaryColor,
                  transform: [{ translateY: particleOffset }],
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroParticle,
                styles.heroParticleThree,
                {
                  backgroundColor: accentColor,
                  transform: [{ translateY: particleOffset }],
                },
              ]}
            />
          </>
        ) : null}

        <View style={styles.heroCircle}>
          <View style={styles.heroStatusArea}>
            <AppText
              semibold
              centered
              label="CHARGER STATUS"
              style={styles.heroEyebrow}
            />
            <AppText
              bold
              centered
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
              label={heroStatus}
              style={[styles.heroStatusText, { color: accentColor }]}
            />
          </View>

          <View style={styles.heroDivider} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isCharging ? 'Stop charging' : 'Start charging'}
            accessibilityState={{ disabled: !canControl, busy: isPublishing }}
            disabled={!canControl || isPublishing}
            onPress={handleActionPress}
            style={({ pressed }) => [
              styles.heroAction,
              (!canControl || isPublishing) && styles.heroActionDisabled,
              pressed && styles.heroActionPressed,
            ]}
          >
            {SHOW_HERO_ACTION_ICON ? (
              <Animated.View
                style={[
                  styles.heroActionIcon,
                  { backgroundColor: `${actionColor}18` },
                  isEnergyActive && {
                    transform: [{ translateY: particleOffset }],
                  },
                ]}
              >
                <ActionIcon
                  color={actionColor}
                  width={styles.heroActionSvg.width}
                  height={styles.heroActionSvg.height}
                />
              </Animated.View>
            ) : null}
            <AppText
              semibold
              centered
              label={
                isPublishing ? 'SENDING COMMAND' : isCharging ? 'STOP' : 'START'
              }
              style={[styles.heroActionLabel, { color: actionColor }]}
            />
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

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
    handleChargeChange,
    currentControl,
  } = useDashboard();
  const { phaseParameters, telemetry } = dashboard;
  const [phaseParametersExpanded, setPhaseParametersExpanded] = useState(false);
  const alertPulseScale = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
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

      <View style={styles.topBar}>
        {dashboard.hasFault ? (
          <Pressable
            hitSlop={8}
            style={styles.iconButton}
            accessibilityRole="button"
            onPress={handleAlertsPress}
            accessibilityLabel="Open charger alerts"
          >
            <Animated.View style={{ transform: [{ scale: alertPulseScale }] }}>
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

      <ChargingHero
        styles={styles}
        scrollY={scrollY}
        isCharging={isCharging}
        hasFault={dashboard.hasFault}
        cpStatus={telemetry.cpStatus}
        canControl={dashboard.canControl}
        isConnected={dashboard.isConnected}
        statusText={telemetry.cpStatusText}
        onChargeChange={handleChargeChange}
        isPublishing={dashboard.isPublishing}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        bounces={false}
        scrollEnabled={!isSwiping}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* <View style={styles.heroSpace} /> */}

        {/* <View
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
        </View> */}

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
      </Animated.ScrollView>
      <Loader visible={dashboard.isLoading} loaderColor="#0BB2C3" />
    </ImageBackground>
  );
};
