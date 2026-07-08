import {
  buildMqttConfigFromCertificate,
  fetchCertificates,
  selectCertificates,
  selectCertificateFiles,
  selectDefaultCertificate,
} from '../src/store/slices/certificates/certificates';
import { methods } from '../src/store/apiRoutes';

describe('certificates API state', () => {
  it('builds the certificate list request', () => {
    const action = fetchCertificates();

    expect(action.payload).toMatchObject({
      isRowData: true,
      method: methods.GET,
      url: '/api/v1/certificates',
    });
  });

  it('selects certificates from common response envelopes', () => {
    const rows = [{ id: 1, name: 'Default certificate' }];

    expect(selectCertificates({ data: rows })).toEqual(rows);
    expect(selectCertificates({ data: { certificates: rows } })).toEqual(rows);
    expect(selectCertificates({ data: { data: rows } })).toEqual(rows);
    expect(selectCertificates({ certificates: rows })).toEqual(rows);
  });

  it('builds MQTT config from the default certificate host and port', () => {
    const certificates = [
      { id: 1, is_default: false, vendor_contact: 'ignored', port: 1883 },
      {
        id: 2,
        is_default: true,
        vendor_contact: 'broker.philbrickindia.com',
        port: '8883',
        files: [
          {
            id: 9,
            file_name: 'tenant-client.p12',
            download_url: 'https://example.test/certs/tenant-client.p12',
          },
        ],
      },
    ];
    const defaultCertificate = selectDefaultCertificate(certificates);
    const files = selectCertificateFiles(defaultCertificate);

    expect(files).toEqual([
      expect.objectContaining({
        id: '9',
        name: 'tenant-client.p12',
        downloadUrl: 'https://example.test/certs/tenant-client.p12',
      }),
    ]);
    expect(
      buildMqttConfigFromCertificate(defaultCertificate, files),
    ).toMatchObject({
      error: '',
      config: {
        enabled: true,
        host: 'broker.philbrickindia.com',
        port: 8883,
        certificate: {
          certificateName: 'tenant-client.p12',
          certificatePassword: '123456',
        },
      },
    });
  });

  it('uses API host and port with the bundled certificate while download support is pending', () => {
    const certificate = {
      id: 1,
      is_default: true,
      vendor_contact: 'broker.philbrickindia.com',
      port: 8883,
      files: [
        { file_name: 'ca.crt', download_url: 'https://example.test/ca.crt' },
        {
          file_name: 'client.crt',
          download_url: 'https://example.test/client.crt',
        },
        {
          file_name: 'client.key',
          download_url: 'https://example.test/client.key',
        },
      ],
    };
    const files = selectCertificateFiles(certificate);

    expect(buildMqttConfigFromCertificate(certificate, files)).toMatchObject({
      error: '',
      config: {
        enabled: true,
        host: 'broker.philbrickindia.com',
        port: 8883,
        certificate: {
          certificateName: 'client_identity.p12',
          certificatePassword: '123456',
        },
      },
    });
  });
});
