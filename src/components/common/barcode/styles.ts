import { StyleSheet } from 'react-native';

const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;
const VIEWFINDER_SIZE = 260;

export const useStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    camera: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: 'space-between',
    },

    permissionContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
    },
    permissionText: {
      fontSize: 16,
    },
    viewfinderContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewfinder: {
      width: VIEWFINDER_SIZE,
      height: VIEWFINDER_SIZE,
      position: 'relative',
    },
    corner: {
      position: 'absolute',
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      borderColor: '#3B82F6',
    },
    topLeft: {
      top: 0,
      left: 0,
      borderTopWidth: CORNER_WIDTH,
      borderLeftWidth: CORNER_WIDTH,
      borderTopLeftRadius: 8,
    },
    topRight: {
      top: 0,
      right: 0,
      borderTopWidth: CORNER_WIDTH,
      borderRightWidth: CORNER_WIDTH,
      borderTopRightRadius: 8,
    },
    bottomLeft: {
      bottom: 0,
      left: 0,
      borderBottomLeftRadius: 8,
      borderLeftWidth: CORNER_WIDTH,
      borderBottomWidth: CORNER_WIDTH,
    },
    bottomRight: {
      right: 0,
      bottom: 0,
      borderBottomRightRadius: 8,
      borderBottomWidth: CORNER_WIDTH,
      borderRightWidth: CORNER_WIDTH,
    },
    hintText: {
      marginTop: 20,
      fontSize: 14,
      textAlign: 'center',
      opacity: 0.7,
    },
  });
};
