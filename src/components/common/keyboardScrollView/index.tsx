import React, { memo } from 'react';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAvoiderProps extends KeyboardAwareScrollViewProps {}

const KeyboardAvoider = ({
  children,
  bounces,
  alwaysBounceVertical,
  refreshControl,
  extraScrollHeight,
  contentContainerStyle = {},
  ...scrollViewProps
}: KeyboardAvoiderProps) => {
  const hasRefreshControl = Boolean(refreshControl);

  return (
    <KeyboardAwareScrollView
      {...scrollViewProps}
      enableOnAndroid
      bounces={bounces ?? hasRefreshControl}
      alwaysBounceVertical={alwaysBounceVertical ?? hasRefreshControl}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      extraScrollHeight={extraScrollHeight}
      contentContainerStyle={contentContainerStyle}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default memo(KeyboardAvoider);
