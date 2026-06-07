import React, {memo} from 'react';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAvoiderProps extends KeyboardAwareScrollViewProps {}

const KeyboardAvoider = ({
  children,
  bounces = false,
  extraScrollHeight,
  contentContainerStyle = {},
}: KeyboardAvoiderProps) => {
  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      bounces={bounces}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      extraScrollHeight={extraScrollHeight}
      contentContainerStyle={contentContainerStyle}>
      {children}
    </KeyboardAwareScrollView>
  );
};

export default memo(KeyboardAvoider);
