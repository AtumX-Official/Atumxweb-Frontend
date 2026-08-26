"use client";

export type BoardType = "_CAYO_" | "SNOWFLAKE" | "SUBU";

export interface FlashingResult {
  success: boolean;
  boardType?: BoardType;
  error?: string;
  port?: SerialPort;
}

class FlashingService {
  private checkWebSerialSupport() {
    if (typeof navigator === "undefined" || !("serial" in navigator)) {
      throw new Error(
        "Web Serial API is not supported. Use Chrome or Edge over HTTPS or localhost."
      );
    }
  }

  async getAuthorizedPorts(): Promise<SerialPort[]> {
    this.checkWebSerialSupport();
    return navigator.serial.getPorts();
  }

  async requestPort(): Promise<SerialPort | null> {
    this.checkWebSerialSupport();

    try {
      return await navigator.serial.requestPort();
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        return null;
      }

      throw error;
    }
  }

  private detectBoardType(port: SerialPort): BoardType | null {
    const { usbVendorId, usbProductId } = port.getInfo();

    console.log(
      "[Flashing] USB:",
      usbVendorId?.toString(16),
      usbProductId?.toString(16)
    );

    if (usbVendorId === 0x303a) {
      return "_CAYO_";
    }

    if (usbVendorId === 0x2e8a) {
      return "SNOWFLAKE";
    }

    return null;
  }

  async detectBoard(): Promise<FlashingResult> {
    try {
      const ports = await this.getAuthorizedPorts();

      for (const port of ports) {
        const boardType = this.detectBoardType(port);

        if (boardType) {
          return { success: true, boardType, port };
        }
      }

      return {
        success: false,
        error: "No supported board connected",
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async connectBoard(port: SerialPort): Promise<void> {
    if (!port.readable && !port.writable) {
      await port.open({ baudRate: 115200 });
    }

    console.log("[Flashing] Board connected");
  }

  async flashBoard(): Promise<FlashingResult> {
    try {
      let result = await this.detectBoard();

      if (!result.success) {
        const port = await this.requestPort();

        if (!port) {
          return { success: false, error: "No board selected" };
        }

        const boardType = this.detectBoardType(port);

        if (!boardType) {
          return {
            success: false,
            error: "Selected device is not a supported board",
          };
        }

        result = { success: true, boardType, port };
      }

      if (!result.port || !result.boardType) {
        return {
          success: false,
          error: "Board information is unavailable",
        };
      }

      await this.connectBoard(result.port);

      console.log("[Flashing] Detected board:", result.boardType);

      return {
        success: true,
        boardType: result.boardType,
        port: result.port,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

const flashingService = new FlashingService();

export default flashingService;
