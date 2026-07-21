import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Modal,
  Platform,
  Animated,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';

import useStyles from './styles';
import { Svgs } from '@assets/svgs';
import { AppText } from '@components';
import { useTheme } from '@react-navigation/native';
import { AppDropdownProps, DropdownItem } from './types';

const AppDropdown = ({
  title = '',
  error = '',
  itemList,
  selectedValues = [],
  selectedValue = null,
  placeholder = 'Select',
  multiSelection = false,
  canClear = false,
  isSearching = false,

  setError,
  onSelectItem,
  onSelectItems,
  onSearchChange,
}: AppDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const styles = useStyles(fadeAnim);
  const { colors } = useTheme();

  // ── Filtered items based on search ──
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return itemList;
    }
    const q = searchQuery.toLowerCase().trim();
    return itemList.filter(item => item.label.toLowerCase().includes(q));
  }, [itemList, searchQuery]);

  // ── Open / Close helpers ──
  const openModal = useCallback(() => {
    setIsOpen(true);
    setSearchQuery('');
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const closeModal = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      setSearchQuery('');
    });
  }, [fadeAnim]);

  // ── Single select handler ──
  const handleSingleSelect = useCallback(
    (item: DropdownItem) => {
      onSelectItem?.(item);
      setError?.('');
      closeModal();
    },
    [onSelectItem, setError, closeModal],
  );

  // ── Multi select toggle ──
  const handleMultiToggle = useCallback(
    (item: DropdownItem) => {
      const isSelected = selectedValues.some(v => v.value === item.value);
      let updated: DropdownItem[];
      if (isSelected) {
        updated = selectedValues.filter(v => v.value !== item.value);
      } else {
        updated = [...selectedValues, item];
      }
      onSelectItems?.(updated);
      setError?.('');
    },
    [selectedValues, onSelectItems, setError],
  );

  // ── Remove chip ──
  const handleRemoveChip = useCallback(
    (item: DropdownItem) => {
      const updated = selectedValues.filter(v => v.value !== item.value);
      onSelectItems?.(updated);
    },
    [selectedValues, onSelectItems],
  );

  // ── Clear single selection ──
  const handleClearSelection = useCallback(() => {
    onSelectItem?.(null);
  }, [onSelectItem]);

  // ── Check if item is selected (multi) ──
  const isItemSelected = useCallback(
    (item: DropdownItem) => {
      return selectedValues.some(v => v.value === item.value);
    },
    [selectedValues],
  );

  // ── Render individual list item ──
  const renderItem = useCallback(
    ({ item }: { item: DropdownItem }) => {
      const selected = multiSelection
        ? isItemSelected(item)
        : selectedValue?.value === item.value;

      return (
        <Pressable
          style={styles.itemRow}
          onPress={() => {
            console.log('\n ~ AppDropdown ~ item:', item);
            return multiSelection
              ? handleMultiToggle(item)
              : handleSingleSelect(item);
          }}
        >
          <AppText
            numberOfLines={1}
            label={item.label}
            style={[styles.itemLabel, selected && styles.itemSelected]}
          />
          {selected && (
            <View style={styles.checkIcon}>
              <Svgs.Check height={18} width={18} />
            </View>
          )}
        </Pressable>
      );
    },
    [
      styles,
      selectedValue,
      multiSelection,
      isItemSelected,
      handleMultiToggle,
      handleSingleSelect,
    ],
  );

  // ── Key extractor ──
  const keyExtractor = useCallback((item: DropdownItem) => item.value, []);

  // ── Trigger content ──
  const renderTriggerContent = () => {
    if (multiSelection) {
      if (selectedValues.length === 0) {
        return (
          <AppText
            medium
            label={placeholder}
            color={colors.gray}
            style={styles.placeholderText}
          />
        );
      }
      return (
        <View style={styles.chipsContentContainer}>
          {selectedValues.map(item => (
            <View key={item.value} style={styles.chip}>
              <AppText
                numberOfLines={1}
                label={item.label}
                style={styles.chipLabel}
              />

              <Pressable
                hitSlop={6}
                style={styles.chipClose}
                onPress={() => handleRemoveChip(item)}
              >
                <AppText style={styles.chipCloseText} label="✕" />
              </Pressable>
            </View>
          ))}
        </View>
      );
    }

    // Single select
    return (
      <AppText
        medium
        style={styles.selectedText}
        color={selectedValue ? colors.text : colors.gray}
        label={selectedValue ? selectedValue.label : placeholder}
      />
    );
  };

  return (
    <View style={styles.wrapper}>
      {title !== '' && <AppText medium label={title} style={styles.title} />}

      <Pressable style={styles.inputWrapper} onPress={openModal}>
        {renderTriggerContent()}
        {!multiSelection && selectedValue && canClear ? (
          <Pressable
            hitSlop={8}
            onPress={e => {
              e.stopPropagation();
              handleClearSelection();
            }}
          >
            <Svgs.Cross height={18} width={18} />
          </Pressable>
        ) : (
          <Svgs.DownArrow height={20} width={20} />
        )}
      </Pressable>

      {error !== '' && error !== null && (
        <AppText label={error} color={'red'} style={styles.errorText} />
      )}

      {/* ── Dropdown Modal ── */}
      <Modal
        transparent
        visible={isOpen}
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View style={styles.modalOverlay}>
            <Pressable style={styles.overlayPress} onPress={closeModal} />

            <Animated.View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <AppText
                  style={styles.modalTitle}
                  label={title || 'Select Option'}
                />
                <Pressable
                  hitSlop={8}
                  onPress={closeModal}
                  style={styles.modalCloseBtn}
                >
                  <Svgs.Cross height={20} width={20} />
                </Pressable>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <TextInput
                  value={searchQuery}
                  autoCorrect={false}
                  placeholder="Search..."
                  style={styles.searchInput}
                  onChangeText={text => {
                    setSearchQuery(text);
                    onSearchChange?.(text);
                  }}
                  cursorColor={colors.text as string}
                  selectionColor={colors.primary as string}
                  placeholderTextColor={colors.gray as string}
                />
              </View>

              {/* Item List */}
              <FlatList
                windowSize={10}
                data={filteredItems}
                renderItem={renderItem}
                initialNumToRender={15}
                maxToRenderPerBatch={20}
                keyExtractor={keyExtractor}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    {isSearching ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primary as string}
                      />
                    ) : (
                      <AppText
                        label={'No items found'}
                        style={styles.emptyText}
                      />
                    )}
                  </View>
                }
              />
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default memo(AppDropdown);
