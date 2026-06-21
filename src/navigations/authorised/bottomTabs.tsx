import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Svgs } from '@assets/svgs';
import { AppText } from '@components';
import { routes } from '../routes';
import * as Screens from '@screens/index';

import useStyles from './bottomTabs.styles';

type TabIconProps = {
  color?: string;
  width?: number;
  height?: number;
};

type TabItem = {
  label: string;
  icon: React.ComponentType<TabIconProps>;
};

const Tab = createBottomTabNavigator();

const TAB_ITEMS: Record<string, TabItem> = {
  [routes.app.dashboard]: {
    label: 'Dashboard',
    icon: Svgs.TabDashboard,
  },
  [routes.app.settings]: {
    label: 'Settings',
    icon: Svgs.TabSettings,
  },
  [routes.app.chargingHistory]: {
    label: 'Charging History',
    icon: Svgs.TabChargingHistory,
  },
};

const ActiveTabBackground = () => (
  <Svg
    width="100%"
    height="100%"
    pointerEvents="none"
    style={StyleSheet.absoluteFill}
  >
    <Defs>
      <LinearGradient id="activeTabGradient" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#31C44C" />
        <Stop offset="1" stopColor="#0BB2C3" />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" rx="24" fill="url(#activeTabGradient)" />
  </Svg>
);

const BottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const styles = useStyles();
  const isDashboardActive =
    state.routes[state.index]?.name === routes.app.dashboard;

  return (
    <View
      style={[styles.container, isDashboardActive && styles.dashboardContainer]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tabItem = TAB_ITEMS[route.name];
          const Icon = tabItem.icon;

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const handleLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              onPress={handlePress}
              onLongPress={handleLongPress}
              accessibilityRole="button"
              accessibilityLabel={tabItem.label}
              accessibilityState={isFocused ? { selected: true } : {}}
              style={({ pressed }) => [
                styles.tabButton,
                isFocused && styles.activeTabButton,
                pressed && styles.pressedTabButton,
              ]}
            >
              {isFocused ? <ActiveTabBackground /> : null}

              <View style={styles.tabContent}>
                <Icon
                  width={styles.tabIcon.width}
                  height={styles.tabIcon.height}
                  color={isFocused ? '#FFFFFF' : '#607578'}
                />
                {isFocused ? (
                  <AppText
                    semibold
                    label={tabItem.label}
                    style={styles.activeTabLabel}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const renderBottomTabBar = (props: BottomTabBarProps) => (
  <BottomTabBar {...props} />
);

export const MainTabs = () => (
  <Tab.Navigator
    initialRouteName={routes.app.dashboard}
    tabBar={renderBottomTabBar}
    screenOptions={{
      headerShown: false,
      lazy: true,
      tabBarHideOnKeyboard: true,
    }}
  >
    <Tab.Screen name={routes.app.dashboard} component={Screens.Dashboard} />
    <Tab.Screen name={routes.app.settings} component={Screens.Settings} />
    <Tab.Screen
      name={routes.app.chargingHistory}
      component={Screens.ChargingHistory}
    />
  </Tab.Navigator>
);

export default MainTabs;
