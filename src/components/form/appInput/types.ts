import { Dispatch, ReactNode, SetStateAction } from 'react';
import { TextInputProps, ViewStyle } from 'react-native';

interface AppInputProps extends TextInputProps {
  title?: string;
  error?: string;
  style?: ViewStyle;
  password?: boolean;
  isRequired?: boolean;
  borderWidth?: boolean;
  secureEntry?: boolean;
  isContactNumber?: boolean;
  removeTopMargin?: boolean;
  isPassword?: boolean;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  gradientBorder?: boolean;
  onPress?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  setError?: Dispatch<SetStateAction<string>>;
}

export type { AppInputProps };
