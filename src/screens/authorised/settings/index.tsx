import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Svgs } from '@assets/svgs';
import { useSettings } from './useSettings';
import { AppButton, AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

export const Settings = () => {
  const { styles, options, profile, currentControl } = useSettings();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.profileContent}>
          <AppText
            semibold
            numberOfLines={2}
            label={profile.name}
            style={styles.profileName}
          />

          {/* {profile.username ? (
            <AppText
              label={`@${profile.username}`}
              style={styles.profileUsername}
            />
          ) : null} */}

          {profile.email ? (
            <View style={styles.detailRow}>
              <Svgs.Mail width={15} height={15} />
              <AppText
                medium
                numberOfLines={2}
                label={profile.email}
                style={styles.detailText}
              />
            </View>
          ) : null}

          {profile.phone ? (
            <View style={styles.detailRow}>
              <Svgs.Phone width={15} height={15} />
              <AppText
                medium
                numberOfLines={2}
                label={profile.phone}
                style={styles.detailText}
              />
            </View>
          ) : null}
        </View>
      </View>

      {/* <AppText semibold label="Settings" style={styles.heading} /> */}

      {options.map(option => (
        <AppButton
          key={option.title}
          title={option.title}
          loader={option.loader}
          onPress={option.onPress}
          disabled={option.disabled}
          style={styles.optionButton}
        />
      ))}

      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel="Current control"
        accessibilityActions={[
          { name: 'increment', label: 'Increase current' },
          { name: 'decrement', label: 'Decrease current' },
        ]}
        accessibilityValue={{
          min: currentControl.minimum,
          max: currentControl.maximum,
          now: currentControl.value,
          text: `${currentControl.value} amps`,
        }}
        onAccessibilityAction={currentControl.handleAccessibilityAction}
        onLayout={currentControl.handleLayout}
        onPress={currentControl.handleTap}
        style={styles.currentControl}
        {...currentControl.panHandlers}
      >
        <Svg
          width="100%"
          height="100%"
          pointerEvents="none"
          style={styles.currentControlGradient}
        >
          <Defs>
            <LinearGradient
              id="currentControlGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <Stop offset="0" stopColor="#0BB2C3" />
              <Stop offset="1" stopColor="#3AC34B" />
            </LinearGradient>
          </Defs>
          <Rect
            width="100%"
            height="100%"
            fill="url(#currentControlGradient)"
          />
        </Svg>

        <View pointerEvents="none" style={styles.currentControlContent}>
          <AppText
            semibold
            label={`${currentControl.value} A`}
            style={styles.currentValue}
          />

          <View style={styles.currentTrack}>
            <View
              style={[
                styles.currentTrackFill,
                { width: currentControl.fillWidth },
              ]}
            />
            <View
              style={[
                styles.currentThumb,
                { left: currentControl.thumbPosition },
              ]}
            />
          </View>
        </View>
      </Pressable>
    </AuthorisedScreen>
  );
};

export default Settings;
