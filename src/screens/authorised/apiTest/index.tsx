import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';

import { AppButton, AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

import useApiTest, { ApiTestCertificate } from './useApiTest';

type CertificateCardProps = {
  certificate: ApiTestCertificate;
  detailRows: Array<[string, unknown]>;
  isActive: boolean;
  styles: ReturnType<typeof useApiTest>['styles'];
  states: ReturnType<typeof useApiTest>['states'];
  helpers: ReturnType<typeof useApiTest>['helpers'];
  onPress: (certificate: ApiTestCertificate) => void;
};

const CertificateCard = ({
  certificate,
  detailRows,
  isActive,
  styles,
  states,
  helpers,
  onPress,
}: CertificateCardProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={`Load detail for ${certificate.title}`}
    disabled={!certificate.fileId || states.detailLoading}
    onPress={() => onPress(certificate)}
    style={({ pressed }) => [
      styles.card,
      isActive && styles.activeCard,
      pressed && styles.pressedCard,
      !certificate.fileId && styles.disabledCard,
    ]}
  >
    <View style={styles.cardHeader}>
      <View style={styles.cardCopy}>
        <AppText
          semibold
          numberOfLines={2}
          label={certificate.title}
          style={styles.cardTitle}
        />
        <AppText
          medium
          numberOfLines={2}
          label={certificate.subtitle}
          style={styles.cardSubtitle}
        />
      </View>

      <View style={styles.badge}>
        <AppText
          semibold
          label={certificate.fileId ? 'Detail' : 'No file'}
          style={styles.badgeText}
        />
      </View>
    </View>

    <View style={styles.metaRow}>
      <AppText
        medium
        label={`Files: ${certificate.fileCount || '-'}`}
        style={styles.metaText}
      />
      <AppText
        medium
        label={`File ID: ${certificate.fileId || '-'}`}
        style={styles.metaText}
      />
    </View>

    {isActive ? (
      <View style={styles.detailContainer}>
        {states.detailLoading ? (
          <ActivityIndicator size="small" color="#0BB2C3" />
        ) : states.detailError ? (
          <AppText
            medium
            numberOfLines={3}
            label={states.detailError}
            style={styles.errorText}
          />
        ) : detailRows.length > 0 ? (
          detailRows.map(([label, value]) => (
            <View key={label} style={styles.detailRow}>
              <AppText medium label={label} style={styles.detailLabel} />
              <AppText
                numberOfLines={6}
                label={helpers.stringifyValue(value)}
                style={styles.detailValue}
              />
            </View>
          ))
        ) : (
          <AppText
            medium
            label="Tap again to load detail."
            style={styles.detailHint}
          />
        )}
      </View>
    ) : null}
  </Pressable>
);

export const ApiTest = () => {
  const { styles, certificates, detailRows, states, handlers, helpers } =
    useApiTest();
  const showInitialLoader = states.loading && certificates.length === 0;
  const showEmptyState =
    !showInitialLoader && !states.error && certificates.length === 0;

  return (
    <AuthorisedScreen
      showBackButton
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          tintColor="#31C44C"
          refreshing={states.loading}
          colors={['#31C44C', '#0BB2C3']}
          onRefresh={handlers.handleRefresh}
        />
      }
    >
      <View style={styles.header}>
        <AppText semibold label="Certificates" style={styles.heading} />
        <AppText
          medium
          numberOfLines={2}
          label="Tap a certificate card to fetch and show its detail response."
          style={styles.description}
        />
      </View>

      {showInitialLoader ? (
        <ActivityIndicator size="large" color="#0BB2C3" style={styles.loader} />
      ) : null}

      {states.error ? (
        <View style={styles.emptyState}>
          <AppText
            semibold
            centered
            label="Unable to load certificates"
            style={styles.emptyTitle}
          />
          <AppText
            medium
            centered
            numberOfLines={3}
            label={states.error}
            style={styles.emptyDescription}
          />
          <AppButton
            title="Retry"
            onPress={handlers.handleRefresh}
            style={styles.actionButton}
          />
        </View>
      ) : null}

      {showEmptyState ? (
        <View style={styles.emptyState}>
          <AppText
            semibold
            centered
            label="No certificates found"
            style={styles.emptyTitle}
          />
          <AppText
            medium
            centered
            numberOfLines={3}
            label="Visible certificates will appear here."
            style={styles.emptyDescription}
          />
        </View>
      ) : null}

      {certificates.map(certificate => (
        <CertificateCard
          key={certificate.id}
          certificate={certificate}
          detailRows={detailRows}
          isActive={states.activeCardId === certificate.id}
          styles={styles}
          states={states}
          helpers={helpers}
          onPress={handlers.handleSelectCertificate}
        />
      ))}
    </AuthorisedScreen>
  );
};

export default ApiTest;
