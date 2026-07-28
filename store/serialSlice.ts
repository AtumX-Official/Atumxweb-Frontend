import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import { setConnected,setDisconnected } from './websocketSlice';
import { encode } from '@msgpack/msgpack';

interface SerialState {
  portPath: string | null;
  isOpen: boolean;
  lastData: string | null;
}

const initialState: SerialState = {
  portPath: null,
  isOpen: false,
  lastData: null,
};

let isPortOpenInternal = false;

const serialSlice = createSlice({
  name: 'serial',
  initialState,
  reducers: {
    setPort(state, action: PayloadAction<string | null>) {
      state.portPath = action.payload;
    },
    setOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
      isPortOpenInternal = action.payload;
    },
    setLastData(state, action: PayloadAction<string | null>) {
      state.lastData = action.payload;
    },
  },
});

// --- Thunks ---
export const connectSerial =
  (portPath: string) => async (dispatch: AppDispatch) => {
    if (!portPath) {
      console.warn('No COM port provided');
      return false;
    }

    try {
      dispatch(setPort(portPath));
      await window.api.serial.open(portPath, { baudRate: 9600 });
      dispatch(setOpen(true));
      console.log(`Serial port ${portPath} opened`);
      dispatch(setConnected('Wired'));
      return true;
    } catch (err) {
      console.error('Error opening serial port:', err);
      dispatch(setOpen(false));
      return false
    }
  };

  export const sendSerialMessage = async (message: unknown) => {
    if (!isPortOpenInternal) return; // Prevent writing when port is not open

    try {
      let parsed: unknown;
      let jsonString: string;
  
      if (typeof message === "string") {
        try {
          parsed = JSON.parse(message);
          jsonString = JSON.stringify(parsed);
        } catch {
          parsed = message;
          jsonString = message;
        }
      } else {
        parsed = message;
        jsonString = JSON.stringify(message);
      }
  
      // Always add newline for serial
      jsonString += '\n';
  
      // Send to serial
      await window.api.serial.write(jsonString);
  
      
      if (typeof parsed === "object") {
        console.log("Data sent to serial:\n", JSON.stringify(parsed, null, 2));
      }
  
    } catch (err) {
      console.error("Error writing to serial port:", err);
    }
  };
  
  

export const disconnectSerial = () => async (dispatch: AppDispatch) => {
  try {
    console.log('Attempting to close serial port...');
    await window.api.serial.close();
    dispatch(setOpen(false));
    dispatch(setPort(null));
    dispatch(setDisconnected());
    console.log('Serial port closed');
  } catch (err) {
    console.error('Error closing serial port:', err);
  }
};

export const { setPort, setOpen, setLastData } = serialSlice.actions;
export default serialSlice.reducer;
export type { SerialState };
