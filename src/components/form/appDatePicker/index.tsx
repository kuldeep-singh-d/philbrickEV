import React, { memo, useState } from 'react';
import { View, Pressable } from 'react-native';

import moment from 'moment';
import useStyles from './styles';
import { Svgs } from '@assets/svgs';
import { AppText } from '@components';
import DatePicker from 'react-native-date-picker';
import { useTheme } from '@react-navigation/native';

interface AppDatePickerProps {
  value?: Date;
  title?: string;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  isDisabled?: boolean;
  placeholder?: string;
  handleClearInput?(): void;
  setError?: (val: string) => void;
  mode?: 'date' | 'time' | 'datetime';
  onChangeDate?: (date: Date) => void;
}

const AppDatePicker = ({
  value,
  title = '',
  error = '',
  minimumDate,
  maximumDate,
  isDisabled,
  mode = 'date',
  placeholder = 'DD/MM/YYYY',

  setError,
  onChangeDate,
  handleClearInput,
}: AppDatePickerProps) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const getDisplayValue = () => {
    if (!value) return placeholder;
    if (mode === 'time') {
      return moment(value).format('hh:mm A'); // 12-hour format with AM/PM
    }
    return moment(value).format('DD-MM-YYYY');
  };

  return (
    <View style={styles.wrapper}>
      {title && <AppText medium label={title} style={styles.title} />}

      <Pressable style={styles.inputWrapper} onPress={() => setOpen(true)}>
        <AppText
          medium
          style={styles.displayValue}
          label={getDisplayValue()}
          color={value ? colors.text : colors.gray}
        />

        {value ? (
          <Pressable onPress={handleClearInput}>
            <Svgs.Cross height={18} width={18} />
          </Pressable>
        ) : (
          <Svgs.Date />
        )}
      </Pressable>

      <DatePicker
        modal
        mode={mode}
        open={open && !isDisabled}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        date={value || new Date()}
        onConfirm={date => {
          setOpen(false);
          setError && setError('');
          onChangeDate && onChangeDate(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />

      {error !== '' && error !== null && (
        <AppText label={error} color={'red'} style={styles.errorText} />
      )}
    </View>
  );
};

export default memo(AppDatePicker);
