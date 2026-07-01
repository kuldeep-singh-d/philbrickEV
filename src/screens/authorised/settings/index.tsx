import React from 'react';
import { View } from 'react-native';

import { Svgs } from '@assets/svgs';
import { useSettings } from './useSettings';
import { AppButton, AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

export const Settings = () => {
  const { styles, options, profile } = useSettings();

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

          {profile.username ? (
            <AppText
              label={`@${profile.username}`}
              style={styles.profileUsername}
            />
          ) : null}

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
    </AuthorisedScreen>
  );
};

export default Settings;
