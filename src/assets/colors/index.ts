const common = Object.freeze({
  white: '#FFFFFF',
  black: '#000000',
  card: 'transparent',
  border: '#E5E7EB',
  background: '#F3F4F6',
  notification: 'transparent',
  //
  gray: '#6B7280',
  toastWarn: '#FFF5CF',
  toastError: '#FFDFDF',
  toastSuccess: '#D7FFFF',
  overlay: 'rgba(0,0,0,0.2)',
});

export const colors = {
  light: {
    text: '#021330',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    ...common,
  },
  dark: {
    text: '#FFFFFF',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    ...common,
  },
};
