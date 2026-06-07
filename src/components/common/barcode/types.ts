/**
 * TypeScript types for the native barcode scanner module.
 */

export interface BarcodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BarcodeResult {
  data: string;
  format: string;
  bounds: BarcodeBounds;
}

export interface BarcodeScannerNativeEvent {
  nativeEvent: BarcodeResult;
}

export interface BarcodeScannerErrorEvent {
  nativeEvent: {
    message: string;
  };
}

import { StyleProp, ViewStyle } from 'react-native';

export interface BarcodeScannerViewProps {
  style?: StyleProp<ViewStyle>;
  onError?: (event: BarcodeScannerErrorEvent) => void;
  onBarcodeScanned?: (event: BarcodeScannerNativeEvent) => void;
}

export interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string, format: string) => void;
}
