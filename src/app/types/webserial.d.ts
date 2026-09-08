interface Navigator {
    serial: Serial;
  }


  /** Fired on `navigator.serial` when a port is plugged in or unplugged. */
  interface SerialConnectionEvent extends Event {
    readonly port: SerialPort;
  }

  interface SerialEventMap {
    connect: SerialConnectionEvent;
    disconnect: SerialConnectionEvent;
  }


  interface Serial extends EventTarget {
    onconnect: ((this: Serial, ev: SerialConnectionEvent) => unknown) | null;
    ondisconnect: ((this: Serial, ev: SerialConnectionEvent) => unknown) | null;

    getPorts(): Promise<SerialPort[]>;
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;

    addEventListener<K extends keyof SerialEventMap>(
      type: K,
      listener: (this: Serial, ev: SerialEventMap[K]) => unknown,
      options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;

    removeEventListener<K extends keyof SerialEventMap>(
      type: K,
      listener: (this: Serial, ev: SerialEventMap[K]) => unknown,
      options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;
  }


  interface SerialPortRequestOptions {
    filters?: SerialPortFilter[];
  }


  interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
  }


  interface SerialPort {
    open(options: {
      baudRate: number;
    }): Promise<void>;

    close(): Promise<void>;

    readonly readable: ReadableStream<Uint8Array> | null;
    readonly writable: WritableStream<Uint8Array> | null;
    /** Only exposed by newer Chromium builds. */
    readonly connected?: boolean;
    getInfo(): SerialPortInfo;
  }

  interface SerialPortInfo {
    usbVendorId?: number;
    usbProductId?: number;
  }
