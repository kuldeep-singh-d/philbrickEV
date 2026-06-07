import { StatusBarProps } from 'react-native';

interface AppStatusBarProps extends StatusBarProps {
  absolute?: boolean;
  translucent?: boolean;
  backgroundColor?: any;
}

export type { AppStatusBarProps };
