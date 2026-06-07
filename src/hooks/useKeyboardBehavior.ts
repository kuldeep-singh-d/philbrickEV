import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

type KeyboardBehavior = 'padding' | 'height' | 'position' | undefined;

/**
 * Hook to manage keyboard visibility and provide appropriate KeyboardAvoidingView behavior
 * @returns {Object} - isKeyboardVisible: boolean, behavior: 'padding' | 'height' | undefined
 */
export const useKeyboardBehavior = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  // For iOS: always use 'padding'
  // For Android: use 'height' only when keyboard is visible, undefined otherwise
  const behavior: KeyboardBehavior =
    Platform.OS === 'ios'
      ? 'padding'
      : isKeyboardVisible
      ? 'height'
      : undefined;

  return {
    isKeyboardVisible,
    behavior,
  };
};

export default useKeyboardBehavior;
