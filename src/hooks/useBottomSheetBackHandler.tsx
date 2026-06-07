import { BackHandler } from 'react-native';
import { Dispatch, SetStateAction, useCallback, useRef } from 'react';

type DismissibleRef = {
  current?: {
    dismiss?: () => void;
  } | null;
};

const useBottomSheetBackHandler = (
  bottomSheetRef: DismissibleRef,
  setBottomSheetState?: Dispatch<SetStateAction<boolean>>,
) => {
  const backHandlerSubscriptionRef = useRef<ReturnType<
    typeof BackHandler.addEventListener
  > | null>(null);
  const handleSheetPositionChange = useCallback(
    (index: number) => {
      const isBottomSheetVisible = index >= 0;
      if (isBottomSheetVisible && !backHandlerSubscriptionRef.current) {
        backHandlerSubscriptionRef.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            bottomSheetRef.current?.dismiss?.();
            return true;
          },
        );
        setBottomSheetState?.(true);
      } else if (!isBottomSheetVisible) {
        backHandlerSubscriptionRef.current?.remove();
        backHandlerSubscriptionRef.current = null;
        setBottomSheetState?.(false);
      }
    },
    [bottomSheetRef, setBottomSheetState],
  );
  return { handleSheetPositionChange };
};

export { useBottomSheetBackHandler };
