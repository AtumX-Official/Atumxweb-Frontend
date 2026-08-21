interface Navigator {
    serial: Serial;
  }
  
  
  interface Serial {
    getPorts(): Promise<SerialPort[]>;
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
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
    getInfo(): SerialPortInfo;
  }

  interface SerialPortInfo {
    usbVendorId?: number;
    usbProductId?: number;
  }