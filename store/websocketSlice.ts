import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { encode } from '@msgpack/msgpack'
import { AppDispatch, RootState } from '.'

export type ConnectionMode = 'Wired' | 'Wireless' | ''

/** Fallback target: the board's soft-AP address and WebSocket port. Used only
 *  when neither the caller nor the store supplied a host/port. */
export const DEFAULT_WS_HOST = '192.168.4.1'
export const DEFAULT_WS_PORT = 81

/** Optional per-call override for `connectWebSocket`. Anything omitted falls
 *  back to the target held in the store, then to the defaults above. */
export interface WebSocketTarget {
  host?: string
  port?: number
  /** Full url; when given it wins over host/port. */
  url?: string
}

const buildWsUrl = (host: string, port: number): string => `ws://${host}:${port}`

export interface WebSocketState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  isConnected: boolean
  mode: ConnectionMode
  lastMode: ConnectionMode
  version: string | null
  /** Current WebSocket target - changeable at runtime, nothing hardcoded. */
  host: string
  port: number
}

const initialState: WebSocketState = {
  status: 'disconnected',
  isConnected: false,
  mode: '',
  lastMode: '',
  version: null,
  host: DEFAULT_WS_HOST,
  port: DEFAULT_WS_PORT,
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
    /** Clear the active transport WITHOUT touching lastMode, so the disconnect
     *  popup can still report which transport just went away. */
    clearMode: (state) => {
      state.mode = ''
    },
    setConnectionMode: (state, action: PayloadAction<ConnectionMode>) => {
      state.mode = action.payload
      state.lastMode = action.payload
    },
    setVersion: (state, action: PayloadAction<string | null>) => {
      state.version = action.payload
    },
    /** Point the transport at a different host/port before connecting. */
    setWebSocketTarget: (state, action: PayloadAction<{ host?: string; port?: number }>) => {
      if (action.payload.host !== undefined) state.host = action.payload.host
      if (action.payload.port !== undefined) state.port = action.payload.port
    },
  },
})

export const {
  setMode,
  setStatus,
  setConnected,
  setDisconnected,
  setConnectionMode,
  setVersion,
  clearMode,
  setWebSocketTarget,
} = websocketSlice.actions

let ws: WebSocket | null = null
let wsUrl: string | null = null

/** Url of the socket that is currently open/connecting, if any. */
export const getWebSocketUrl = (): string | null => wsUrl

/**
 * Open the transport. Call with no arguments to use the target held in the
 * store (defaults to the board's soft-AP), or pass `{ host, port }` / `{ url }`
 * to point it elsewhere - e.g. `dispatch(connectWebSocket({ port }))`.
 */
export const connectWebSocket =
  (target: WebSocketTarget = {}) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket is already open or connecting')
    return
  }

  const stored = getState().websocketSlice
  const host = target.host ?? stored.host ?? DEFAULT_WS_HOST
  const port = target.port ?? stored.port ?? DEFAULT_WS_PORT
  const url = target.url ?? buildWsUrl(host, port)

  // Remember the resolved target so a later argument-less reconnect reuses it.
  if (!target.url && (host !== stored.host || port !== stored.port)) {
    dispatch(setWebSocketTarget({ host, port }))
  }

  // A failed/dropped socket must not leave the UI in "Wireless" mode, which
  // renders the connected icon even though nothing is connected.
  const dropWirelessMode = () => {
    if (getState().websocketSlice.mode === 'Wireless') dispatch(clearMode())
  }

  try {
    dispatch(setStatus('connecting'))
    wsUrl = url
    ws = new WebSocket(url)
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      console.log('WebSocket transport opened:', url)
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
      dropWirelessMode()
      ws = null
      wsUrl = null
    }

    ws.onclose = (e: CloseEvent) => {
      console.log('WebSocket closed:', e.code, e.reason)
      dispatch(setStatus('disconnected'))
      dispatch(setDisconnected())
      dropWirelessMode()
      ws = null
      wsUrl = null
    }
  } catch (e) {
    console.error('WebSocket connection failed:', e)
    dispatch(setStatus('error'))
    dispatch(setDisconnected())
    ws = null
    wsUrl = null
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
export const disconnectWebSocket = () => (dispatch: AppDispatch) => {
  disconnectWebSocketNow()
  dispatch(setStatus('disconnected'))
  dispatch(setDisconnected())
}

export const disconnectWebSocketNow = () => {
  if (ws) {
    ws.onclose = null
    ws.close()
    ws = null
    wsUrl = null
  }
}
export default websocketSlice.reducer
// export type { WebSocketState } — already exported by its declaration above
