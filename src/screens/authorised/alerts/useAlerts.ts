import { useRoute } from '@react-navigation/native';

import useStyles from './styles';

type AlertRouteParams = {
  alerts?: Array<{
    id?: string;
    title?: string;
  }>;
};

export const useAlerts = () => {
  const styles = useStyles();
  const route = useRoute();
  const params = route.params as AlertRouteParams | undefined;
  const alerts = Array.isArray(params?.alerts)
    ? params.alerts
        .filter(alert => alert?.title)
        .map((alert, index) => ({
          id: alert.id || `${index}`,
          title: alert.title || 'Charger alert',
        }))
    : [];

  return {
    alerts,
    styles,
  };
};

export default useAlerts;
