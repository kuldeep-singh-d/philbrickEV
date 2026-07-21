import {
  AppText,
  AppInput,
  AppButton,
  AppDropdown,
  AppDatePicker,
} from '@components';
import React from 'react';
import useSchedule from './useSchedule';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

export const Schedule = () => {
  const { styles, states, handlers, constants } = useSchedule();

  return (
    <AuthorisedScreen
      contentStyle={styles.content}
      bottomContent={
        <AppButton
          style={styles.addButton}
          onPress={handlers.handleSaveSchedule}
          title={states.isEditing ? 'Update' : 'Add'}
        />
      }
    >
      <AppText
        semibold
        label={states.isEditing ? 'Update Schedule' : 'Schedule'}
        style={styles.heading}
      />

      <AppInput
        returnKeyType="next"
        value={states.title}
        title="Scheduler Name"
        autoCapitalize="words"
        error={states.titleError}
        placeholder="Night charging"
        style={styles.inputWrapper}
        onChangeText={handlers.setTitle}
        setError={handlers.setTitleError}
      />

      <AppDropdown
        title="Device"
        error={states.deviceError}
        placeholder="Select device"
        itemList={constants.deviceOptions}
        setError={handlers.setDeviceError}
        selectedValue={states.selectedDeviceOption}
        onSelectItem={handlers.setSelectedDeviceOption}
      />

      <AppDatePicker
        mode="time"
        title="Start Time"
        placeholder="Start time"
        value={states.startTime}
        error={states.startTimeError}
        onChangeDate={handlers.setStartTime}
        setError={handlers.setStartTimeError}
      />

      <AppDatePicker
        mode="time"
        title="End Time"
        placeholder="End time"
        value={states.endTime}
        error={states.endTimeError}
        onChangeDate={handlers.setEndTime}
        setError={handlers.setEndTimeError}
      />

      <AppDropdown
        multiSelection
        title="Week Days"
        error={states.daysError}
        placeholder="Select days"
        itemList={constants.dayOptions}
        setError={handlers.setDaysError}
        selectedValues={states.selectedDays}
        onSelectItems={handlers.setSelectedDays}
      />
    </AuthorisedScreen>
  );
};

export default Schedule;
