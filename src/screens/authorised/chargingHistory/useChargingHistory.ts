import useStyles from './styles';

export type ChargingHistoryItem = {
  id: string;
  startedAt: string;
  duration?: string;
  energy?: number;
};

export const useChargingHistory = () => {
  const styles = useStyles();
  const history: ChargingHistoryItem[] = [];

  return {
    history,
    styles,
  };
};

export default useChargingHistory;
