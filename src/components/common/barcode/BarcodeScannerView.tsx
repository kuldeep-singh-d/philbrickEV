import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  UIManager,
  ViewStyle,
  StyleProp,
  findNodeHandle,
  requireNativeComponent,
} from 'react-native';
import {
  BarcodeScannerViewProps,
  BarcodeScannerErrorEvent,
  BarcodeScannerNativeEvent,
} from './types';

/**
 * Native component reference to the BarcodeScannerView.
 * Supported on both Android (CameraX + ML Kit) and iOS (AVFoundation).
 */
const NativeScannerView = requireNativeComponent<BarcodeScannerViewProps>('BarcodeScannerView');

export interface BarcodeScannerHandle {
  stopScan: () => void;
  startScan: () => void;
  toggleTorch: (enable: boolean) => void;
}

interface Props {
  style?: StyleProp<ViewStyle>;
  onError?: (event: BarcodeScannerErrorEvent) => void;
  onBarcodeScanned?: (event: BarcodeScannerNativeEvent) => void;
}

/**
 * React wrapper around the native BarcodeScannerView.
 *
 * Usage:
 * ```tsx
 * const scannerRef = useRef<BarcodeScannerHandle>(null);
 * <BarcodeScannerView
 *   ref={scannerRef}
 *   style={{ flex: 1 }}
 *   onBarcodeScanned={(e) => console.log(e.nativeEvent)}
 * />
 * scannerRef.current?.startScan();
 * ```
 */
const BarcodeScannerView = forwardRef<BarcodeScannerHandle, Props>(
  ({ style, onBarcodeScanned, onError }, ref) => {
    const nativeRef = useRef(null);

    /**
     * Dispatch a native command to the view manager.
     */
    const dispatchCommand = (command: string, args: any[] = []) => {
      const handle = findNodeHandle(nativeRef.current);
      if (handle == null) return;

      UIManager.dispatchViewManagerCommand(handle, command, args);
    };

    useImperativeHandle(ref, () => ({
      startScan: () => dispatchCommand('startScan'),
      stopScan: () => dispatchCommand('stopScan'),
      toggleTorch: (enable: boolean) =>
        dispatchCommand('toggleTorch', [enable]),
    }));


    return (
      <NativeScannerView
        style={style}
        ref={nativeRef}
        onError={onError}
        onBarcodeScanned={onBarcodeScanned}
      />
    );
  },
);

BarcodeScannerView.displayName = 'BarcodeScannerView';

export default BarcodeScannerView;
