import { Dispatch, SetStateAction } from 'react';
import { TextInputProps, ViewStyle } from 'react-native';

interface AppInputProps extends TextInputProps {
  title?: string;
  error?: string;
  style?: ViewStyle;
  isNumber?: boolean;
  isRequired?: boolean;
  borderWidth?: boolean;
  removeTopMargin?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onPress?: () => void;
  handleScanBarcode?: () => void;
  setError?: Dispatch<SetStateAction<string>>;
  onBlur?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  requireDoubleTap?: boolean;
  focusSignal?: number;
  onAdd?: () => void;
  keyboardVisible?: boolean;
  qty?: any;
}

export type { AppInputProps };
