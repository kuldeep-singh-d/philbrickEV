import '@react-navigation/native';
import { ColorValue } from 'react-native';

type Color = ColorValue | string;

export type Theme = {
  dark: boolean;
  colors: {
    card: Color;
    text: Color;
    gray: Color;
    white: Color;
    black: Color;
    border: Color;
    primary: Color;
    overlay: Color;
    secondary: Color;
    toastWarn: Color;
    toastError: Color;
    background: Color;
    toastSuccess: Color;
    notification: Color;
  };
};
declare module '@react-navigation/native' {
  export function useTheme(): Theme;
}
