import { ReadlineParser } from "@serialport/parser-readline";

// services/SerialService.ts
class SerialService {
    private port: SerialPort | null = null;
    private reader: ReadableStreamDefaultReader | null = null;
  
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
  
    async listPorts() {
      this.checkWebSerialSupport();
  
      const ports = await navigator.serial.getPorts();
  
      return ports;
    }
  
    async connect() {
        if (typeof window === "undefined") {
            throw new Error("Serial connection is only available in the browser");
        }
    
        if (!("serial" in navigator)) {
            throw new Error(
                "USB connection is not available. Please use Chrome or Edge over HTTPS or localhost."
            );
        }
    
        this.port = await navigator.serial.requestPort();
    
        await this.port.open({
            baudRate: 115200,
        });
    
        console.log("Connected");
    }
  
    async disconnect() {
      if (this.reader) {
        try {
          await this.reader.cancel();
        } catch (err) {
          console.error("Error cancelling reader:", err);
        }
  
        this.reader = null;
      }
  
      if (this.port) {
        try {
          await this.port.close();
        } catch (err) {
          console.error("Error closing port:", err);
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
  
    async startReading(
      callback: (data: string) => void
    ) {
      if (!this.port?.readable) {
        return;
      }
  
      // Prevent multiple readers
      if (this.reader) {
        console.warn(
          "startReading called while a reader is already active"
        );
        return;
      }
  
      this.reader = this.port.readable.getReader();
  
      try {
        while (true) {
          const { value, done } =
            await this.reader.read();
  
          if (done) {
            break;
          }
  
          if (value) {
            callback(
              new TextDecoder().decode(value)
            );
          }
        }
      } catch (err) {
        console.error("Read error:", err);
      } finally {
        if (this.reader) {
          this.reader.releaseLock();
          this.reader = null;
        }
      }
    }
  
    async stopReading() {
      if (this.reader) {
        try {
          await this.reader.cancel();
        } catch (err) {
          console.error(
            "Error cancelling reader:",
            err
          );
        } finally {
          this.reader.releaseLock();
          this.reader = null;
        }
      }
    }
  }
  
  export default new SerialService();