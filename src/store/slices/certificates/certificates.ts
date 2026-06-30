import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';
import type { MqttConfig } from '../../../mqtt/mqttConfig';

export type CertificateItem = {
  id?: number | string;
  name?: string;
  title?: string;
  certificate_name?: string;
  is_default?: boolean | number | string;
  vendor_contact?: string;
  port?: number | string;
  files?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type CertificateFileMetadata = {
  id: string;
  name: string;
  downloadUrl: string;
  type: string;
  raw: Record<string, unknown>;
};

type ActiveDetail = {
  cardId: string;
  fileId: string;
};

type CertificatesState = {
  data: any | undefined;
  items: CertificateItem[];
  loading: boolean;
  error: any | undefined;
  activeDetail: ActiveDetail | null;
  detailData: any | undefined;
  detailLoading: boolean;
  detailError: any | undefined;
  defaultCertificate: CertificateItem | undefined;
  certificateFiles: CertificateFileMetadata[];
  mqttConfig: MqttConfig | undefined;
  mqttConfigError: string;
  lastFetchedAt: number | undefined;
};

const initialState: CertificatesState = {
  data: undefined,
  items: [],
  loading: false,
  error: undefined,
  activeDetail: null,
  detailData: undefined,
  detailLoading: false,
  detailError: undefined,
  defaultCertificate: undefined,
  certificateFiles: [],
  mqttConfig: undefined,
  mqttConfigError: '',
  lastFetchedAt: undefined,
};

export const CERTIFICATES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const isCertificatesCacheStale = (
  lastFetchedAt?: number,
  now = Date.now(),
) => !lastFetchedAt || now - lastFetchedAt > CERTIFICATES_CACHE_TTL_MS;

const getString = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
};

const isTruthy = (value: unknown) =>
  value === true || value === 1 || value === '1' || value === 'true';

export const selectDefaultCertificate = (certificates: CertificateItem[]) =>
  certificates.find(certificate => isTruthy(certificate.is_default));

export const selectCertificateFiles = (
  certificate?: CertificateItem,
): CertificateFileMetadata[] => {
  if (!certificate) {
    return [];
  }

  const files = certificate.files ?? certificate.certificate_files;

  if (!Array.isArray(files)) {
    return [];
  }

  return files
    .filter((file): file is Record<string, unknown> => Boolean(file))
    .map((file, index) => ({
      id: getString(file, ['id', 'file_id', 'fileId']) || String(index),
      name:
        getString(file, [
          'name',
          'file_name',
          'filename',
          'original_name',
          'path',
        ]) || `certificate-file-${index + 1}`,
      downloadUrl: getString(file, [
        'download_url',
        'downloadUrl',
        'url',
        'signed_url',
      ]),
      type: getString(file, ['type', 'kind', 'extension', 'mime_type']),
      raw: file,
    }));
};

const getBundledCertificateName = (files: CertificateFileMetadata[]) =>
  files.find(file => file.name.toLowerCase().endsWith('.p12'))?.name || '';

const LEGACY_BUNDLED_CERTIFICATE = {
  certificateName: 'client_identity.p12',
  certificatePassword: '123456',
};

export const buildMqttConfigFromCertificate = (
  certificate?: CertificateItem,
  files: CertificateFileMetadata[] = [],
): { config?: MqttConfig; error: string } => {
  if (!certificate) {
    return { error: 'No default MQTT certificate was found.' };
  }

  const host = getString(certificate, ['vendor_contact']);
  const port = Number(getString(certificate, ['port']));

  if (!host) {
    return { error: 'Default MQTT certificate is missing vendor_contact.' };
  }

  if (!Number.isInteger(port) || port <= 0) {
    return { error: 'Default MQTT certificate is missing a valid port.' };
  }

  const certificateName = getBundledCertificateName(files);

  if (!certificateName) {
    return {
      config: {
        enabled: true,
        host,
        port,
        clientId: 'philbrickEV-mobile',
        cleanSession: true,
        keepAliveSeconds: 60,
        certificate: LEGACY_BUNDLED_CERTIFICATE,
      },
      error: '',
    };
  }

  return {
    config: {
      enabled: true,
      host,
      port,
      clientId: 'philbrickEV-mobile',
      cleanSession: true,
      keepAliveSeconds: 60,
      certificate: {
        certificateName,
        certificatePassword: getString(certificate, [
          'certificate_password',
          'certificatePassword',
          'password',
        ]),
      },
    },
    error: '',
  };
};

export const selectCertificates = (response: any): CertificateItem[] => {
  const data = response?.data;
  const candidates = [
    data?.certificates,
    data?.data,
    data?.items,
    response?.certificates,
    response?.items,
    data,
    response,
  ];

  return candidates.find(Array.isArray) || [];
};

const slice = createSlice({
  name: 'certificates',
  initialState,
  reducers: {
    requested: state => {
      state.loading = true;
      state.error = undefined;
    },
    success: (state, action) => {
      state.data = action.payload;
      state.items = selectCertificates(action.payload);
      state.defaultCertificate = selectDefaultCertificate(state.items);
      state.certificateFiles = selectCertificateFiles(state.defaultCertificate);
      const mqttResult = buildMqttConfigFromCertificate(
        state.defaultCertificate,
        state.certificateFiles,
      );
      state.mqttConfig = mqttResult.config;
      state.mqttConfigError = mqttResult.error;
      state.lastFetchedAt = Date.now();
      state.loading = false;
      state.error = undefined;
    },
    failed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    detailRequested: (state, action: PayloadAction<ActiveDetail>) => {
      state.activeDetail = action.payload;
      state.detailData = undefined;
      state.detailLoading = true;
      state.detailError = undefined;
    },
    detailSuccess: (state, action) => {
      state.detailData = action.payload;
      state.detailLoading = false;
      state.detailError = undefined;
    },
    detailFailed: (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload;
    },
    reset: state => {
      state.data = undefined;
      state.items = [];
      state.loading = false;
      state.error = undefined;
      state.activeDetail = null;
      state.detailData = undefined;
      state.detailLoading = false;
      state.detailError = undefined;
      state.defaultCertificate = undefined;
      state.certificateFiles = [];
      state.mqttConfig = undefined;
      state.mqttConfigError = '';
      state.lastFetchedAt = undefined;
    },
  },
});

export const {
  requested,
  success,
  failed,
  detailRequested,
  detailSuccess,
  detailFailed,
  reset,
} = slice.actions;
export default slice.reducer;

export const fetchCertificates = () =>
  apiCallBegan({
    isRowData: true,
    method: methods.GET,
    url: apiRoutes.certificates,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
    dedupe: true,
  });

export const fetchCertificateDetail =
  ({ cardId, fileId }: ActiveDetail) =>
  (dispatch: React.Dispatch<any>) => {
    dispatch(detailRequested({ cardId, fileId }));
    dispatch(
      apiCallBegan({
        isRowData: true,
        method: methods.GET,
        url: apiRoutes.certificateDetail(fileId),
        onFailed: detailFailed.type,
        onSuccess: detailSuccess.type,
      }),
    );
  };

export const clearCertificates = () => reset();
