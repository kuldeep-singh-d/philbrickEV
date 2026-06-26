import { useCallback, useEffect, useMemo } from 'react';

import { useDispatch, useSelector } from '@hooks';
import { getApiErrorMessage } from '@utils/apiError';
import type { CertificateItem } from '@store/slices/certificates/certificates';
import {
  fetchCertificateDetail,
  fetchCertificates,
} from '@store/slices/certificates/certificates';

import useStyles from './styles';

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

const getFiles = (certificate: CertificateItem) => {
  const source = certificate as Record<string, unknown>;
  const files = source.files ?? source.certificate_files;

  return Array.isArray(files) ? (files as Array<Record<string, unknown>>) : [];
};

const getFileId = (certificate: CertificateItem) => {
  const source = certificate as Record<string, unknown>;
  const files = getFiles(certificate);
  const primaryFile = files[0] || {};

  return (
    getString(primaryFile, ['id', 'file_id', 'fileId']) ||
    getString(source, [
      'file_id',
      'fileId',
      'certificate_file_id',
      'certificateFileId',
      'id',
    ])
  );
};

const getCertificateId = (certificate: CertificateItem, index: number) =>
  getString(certificate as Record<string, unknown>, ['id', 'uuid']) ||
  `certificate-${index}`;

const stringifyValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const getDetailRows = (detailData: any) => {
  const data = detailData?.data ?? detailData;
  const source =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : { response: data };

  return Object.entries(source).slice(0, 8);
};

export type ApiTestCertificate = {
  id: string;
  title: string;
  subtitle: string;
  fileId: string;
  fileCount: number;
  raw: CertificateItem;
};

export const useApiTest = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const certificates = useSelector(state => state.certificates);

  useEffect(() => {
    dispatch(fetchCertificates());
  }, [dispatch]);

  const items = useMemo(
    () =>
      certificates.items.map((certificate, index) => {
        const source = certificate as Record<string, unknown>;
        const files = getFiles(certificate);
        const id = getCertificateId(certificate, index);
        const fileId = getFileId(certificate);

        return {
          id,
          fileId,
          raw: certificate,
          fileCount: files.length,
          title:
            getString(source, [
              'name',
              'title',
              'certificate_name',
              'certificateName',
            ]) || `Certificate ${index + 1}`,
          subtitle:
            getString(source, ['description', 'type', 'platform']) ||
            `Certificate ID: ${id}`,
        };
      }),
    [certificates.items],
  );

  const handleRefresh = useCallback(() => {
    dispatch(fetchCertificates());
  }, [dispatch]);

  const handleSelectCertificate = useCallback(
    (certificate: ApiTestCertificate) => {
      if (!certificate.fileId || certificates.detailLoading) {
        return;
      }

      dispatch(
        fetchCertificateDetail({
          cardId: certificate.id,
          fileId: certificate.fileId,
        }),
      );
    },
    [certificates.detailLoading, dispatch],
  );

  return {
    styles,
    certificates: items,
    detailRows: getDetailRows(certificates.detailData),
    states: {
      loading: Boolean(certificates.loading),
      error: certificates.error
        ? getApiErrorMessage(certificates.error, 'Unable to load certificates.')
        : '',
      activeCardId: certificates.activeDetail?.cardId || '',
      detailLoading: Boolean(certificates.detailLoading),
      detailError: certificates.detailError
        ? getApiErrorMessage(
            certificates.detailError,
            'Unable to load certificate detail.',
          )
        : '',
    },
    handlers: {
      handleRefresh,
      handleSelectCertificate,
    },
    helpers: {
      stringifyValue,
    },
  };
};

export default useApiTest;
