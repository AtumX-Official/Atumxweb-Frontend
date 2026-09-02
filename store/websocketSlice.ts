import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { encode } from '@msgpack/msgpack'
import { AppDispatch } from '.'

export type ConnectionMode = 'Wired' | 'Wireless' | ''

export interface WebSocketState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  isConnected: boolean
  mode: ConnectionMode
  lastMode: ConnectionMode
  version: string | null
}

const initialState: WebSocketState = {
  status: 'disconnected',
  isConnected: false,
  mode: '',
  lastMode: '',
  version: null,
}

export const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<ConnectionMode>) => {
      state.mode = action.payload
      state.lastMode = action.payload
    },
    setStatus: (state, action: PayloadAction<WebSocketState['status']>) => {
      state.status = action.payload
    },
    setConnected: (state, action: PayloadAction<ConnectionMode>) => {
      state.isConnected = true
      state.mode = action.payload
    },
    setDisconnected: (state) => {
      state.isConnected = false
    },
    setConnectionMode: (state, action: PayloadAction<ConnectionMode>) => {
      state.mode = action.payload
      state.lastMode = action.payload
    },
    setVersion: (state, action: PayloadAction<string | null>) => {
      state.version = action.payload
    },
  },
})

export const { setMode, setStatus, setConnected, setDisconnected, setConnectionMode, setVersion } =
  websocketSlice.actions

let ws: WebSocket | null = null

export const connectWebSocket = () => (dispatch: AppDispatch) => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket is already open or connecting')
    return
  }

  try {
    ws = new WebSocket('ws://192.168.4.1:81')
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      console.log('WebSocket transport opened')
      dispatch(setStatus('connected'))
      dispatch(setConnected('Wireless'))
      const data = encode({ msg: 'stop' })
      ws?.send(data)
    }

    ws.onmessage = (e: MessageEvent) => {
      const data = typeof e.data === 'string' ? e.data : ''
      console.log('WS message:', data)

      try {
        const parsed = JSON.parse(data)
        if (parsed.version) {
          dispatch(setVersion(parsed.version))
        }
      } catch {
        // not JSON
      }

      dispatch(setStatus('connected'))
    }

    ws.onerror = (e: Event) => {
      console.error('WebSocket error:', (e as ErrorEvent).message)
      dispatch(setDisconnected())
      dispatch(setStatus('error'))
      ws = null
    }

    ws.onclose = (e: CloseEvent) => {
      console.log('WebSocket closed:', e.code, e.reason)
      dispatch(setStatus('disconnected'))
      dispatch(setDisconnected())
      ws = null
    }
  } catch (e) {
    console.error('WebSocket connection failed:', e)
    dispatch(setStatus('error'))
    dispatch(setDisconnected())
    ws = null
  }
}

export const getWebSocket = (): WebSocket | null => ws

export const sendWebSocketData = (message: unknown): void => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket is not connected. Cannot send message:', message)
    return
  }

  try {
    const parsed = typeof message === 'string' ? JSON.parse(message) : message
    ws.send(encode(parsed))
    console.log('Data sent:', parsed)
  } catch (err) {
    console.error('Failed to send data:', err)
  }
}

export const addWSMessageListener = (listener: (event: MessageEvent) => void): void => {
  getWebSocket()?.addEventListener('message', listener)
}

export const removeWSMessageListener = (listener: (event: MessageEvent) => void): void => {
  getWebSocket()?.removeEventListener('message', listener)
}

export default websocketSlice.reducer
// export type { WebSocketState }
