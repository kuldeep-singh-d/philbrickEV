import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Alert,
  Modal,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import { useStyles } from './styles';
import { AppText } from '@components';
import { useTheme } from '@react-navigation/native';
import { BarcodeScannerModalProps, BarcodeScannerNativeEvent } from './types';
import BarcodeScannerView, { BarcodeScannerHandle } from './BarcodeScannerView';

/**
 * Full-screen modal that wraps the native BarcodeScannerView.
 *
 * Handles:
 *  - Camera permission request
 *  - Auto start/stop scanning on open/close
 *  - Torch toggle
 *  - Close button
 *  - Passes scanned data back via onScanned callback
 */

const BarcodeScannerModal = ({
  visible,
  onClose,
  onScanned,
}: BarcodeScannerModalProps) => {
  const { colors } = useTheme();
  const styles = useStyles();

  const scannerRef = useRef<BarcodeScannerHandle>(null);
  const isHandlingScanRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [scanCooldown, setScanCooldown] = useState(false);

  // ── Request camera permission ──
  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to scan barcodes.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
            buttonNeutral: 'Later',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera permission from Settings to scan barcodes.',
            [
              { text: 'Cancel', onPress: onClose, style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
        } else {
          onClose();
        }
      } catch (err) {
        console.error('Permission error:', err);
        onClose();
      }
    } else {
      // iOS: The native BarcodeScannerView handles AVCaptureDevice.requestAccess
      // internally. We set permission to true here so the native view mounts.
      // If the user denies camera access, the native view's onError callback
      // will fire with "Camera permission not granted".
      setHasPermission(true);
    }
  }, [onClose]);

  // ── Auto-request permission and start scanning when modal opens ──
  useEffect(() => {
    if (visible) {
      requestPermission();
    } else {
      setHasPermission(false);
    }
  }, [visible, requestPermission]);

  // ── Start scanning once permission is granted ──
  useEffect(() => {
    if (visible && hasPermission) {
      // Small delay to ensure native view is mounted
      const timer = setTimeout(() => {
        isHandlingScanRef.current = false;
        scannerRef.current?.startScan();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible, hasPermission]);

  // ── Restart scanning after an item scan when the modal remains open ──
  useEffect(() => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }

    if (visible && hasPermission && scanCooldown) {
      cooldownTimerRef.current = setTimeout(() => {
        isHandlingScanRef.current = false;
        scannerRef.current?.startScan();
        setScanCooldown(false);
        cooldownTimerRef.current = null;
      }, 500);
    }

    if (!visible) {
      isHandlingScanRef.current = false;
      setScanCooldown(false);
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [visible, hasPermission, scanCooldown]);

  // ── Handle barcode scanned ──
  const handleBarcodeScanned = useCallback(
    (event: BarcodeScannerNativeEvent) => {
      const { data, format } = event.nativeEvent;
      if (isHandlingScanRef.current) {
        return;
      }

      isHandlingScanRef.current = true;
      // Stop scanning to prevent duplicate reads, then restart if modal remains open.
      scannerRef.current?.stopScan();
      onScanned(data, format);
      setScanCooldown(true);
    },
    [onScanned],
  );

  // ── Handle scanner error ──
  const handleError = useCallback((event: any) => {
    console.error('Scanner error:', event.nativeEvent?.message);
  }, []);

  // ── Close handler ──
  const handleClose = useCallback(() => {
    scannerRef.current?.stopScan();
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {hasPermission && (
          <BarcodeScannerView
            ref={scannerRef}
            onError={handleError}
            style={styles.camera}
            onBarcodeScanned={handleBarcodeScanned}
          />
        )}

        {/* Permission denied message */}
        {!hasPermission && (
          <View style={styles.permissionContainer}>
            <AppText
              medium
              color={colors.white}
              style={styles.permissionText}
              label="Requesting camera permission..."
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default memo(BarcodeScannerModal);
