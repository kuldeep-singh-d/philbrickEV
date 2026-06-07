import React, {useEffect} from 'react';
import {Dimensions, PixelRatio, ScaledSize} from 'react-native';

export const useDeviceDimensions = () => {
  const [screenData, setScreenData] = React.useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = ({window}: {window: ScaledSize}) => {
      setScreenData(window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  let width = screenData.width > 450 ? 450 : screenData.width;
  let height = screenData.height;

  const moderateWidth = (widthPercent: number): number => {
    return PixelRatio.roundToNearestPixel((width * widthPercent) / 100);
  };

  const moderateHeight = (heightPercent: number): number => {
    return PixelRatio.roundToNearestPixel((height * heightPercent) / 100);
  };

  return {
    moderateWidth,
    moderateHeight,
    width: screenData.width,
    height: screenData.height,
  };
};
