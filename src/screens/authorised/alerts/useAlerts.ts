import { useRoute } from '@react-navigation/native';

import useStyles from './styles';

export type AlertKind =
  | 'voltage'
  | 'current'
  | 'temperature'
  | 'earth'
  | 'scd'
  | 'emergency'
  | 'rcd'
  | 'generic';

const getAlertPresentation = (title: string) => {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('voltage')) {
    return { kind: 'voltage' as const, category: 'Voltage' };
  }

  if (normalizedTitle.includes('current')) {
    return { kind: 'current' as const, category: 'Current' };
  }

  if (normalizedTitle.includes('temperature')) {
    return { kind: 'temperature' as const, category: 'Temperature' };
  }

  if (normalizedTitle.includes('earth')) {
    return { kind: 'earth' as const, category: 'Earth fault' };
  }

  if (normalizedTitle.includes('scd')) {
    return { kind: 'scd' as const, category: 'Trip / Safety' };
  }

  if (normalizedTitle.includes('emergency')) {
    return { kind: 'emergency' as const, category: 'Trip / Safety' };
  }

  if (normalizedTitle.includes('rcd')) {
    return { kind: 'rcd' as const, category: 'Trip / Safety' };
  }

  return { kind: 'generic' as const, category: 'Charger alert' };
};

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
        .map((alert, index) => {
          const title = alert.title || 'Charger alert';

          return {
            id: alert.id || `${index}`,
            title,
            ...getAlertPresentation(title),
          };
        })
    : [];

  return {
    alerts,
    styles,
  };
};

export default useAlerts;
