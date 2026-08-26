class SerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

  private isReading = false;
  private openingPromise: Promise<void> | null = null;
  private writePromise: Promise<void> = Promise.resolve();
  private readBuffer = "";

  private boardDisconnected = false;
  private boardConnected = false;

  constructor() {
    this.setupSerialEvents();
  }

  private setupSerialEvents() {
    if (typeof navigator === "undefined" || !("serial" in navigator)) {
      return;
    }

    const serial = navigator.serial as typeof navigator.serial & {
      addEventListener: (
        type: "connect" | "disconnect",
        listener: (event: Event & { port?: SerialPort }) => void,
      ) => void;
    };

    serial.addEventListener("disconnect", (event: Event & { port?: SerialPort }) => {
      console.log("[Board] USB disconnected");

      if (event.port === this.port) {
        this.boardDisconnected = true;
      }
    });

    serial.addEventListener("connect", () => {
      console.log("[Board] USB connected");

      this.boardConnected = true;
    });
  }

  private pendingWaiters = new Set<{
    resolve: (data: string) => void;
    reject: (error: Error) => void;
    matcher: (data: string) => boolean;
    timer: ReturnType<typeof setTimeout>;
  }>();

  private listeners = new Set<(data: string) => void>();

  // --------------------------------------------------
  // CONNECTION
  // --------------------------------------------------

  isConnected(): boolean {
    return !!this.port?.writable;
  }

  getCurrentPort(): SerialPort | null {
    return this.port;
  }

  async hasActiveConnection(): Promise<boolean> {
    if (
      !this.port ||
      typeof navigator === "undefined" ||
      !("serial" in navigator)
    ) {
      return false;
    }

    try {
      const ports = await navigator.serial.getPorts();

      return ports.includes(this.port) && !!this.port.writable;
    } catch {
      return false;
    }
  }

  // --------------------------------------------------
  // WEB SERIAL SUPPORT
  // --------------------------------------------------

  private checkWebSerialSupport() {
    if (
      typeof navigator === "undefined" ||
      !("serial" in navigator)
    ) {
      throw new Error(
        "Web Serial API is not available. Use Chrome or Edge on HTTPS/localhost."
      );
    }
  }

  // --------------------------------------------------
  // PORT SELECTION
  // --------------------------------------------------

  async requestPort(): Promise<SerialPort | null> {
    this.checkWebSerialSupport();

    try {
      const port = await navigator.serial.requestPort();

      return port;
    } catch (error: unknown) {
      const serialError = error as { name?: string };

      if (serialError?.name === "NotFoundError") {
        console.log("[Serial] Port selection cancelled");
        return null;
      }

      console.error("[Serial] requestPort failed:", error);
      throw error;
    }
  }

  async getAuthorizedPorts(): Promise<SerialPort[]> {
    this.checkWebSerialSupport();

    return await navigator.serial.getPorts();
  }

  async findSupportedBoard(): Promise<SerialPort | null> {
    const ports = await this.getAuthorizedPorts();

    const board = ports.find((port) => {
      const { usbVendorId } = port.getInfo();

      return usbVendorId === 0x303a || usbVendorId === 0x2e8a;
    });

    return board ?? null;
  }

  async detectBoardMode(): Promise<{
    port: SerialPort;
    board: string;
    mode: "Blockly Mode" | "Python Mode" | "Unknown";
  } | null> {
    const ports = await this.getAuthorizedPorts();

    for (const port of ports) {
      const info = port.getInfo();

      const vendorId = info.usbVendorId
        ?.toString(16)
        .padStart(4, "0");

      const productId = info.usbProductId
        ?.toString(16)
        .padStart(4, "0");

      const usbId = `${vendorId}:${productId}`;

      console.log("[Serial] Checking:", usbId);

      if (usbId === "303a:1001" || usbId === "2e8a:000a") {
        return {
          port,
          board: usbId,
          mode: "Blockly Mode",
        };
      }

      if (usbId === "303a:817a" || usbId === "2e8a:0005") {
        return {
          port,
          board: usbId,
          mode: "Python Mode",
        };
      }
    }

    return null;
  }

  private async waitForBoardReconnect(
    expectedMode: "Blockly Mode" | "Python Mode",
    timeout = 15000
  ): Promise<SerialPort> {
    const deadline = Date.now() + timeout;

    console.log(`[Board] Waiting for ${expectedMode}...`);

    while (Date.now() < deadline) {
      const ports = await this.getAuthorizedPorts();

      console.log(`[Board] Authorized ports: ${ports.length}`);

      for (const port of ports) {
        const info = port.getInfo();

        const vendorId = info.usbVendorId
          ?.toString(16)
          .padStart(4, "0");

        const productId = info.usbProductId
          ?.toString(16)
          .padStart(4, "0");

        const usbId = `${vendorId}:${productId}`;

        console.log(`[Board] Checking USB: ${usbId}`);

        if (
          expectedMode === "Blockly Mode" &&
          (usbId === "303a:1001" || usbId === "2e8a:000a")
        ) {
          console.log("[Board] Blockly board detected");
          return port;
        }

        if (
          expectedMode === "Python Mode" &&
          (usbId === "303a:817a" || usbId === "2e8a:0005")
        ) {
          console.log("[Board] Python board detected");
          return port;
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );
    }

    throw new Error(
      `Board did not reconnect in ${expectedMode}`
    );
  }

  async enterPythonMode(): Promise<void> {
    const board = await this.detectBoardMode();

    if (!board?.port) {
      throw new Error("Board not detected");
    }

    if (board.mode === "Python Mode") {
      console.log("[Board] Already in Python Mode");

      await this.connectPort(board.port);

      return;
    }

    console.log(
      "[Board] Switching Blockly → Python"
    );

    await this.connectPort(board.port);

    console.log(
      "[Board] Sending Blockly → Python command..."
    );

    await this.send(
      `${JSON.stringify({ msg: "switch" })}\n`
    );

    const newPort =
      await this.waitForBoardReconnect("Python Mode");

    this.port = null;

    await this.connectPort(newPort);

    console.log(
      "[Board] Successfully switched Blockly → Python"
    );
  }

  async exitPythonMode(): Promise<void> {
    const board = await this.detectBoardMode();

    if (!board?.port) {
      throw new Error("Board not detected");
    }

    if (board.mode === "Blockly Mode") {
      console.log("[Board] Already in Blockly Mode");
      return;
    }

    console.log("[Board] Switching Python → Blockly");

    await this.connectPort(board.port);

    console.log(
      "[Board] Sending Python → Blockly command..."
    );

    await this.send(
      "import Subo\r\nSubo.bswitch()\r\n"
    );

    console.log(
      "[Board] Command sent. Waiting for board reboot..."
    );

    const updatedPort =
      await this.waitForBoardReconnect(
        "Blockly Mode",
        15000
      );

    console.log(
      "[Board] Blockly board reconnected"
    );

    this.port = null;

    await this.connectPort(updatedPort);

    console.log(
      "[Board] Python → Blockly complete"
    );
  }

  /**
   * Ensures a detected board is ready for the Python editor. A missing board is
   * valid for UI navigation, so it is reported without throwing.
   */
  async ensurePythonMode(): Promise<boolean> {
    const board = await this.detectBoardMode();

    if (!board) {
      console.warn("[Board] Board not detected - allowing UI navigation");
      return false;
    }

    if (board.mode === "Python Mode") {
      console.log("[Board] Already in Python Mode");
      return true;
    }

    console.log("[Board] Switching Blockly to Python");
    await this.enterPythonMode();
    return true;
  }

  /**
   * Ensures a detected board is ready for the Blockly editor. A missing board
   * is valid for UI navigation, so it is reported without throwing.
   */
  async ensureBlocklyMode(): Promise<boolean> {
    const board = await this.detectBoardMode();

    if (!board) {
      console.warn("[Board] Board not detected - allowing UI navigation");
      return false;
    }

    if (board.mode === "Blockly Mode") {
      console.log("[Board] Already in Blockly Mode");
      return true;
    }

    console.log("[Board] Switching Python to Blockly");
    await this.exitPythonMode();
    return true;
  }

  // --------------------------------------------------
  // BOARD INFORMATION
  // --------------------------------------------------

  getPortInfo(port: SerialPort) {
    return port.getInfo();
  }

  getPortName(port: SerialPort, index: number): string {
    const info = port.getInfo();

    const vendor = info.usbVendorId
      ?.toString(16)
      .padStart(4, "0");

    const product = info.usbProductId
      ?.toString(16)
      .padStart(4, "0");

    if (vendor && product) {
      return `${vendor}:${product}`;
    }

    return `Serial Port ${index + 1}`;
  }

  async listPorts(): Promise<string[]> {
    const ports = await this.getAuthorizedPorts();

    return ports.map((port, index) =>
      this.getPortName(port, index)
    );
  }

  // --------------------------------------------------
  // DATA LISTENERS
  // --------------------------------------------------

  addDataListener(callback: (data: string) => void) {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyData(data: string) {
    for (const waiter of this.pendingWaiters) {
      if (waiter.matcher(data)) {
        clearTimeout(waiter.timer);
        this.pendingWaiters.delete(waiter);
        waiter.resolve(data);
      }
    }

    for (const callback of this.listeners) {
      try {
        callback(data);
      } catch (error) {
        console.error(
          "[Serial] Listener error:",
          error
        );
      }
    }
  }

  // --------------------------------------------------
  // CONNECT
  // --------------------------------------------------

  async connectPort(port: SerialPort): Promise<void> {
    this.checkWebSerialSupport();

    // Already connected to this exact port
    if (
      this.port === port &&
      port.readable &&
      port.writable
    ) {
      console.log("[Serial] Already connected");
      return;
    }

    // Wait for another connection attempt
    if (this.openingPromise) {
      await this.openingPromise;

      if (
        this.port === port &&
        port.readable &&
        port.writable
      ) {
        return;
      }
    }

    const opening = (async () => {
      // If another port is currently connected,
      // disconnect it first.
      if (this.port && this.port !== port) {
        await this.disconnect();
      }

      this.port = port;

      try {
        if (!port.readable && !port.writable) {
          console.log("[Serial] Opening port...");

          await port.open({
            baudRate: 115200,
          });
        }

        console.log("[Serial] Connected");

        // Start reader only after the port is open.
        void this.startReading();

      } catch (error) {
        if (this.port === port) {
          this.port = null;
        }

        console.error(
          "[Serial] Failed to open port:",
          error
        );

        throw error;
      }
    })();

    this.openingPromise = opening;

    try {
      await opening;
    } finally {
      if (this.openingPromise === opening) {
        this.openingPromise = null;
      }
    }
  }

  async connect(): Promise<boolean> {
    const port = await this.requestPort();

    if (!port) {
      return false;
    }

    await this.connectPort(port);

    return true;
  }

  // --------------------------------------------------
  // SERIAL READING
  // --------------------------------------------------

  async startReading(
    callback?: (data: string) => void
  ) {
    if (!this.port?.readable) {
      console.warn(
        "[Serial] Port is not readable"
      );
      return;
    }

    if (this.isReading) {
      console.log(
        "[Serial] Reader already running"
      );
      return;
    }

    if (this.port.readable.locked) {
      console.warn(
        "[Serial] Readable stream already locked"
      );
      return;
    }

    if (callback) {
      this.listeners.add(callback);
    }

    this.isReading = true;

    const reader = this.port.readable.getReader();

    this.reader = reader;

    console.log("[Serial] Reading started");

    try {
      while (this.isReading) {
        const { value, done } =
          await reader.read();

        if (done) {
          break;
        }

        if (!value) {
          continue;
        }

        const data = new TextDecoder().decode(value);

        this.readBuffer += data;

        const lines = this.readBuffer.split(/\r?\n/);

        this.readBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          console.log(
            "[Serial] Data:",
            line
          );

          this.notifyData(line);
        }
      }
    } catch (error) {
      if (this.isReading) {
        console.error(
          "[Serial] Read error:",
          error
        );
      }
    } finally {
      this.isReading = false;

      if (this.reader === reader) {
        this.reader = null;
      }

      if (callback) {
        this.listeners.delete(callback);
      }

      try {
        reader.releaseLock();
      } catch {
        // Already released
      }

      console.log(
        "[Serial] Reading stopped"
      );
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
      console.error(
        "[Serial] Reader cancel error:",
        error
      );
    }

    try {
      reader.releaseLock();
    } catch {
      // Already released
    }
  }

  // --------------------------------------------------
  // SEND
  // --------------------------------------------------

  async send(data: string): Promise<void> {
    this.writePromise = this.writePromise.then(async () => {
      const port = this.port;

      if (!port) {
        console.log("[Serial] No board connected. Write skipped.");
        return;
      }

      if (!port.writable) {
        console.log("[Serial] Port is not writable. Write skipped.");
        return;
      }

      const writer = port.writable.getWriter();

      try {
        const encoded = new TextEncoder().encode(data);

        await writer.write(encoded);

        console.log(
          "[Serial] Sent:",
          JSON.stringify(data)
        );
      } finally {
        writer.releaseLock();
      }
    });

    return this.writePromise;
  }

  async sendAndWait(
    data: string,
    matcher: (response: string) => boolean,
    timeout = 3000
  ): Promise<string> {
    const port = this.port;

    if (!port) {
      throw new Error("Port not connected");
    }

    if (!port.writable) {
      throw new Error("Serial port is not writable");
    }

    const responsePromise = new Promise<string>((resolve, reject) => {
      const waiter = {
        resolve,
        reject,
        matcher,
        timer: setTimeout(() => {
          this.pendingWaiters.delete(waiter);
          reject(new Error(`Serial response timeout after ${timeout}ms`));
        }, timeout),
      };

      this.pendingWaiters.add(waiter);
    });

    await this.send(data);

    return await responsePromise;
  }

  // --------------------------------------------------
  // DISCONNECT
  // --------------------------------------------------

  async disconnect() {
    await this.stopReading();

    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch {
        // Already released
      }

      this.writer = null;
    }

    const port = this.port;

    if (!port) {
      return;
    }

    this.port = null;

    try {
      if (port.readable || port.writable) {
        await port.close();
      }

      console.log(
        "[Serial] Disconnected"
      );
    } catch (error) {
      console.error(
        "[Serial] Error closing port:",
        error
      );
    }
  }
}

const serialService = new SerialService();

export default serialService;
