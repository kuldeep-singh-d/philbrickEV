import fonts from '@assets/fonts';
import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      paddingTop: moderateHeight(2.6),
    },
    profileCard: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#D8F5DD',
      backgroundColor: '#F0FBF2',
      borderRadius: moderateWidth(4),
      marginBottom: moderateHeight(1),
      paddingHorizontal: moderateWidth(4),
      paddingVertical: moderateHeight(1.5),
    },
    avatar: {
      alignItems: 'center',
      justifyContent: 'center',
      width: moderateWidth(16),
      height: moderateWidth(16),
      backgroundColor: '#0BB2C3',
      marginRight: moderateWidth(4),
      borderRadius: moderateWidth(8),
    },
    avatarText: {
      color: '#FFFFFF',
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(2.4),
    },
    profileContent: {
      flex: 1,
    },
    profileName: {
      textTransform: 'capitalize',
      fontSize: moderateHeight(2),
      lineHeight: moderateHeight(2.8),
    },
    profileUsername: {
      color: '#0A8E9B',
      fontSize: moderateHeight(1.4),
      marginTop: moderateHeight(0.1),
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateHeight(0.6),
    },
    detailText: {
      flex: 1,
      color: '#000000',
      marginLeft: moderateWidth(2),
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2),
    },
    heading: {
      fontSize: moderateHeight(2),
      marginBottom: moderateHeight(1),
    },
    optionButton: {
      width: '100%',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      height: moderateHeight(5.5),
      borderRadius: moderateWidth(3),
    },
    optionGradient: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    optionText: {
      color: '#FFFFFF',
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(2.4),
      lineHeight: moderateHeight(3.2),
    },
  });
};

export default useStyles;
