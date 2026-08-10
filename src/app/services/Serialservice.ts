class SerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isReading = false;

  private listeners = new Set<(data: string) => void>();

  addDataListener(callback: (data: string) => void) {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyData(data: string) {
    this.listeners.forEach((callback) => {
      callback(data);
    });
  }

  private checkWebSerialSupport() {
    if (
      typeof navigator === "undefined" ||
      !("serial" in navigator)
    ) {
      throw new Error(
        "Web Serial API is not available. Please use HTTPS or localhost in Chrome or Edge."
      );
    }
  }

  async connect() {
    this.checkWebSerialSupport();

    this.port = await navigator.serial.requestPort();

    await this.port.open({
      baudRate: 115200,
    });

    console.log("Connected");

    // Start ONE reader
    this.startReading();
  }

  async startReading() {
    if (!this.port?.readable) {
      console.warn("Serial port is not readable");
      return;
    }

    if (this.isReading) {
      console.warn("Serial reading is already running");
      return;
    }

    if (this.port.readable.locked) {
      console.warn("Serial port readable stream is already locked");
      return;
    }

    this.isReading = true;

    const reader = this.port.readable.getReader();
    this.reader = reader;

    try {
      while (this.isReading) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        if (value) {
          const data = new TextDecoder().decode(value);

          console.log("Serial Data:", data);

          this.notifyData(data);
        }
      }
    } catch (error) {
      if (this.isReading) {
        console.error("Read error:", error);
      }
    } finally {
      this.isReading = false;

      if (this.reader === reader) {
        this.reader = null;
      }

      try {
        reader.releaseLock();
      } catch {
        // Already released
      }
    }
  }

  async stopReading() {
    this.isReading = false;

    const reader = this.reader;

    if (!reader) {
      return;
    }

    this.reader = null;

    try {
      await reader.cancel();
    } catch (error) {
      console.error("Error cancelling reader:", error);
    }

    try {
      reader.releaseLock();
    } catch {
      // Already released
    }
  }

  async disconnect() {
    await this.stopReading();

    if (this.port) {
      try {
        await this.port.close();
      } catch (error) {
        console.error("Error closing port:", error);
      }

      this.port = null;
    }
  }

  async send(data: string) {
    if (!this.port?.writable) {
      throw new Error("Port not connected");
    }

    const writer = this.port.writable.getWriter();

    try {
      await writer.write(
        new TextEncoder().encode(data)
      );
    } finally {
      writer.releaseLock();
    }
  }
}

export default new SerialService();