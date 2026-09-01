'use client'

let port: SerialPort | null = null
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
let reading = false

export const browserSerial = {
  supported: () => typeof navigator !== 'undefined' && 'serial' in navigator,
  async connect(onData: (text: string) => void, baudRate = 115200) {
    if (!this.supported()) throw new Error('Web Serial is not supported by this browser. Use a recent Chromium-based browser over HTTPS or localhost.')
    if (!port) port = await navigator.serial.requestPort()
    if (!port.readable) await port.open({ baudRate })
    if (reading || !port.readable) return
    reading = true
    const decoder = new TextDecoder()
    reader = port.readable.getReader()
    void (async () => {
      try {
        while (reading && reader) {
          const { value, done } = await reader.read()
          if (done) break
          if (value) onData(decoder.decode(value, { stream: true }))
        }
      } finally { reading = false }
    })()
  },
  async write(text: string) {
    if (!port?.writable) throw new Error('Connect a serial device first.')
    const writer = port.writable.getWriter()
    try { await writer.write(new TextEncoder().encode(text)) } finally { writer.releaseLock() }
  },
  async disconnect() {
    reading = false
    await reader?.cancel().catch(() => undefined)
    reader?.releaseLock()
    reader = null
    if (port) await port.close().catch(() => undefined)
    port = null
  },
}

declare global {
  interface Navigator { serial: { requestPort(): Promise<SerialPort>; getPorts(): Promise<SerialPort[]> } }
  interface SerialPort {
    readable: ReadableStream<Uint8Array> | null
    writable: WritableStream<Uint8Array> | null
    open(options: { baudRate: number }): Promise<void>
    close(): Promise<void>
  }
}
