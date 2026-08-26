import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import { setConnected,setDisconnected } from './websocketSlice';
import { createAsyncThunk } from '@reduxjs/toolkit';
import SerialService from '@/app/services/Serialservice';
interface SerialState {
  isOpen: boolean;
  deviceName: string | null;
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
export const connectSerial = () => async (dispatch: AppDispatch) => {
  try {
    await SerialService.connect();

    dispatch(setOpen(true));
    dispatch(setConnected());

    console.log("Serial port connected");
  } catch (err) {
    console.error("Failed to connect:", err);
  }
};

  export const sendSerialMessage = async (message: unknown) => {
    if (!isPortOpenInternal || !SerialService.isConnected()) {
      console.warn("[Serial] No board connected. Skipping serial write.");
      return;
    }

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
      await SerialService.send(jsonString);  
      
      if (typeof parsed === "object") {
        console.log("Data sent to serial:\n", JSON.stringify(parsed, null, 2));
      }
  
    } catch (err) {
      console.warn("[Serial] Serial write skipped:", err);
    }
  };
  
  

export const disconnectSerial = () => async (dispatch: AppDispatch) => {
  try {
    console.log('Attempting to close serial port...');
    await SerialService.disconnect();    
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
