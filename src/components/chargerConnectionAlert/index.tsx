import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { images } from '@assets/imgaes';
import AppText from '../common/appText';

export type ChargerConnectionAlertProps = {
  visible: boolean;
  isRetrying?: boolean;
  onRetry: () => void;
};

type CauseType = 'wifi' | 'internet' | 'charger';

const CauseIcon = ({ type }: { type: CauseType }) => {
  if (type === 'wifi') {
    return (
      <Svg width={52} height={44} viewBox="0 0 52 44" fill="none">
        <Path
          d="M10 18C18.84 10.67 33.16 10.67 42 18"
          stroke="#0BB2C3"
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Path
          d="M17 25C22.06 21 29.94 21 35 25"
          stroke="#18B94B"
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Circle cx={26} cy={33} r={4} fill="#0BB2C3" />
        <Circle cx={39} cy={31} r={9} fill="#ED3237" />
        <Path
          d="M36 28L42 34M42 28L36 34"
          stroke="#FFFFFF"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (type === 'internet') {
    return (
      <Svg width={52} height={44} viewBox="0 0 52 44" fill="none">
        <Circle cx={25} cy={22} r={16} stroke="#0BB2C3" strokeWidth={3} />
        <Path
          d="M9 22H41M25 6C20 11 18 16.5 18 22C18 27.5 20 33 25 38M25 6C30 11 32 16.5 32 22C32 27.5 30 33 25 38"
          stroke="#18B94B"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <Circle cx={39} cy={31} r={9} fill="#ED3237" />
        <Path
          d="M36 28L42 34M42 28L36 34"
          stroke="#FFFFFF"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={52} height={44} viewBox="0 0 52 44" fill="none">
      <Path
        d="M12 38H35"
        stroke="#8BCF9B"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Rect
        x={13.5}
        y={5}
        width={21}
        height={33}
        rx={5.5}
        fill="#F8FFFA"
        stroke="#0BB2C3"
        strokeWidth={2.8}
      />
      <Rect
        x={18}
        y={10}
        width={12}
        height={9}
        rx={2}
        fill="#EAFBF1"
        stroke="#0BB2C3"
        strokeWidth={2.2}
      />
      <Path
        d="M24 23L19.5 30H23L21.8 35L27.8 26.5H24.2L24 23Z"
        fill="#18B94B"
      />
      <Path
        d="M34.5 17H38.5C40.4 17 42 18.6 42 20.5V25.5"
        stroke="#18251B"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Path
        d="M39 25.5H45M40 21.5V25.5M44 21.5V25.5"
        stroke="#18251B"
        strokeWidth={2.3}
        strokeLinecap="round"
      />
      <Path
        d="M18 3H30"
        stroke="#18B94B"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Circle cx={39.5} cy={32} r={9.5} fill="#ED3237" />
      <Path
        d="M36.2 28.7L42.8 35.3M42.8 28.7L36.2 35.3"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const ChargerConnectionAlert = ({
  visible,
  isRetrying = false,
  onRetry,
}: ChargerConnectionAlertProps) => {
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[
        styles.overlay,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 18),
        },
      ]}
    >
      <Svg pointerEvents="none" style={styles.gradientBackground}>
        <Defs>
          <LinearGradient
            id="chargerConnectionAlertBg"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <Stop offset="0" stopColor="#EAFBF1" />
            <Stop offset="1" stopColor="#C3FFCB" />
          </LinearGradient>
        </Defs>
        <Rect
          width="100%"
          height="100%"
          fill="url(#chargerConnectionAlertBg)"
        />
      </Svg>

      <View style={styles.header}>
        <Image
          resizeMode="contain"
          style={styles.logo}
          source={images.headerLogo}
        />
      </View>

      <ScrollView
        bounces={false}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppText
          bold
          centered
          numberOfLines={2}
          label={
            <>
              Unable to <Text style={styles.titleAccent}>Connect</Text>
            </>
          }
          style={styles.title}
        />

        <AppText
          medium
          centered
          numberOfLines={2}
          label="We're unable to retrieve live data from your charger."
          style={styles.description}
        />

        <View style={styles.causesBox}>
          <View style={styles.causesHeader}>
            <View style={styles.headerLine} />
            <AppText
              semibold
              centered
              label="Possible causes"
              style={styles.causesTitle}
            />
            <View style={styles.headerLine} />
          </View>

          <View style={styles.causesRow}>
            <View style={styles.causeItem}>
              <CauseIcon type="wifi" />
              <AppText
                medium
                centered
                numberOfLines={3}
                label="Weak or unstable Wi-Fi signal"
                style={styles.causeText}
              />
            </View>
            <View style={styles.causeDivider} />
            <View style={styles.causeItem}>
              <CauseIcon type="internet" />
              <AppText
                medium
                centered
                numberOfLines={3}
                label="No internet connectivity"
                style={styles.causeText}
              />
            </View>
            <View style={styles.causeDivider} />
            <View style={styles.causeItem}>
              <CauseIcon type="charger" />
              <AppText
                medium
                centered
                numberOfLines={3}
                label="Charger is offline"
                style={styles.causeText}
              />
            </View>
          </View>
        </View>

        <View style={styles.guidanceCard}>
          <View style={styles.shieldIcon}>
            <Svg width={36} height={40} viewBox="0 0 36 40" fill="none">
              <Path
                d="M18 3L31 8V17C31 26 26 33 18 37C10 33 5 26 5 17V8L18 3Z"
                stroke="#0BB2C3"
                strokeWidth={3}
                strokeLinejoin="round"
              />
              <Path
                d="M12 20L16.5 24.5L25 15"
                stroke="#18B94B"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <AppText
            medium
            numberOfLines={3}
            label="Please check your network connection and make sure the charger is powered on."
            style={styles.guidanceText}
          />
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isRetrying, disabled: isRetrying }}
        disabled={isRetrying}
        onPress={onRetry}
        style={[styles.button, isRetrying && styles.buttonDisabled]}
      >
        {isRetrying ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
        <AppText
          semibold
          centered
          label={isRetrying ? 'Retrying...' : 'Retry'}
          style={styles.buttonText}
        />
      </Pressable>

      <View style={styles.autoReconnectNote}>
        <View style={styles.infoIcon}>
          <AppText semibold centered label="i" style={styles.infoIconText} />
        </View>
        <AppText
          medium
          numberOfLines={2}
          label="The app will reconnect automatically when charger communication is restored."
          style={styles.footerText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    zIndex: 50,
    elevation: 50,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 430,
    alignSelf: 'center',
    paddingTop: 12,
    paddingBottom: 18,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  logo: {
    width: 220,
    height: 54,
  },
  title: {
    color: '#18251B',
    fontSize: 34,
    lineHeight: 42,
    marginBottom: 8,
  },
  titleAccent: {
    color: '#18B94B',
  },
  description: {
    color: '#4B5563',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 22,
    maxWidth: 330,
  },
  causesBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CFE4D6',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 14,
    // shadowColor: '#315B39',
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    // shadowOffset: { width: 0, height: 5 },
    // elevation: 3,
  },
  causesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDE7DF',
  },
  causesTitle: {
    color: '#0BB2C3',
    fontSize: 17,
    marginHorizontal: 12,
  },
  causesRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  causeItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  causeDivider: {
    width: 1,
    marginHorizontal: 8,
    backgroundColor: '#DDE7DF',
  },
  causeText: {
    color: '#18251B',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  guidanceCard: {
    width: '100%',
    minHeight: 82,
    borderWidth: 1,
    borderColor: '#CFE4D6',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  shieldIcon: {
    width: 48,
    alignItems: 'center',
    marginRight: 12,
  },
  guidanceText: {
    flex: 1,
    color: '#344054',
    fontSize: 15,
    lineHeight: 22,
  },
  footerText: {
    color: '#344054',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  button: {
    width: '100%',
    maxWidth: 430,
    minHeight: 58,
    alignSelf: 'center',
    borderRadius: 14,
    backgroundColor: '#0BB2C3',
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  autoReconnectNote: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6EBDD',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoIconText: {
    color: '#18B94B',
    fontSize: 13,
  },
});

export default ChargerConnectionAlert;
