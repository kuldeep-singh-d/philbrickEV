import useStyles from './styles';

const ALERTS = [
  { id: '1', title: 'Over Voltage' },
  { id: '2', title: 'Over Voltage' },
  { id: '3', title: 'Over Voltage' },
  { id: '4', title: 'Over Voltage' },
];

export const useAlerts = () => {
  const styles = useStyles();

  return {
    alerts: ALERTS,
    styles,
  };
};

export default useAlerts;
