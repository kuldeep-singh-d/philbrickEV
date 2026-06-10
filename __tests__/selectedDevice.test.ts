import reducer, {
  clearSelectedDevice,
  setSelectedDevice,
} from '../src/store/slices/devices/selectedDevice';
import rootReducer from '../src/store/reducer';

describe('selected device state', () => {
  const device = {
    id: 1,
    device_id: 'DEV-001',
    name: 'Garage Charger',
    location: 'Garage',
  };

  it('stores the selected device', () => {
    expect(reducer(undefined, setSelectedDevice(device)).data).toEqual(device);
  });

  it('clears the selected device', () => {
    const selectedState = reducer(undefined, setSelectedDevice(device));

    expect(reducer(selectedState, clearSelectedDevice()).data).toBeNull();
  });

  it('clears the selected device with the user session', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });
    const selectedState = rootReducer(initialState, setSelectedDevice(device));

    expect(
      rootReducer(selectedState, { type: 'login/reset' }).selectedDevice.data,
    ).toBeNull();
  });
});
