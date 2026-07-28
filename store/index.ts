import { configureStore } from '@reduxjs/toolkit'
import serialReducer from './serialSlice'
import websocketReducer from './websocketSlice'
import comPortReducer from './comPortSlice'
import themeReducer from './themeSlice'
import kitsReducer from './kitslice'
import modeReducer from './modeSlice'
import projectReducer from './projectSlice'

export const store = configureStore({
  reducer: {
    serial: serialReducer,
    comPort: comPortReducer,
    websocketSlice: websocketReducer,
    theme: themeReducer,
    kits: kitsReducer,
    mode: modeReducer,
    project: projectReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
