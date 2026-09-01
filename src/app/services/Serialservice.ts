/**
 * Logical board runtime. Blockly and C++ are DISTINCT states even though both
 * share the native USB ids (303a:1001 / 2e8a:000a); "Unknown" means the web
 * app has no trustworthy transition history for the board.
 */
export type BoardRuntimeMode = "Blockly" | "Python" | "Cpp" | "Unknown";

/** Navigation-level target accepted by switchToMode(). */
export type BoardModeTarget = "Blockly Mode" | "Python Mode" | "Cpp Mode";

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

  // ------------------------------------------------------------------
  // APPLICATION-LEVEL BOARD RUNTIME MODE
  // ------------------------------------------------------------------
  // The logical runtime state (Blockly / Python / Cpp) is tracked SEPARATELY
  // from the USB VID/PID. The native USB ID (303a:1001 / 2e8a:000a) is shared
  // by BOTH the Blockly and the C++ runtime, so it can never tell which
  // logical state the board is in — only this app's transition history can.
  // The marker is persisted in sessionStorage so it survives SPA route changes
  // and a same-tab refresh; a brand-new tab starts "Unknown" and the state is
  // re-established by an enforced transition — never by blind assumption.
  private currentRuntimeMode: BoardRuntimeMode = "Unknown";

  private static readonly RUNTIME_MODE_KEY = "atumx.boardRuntimeMode";

  constructor() {
    this.currentRuntimeMode = this.loadRuntimeMode();
    this.setupSerialEvents();
  }

  private loadRuntimeMode(): "Blockly" | "Python" | "Cpp" | "Unknown" {
    if (typeof window === "undefined") return "Unknown";
    try {
      const raw = window.sessionStorage.getItem(SerialService.RUNTIME_MODE_KEY);
      if (raw === "Blockly" || raw === "Python" || raw === "Cpp") return raw;
    } catch {
      /* ignore storage errors */
    }
    return "Unknown";
  }

  private persistRuntimeMode(mode: "Blockly" | "Python" | "Cpp" | "Unknown") {
    this.currentRuntimeMode = mode;
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(SerialService.RUNTIME_MODE_KEY, mode);
    } catch {
      /* ignore storage errors */
    }
  }

  getCurrentRuntimeMode(): "Blockly" | "Python" | "Cpp" | "Unknown" {
    return this.currentRuntimeMode;
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

      // A physical detach invalidates the logical runtime history: when the
      // board is re-plugged it boots into its DEFAULT (Blockly) runtime, so a
      // stale "Cpp"/"Python" marker would make later transitions skip a
      // required command. Mode transitions reboot the board on purpose, so
      // they are exempt — they persist the fresh state when they complete.
      if (!this.transitionInFlight) {
        this.persistRuntimeMode("Unknown");
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

  /**
   * PHYSICAL USB probe only. mode "Blockly Mode" means "native runtime"
   * (Blockly OR C++ — both share 303a:1001 / 2e8a:000a) and must never be
   * read as proof of the logical Blockly state; use resolveLogicalRuntime()
   * / switchToMode() for logical decisions.
   */
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

  /**
   * Logical runtime of the connected board.
   *
   *  - Python USB id                     → "Python"   (physical fact)
   *  - Native USB id + history "Cpp"     → "Cpp"      (this app switched it there)
   *  - Native USB id + history "Blockly" → "Blockly"
   *  - Native USB id + anything else     → "Unknown"  (new tab / refresh with
   *      lost history / board re-plugged). The web app has NO firmware query
   *      command to discover the logical Blockly-vs-C++ state, so it stays
   *      unknown instead of being blindly assumed.
   */
  private async resolveLogicalRuntime(): Promise<
    | { hasBoard: false }
    | {
        hasBoard: true;
        port: SerialPort;
        runtime: BoardRuntimeMode;
      }
  > {
    const board = await this.detectBoardMode();

    if (!board?.port) {
      return { hasBoard: false };
    }

    if (board.mode === "Python Mode") {
      // Physical fact — keep the tracked history in sync.
      if (this.currentRuntimeMode !== "Python") {
        this.persistRuntimeMode("Python");
      }
      return { hasBoard: true, port: board.port, runtime: "Python" };
    }

    // Native runtime: only the transition history splits Blockly vs C++.
    if (
      this.currentRuntimeMode === "Blockly" ||
      this.currentRuntimeMode === "Cpp"
    ) {
      return {
        hasBoard: true,
        port: board.port,
        runtime: this.currentRuntimeMode,
      };
    }

    return { hasBoard: true, port: board.port, runtime: "Unknown" };
  }

  /**
   * Settle wait after a native-runtime command (cswitch / bswitch). Those
   * commands may reboot the board WITHOUT changing the USB id, so polling for
   * a "new" id can never observe progress. Instead: if the board re-enumerates
   * (disappears), wait for it to come back on the native id; if it never
   * disappears within the grace window, the firmware applied the mode change
   * in place and we continue with the existing port.
   */
  private async waitForNativeRuntimeSettle(
    originalPort: SerialPort,
    rebootGraceMs = 3000,
    reconnectTimeoutMs = 15000
  ): Promise<SerialPort> {
    const deadline = Date.now() + rebootGraceMs;

    while (Date.now() < deadline) {
      const ports = await this.getAuthorizedPorts();

      if (!ports.includes(originalPort)) {
        console.log(
          "[Board] Board rebooting after mode command — waiting for re-enumeration..."
        );

        return await this.waitForBoardReconnect(
          "Blockly Mode",
          reconnectTimeoutMs
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    console.log(
      "[Board] No USB re-enumeration after mode command — firmware applied it without a reboot."
    );

    return originalPort;
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

  // ------------------------------------------------------------------
  // MODE TRANSITIONS (single source of truth)
  // ------------------------------------------------------------------
  //
  // LOGICAL runtime vs PHYSICAL USB id:
  //   Blockly (default) ┐ native USB ids  303a:1001 / 2e8a:000a (SHARED)
  //   C++               ┘
  //   Python            → python USB ids  303a:817a / 2e8a:0005
  //
  // The USB id can only separate "native" from "python" — it can NEVER tell
  // Blockly from C++. The logical state lives in currentRuntimeMode and is
  // changed ONLY by transitions performed here (or by markRuntimeMode()).
  //
  // Firmware commands (from the project/firmware protocol — none invented):
  //   native → C++      {"msg":"cswitch"}\n
  //   native → Python   {"msg":"switch"}\n
  //   C++    → Blockly  {"msg":"bswitch"}\n
  //   Python → Blockly  "import Subo\r\nSubo.bswitch()\r\n"
  //
  // Every transition: resolve logical runtime → no-op when satisfied →
  // connect → send exactly ONE command (C++→Python goes via Blockly, the only
  // path the firmware supports) → wait for reboot/re-enumerate → reconnect →
  // persist the new logical runtime.

  /**
   * Serializes mode transitions so two concurrent calls (e.g. page mount +
   * route manager both asking for the same target) can never race each other.
   */
  private transitionChain: Promise<boolean> = Promise.resolve(true);

  /** True while a firmware transition (which reboots the board) is running. */
  private transitionInFlight = false;

  async switchToMode(target: BoardModeTarget): Promise<boolean> {
    let commandSent = false;

    const run = async (): Promise<boolean> => {
      this.transitionInFlight = true;

      try {
        const current = await this.resolveLogicalRuntime();

        if (!current.hasBoard) {
          console.warn(
            `[Board] Board not detected - no mode transition performed (target: ${target})`
          );
          return false;
        }

        const { port, runtime } = current;

        // Already satisfied → send NOTHING. ("Unknown" never satisfies: the
        // logical state is unverified, so a real transition is always run.)
        if (runtime !== "Unknown") {
          const satisfied =
            (target === "Blockly Mode" && runtime === "Blockly") ||
            (target === "Cpp Mode" && runtime === "Cpp") ||
            (target === "Python Mode" && runtime === "Python");

          if (satisfied) {
            console.log(`[Board] Already in ${target} — no command sent`);
            await this.connectPort(port);
            return true;
          }
        }

        // ---------------- Python runtime ----------------
        if (runtime === "Python") {
          await this.connectPort(port);

          if (target === "Cpp Mode") {
            console.log("[Board] Switching Python → C++ (cswitch)");
            commandSent = true;
            await this.send(`${JSON.stringify({ msg: "cswitch" })}\n`);
          } else {
            // target === "Blockly Mode"
            console.log("[Board] Switching Python → Blockly (Subo.bswitch)");
            commandSent = true;
            await this.send("import Subo\r\nSubo.bswitch()\r\n");
          }

          const newPort = await this.waitForBoardReconnect(
            "Blockly Mode",
            15000
          );
          this.port = null;
          await this.connectPort(newPort);

          this.persistRuntimeMode(target === "Cpp Mode" ? "Cpp" : "Blockly");
          console.log(`[Board] Transition to ${target} complete`);
          return true;
        }

        // -------- Native runtime (Blockly / Cpp / Unknown) --------
        await this.connectPort(port);

        if (target === "Python Mode") {
          if (runtime === "Cpp") {
            // No direct C++ → Python command: leave C++ first (bswitch).
            console.log("[Board] Leaving C++ runtime first (bswitch)");
            commandSent = true;
            await this.send(`${JSON.stringify({ msg: "bswitch" })}\n`);

            const settled = await this.waitForNativeRuntimeSettle(port);
            if (settled !== port) {
              this.port = null;
            }
            await this.connectPort(settled);
          }

          console.log("[Board] Switching native runtime → Python (switch)");
          commandSent = true;
          await this.send(`${JSON.stringify({ msg: "switch" })}\n`);

          const newPort = await this.waitForBoardReconnect("Python Mode", 15000);
          this.port = null;
          await this.connectPort(newPort);

          this.persistRuntimeMode("Python");
          console.log("[Board] Transition to Python Mode complete");
          return true;
        }

        // Target C++ or Blockly from the native runtime.
        if (target === "Cpp Mode") {
          console.log("[Board] Switching to C++ runtime (cswitch)");
          commandSent = true;
          await this.send(`${JSON.stringify({ msg: "cswitch" })}\n`);
        } else {
          // Blockly target: from "Cpp" this is the required C++ → Blockly
          // restore; from "Unknown" it ENFORCES the default instead of
          // blindly assuming the board is already in Blockly.
          console.log(
            runtime === "Cpp"
              ? "[Board] Restoring default runtime: C++ → Blockly (bswitch)"
              : "[Board] Logical state unverified — enforcing default Blockly runtime (bswitch)"
          );
          commandSent = true;
          await this.send(`${JSON.stringify({ msg: "bswitch" })}\n`);
        }

        const settled = await this.waitForNativeRuntimeSettle(port);
        if (settled !== port) {
          this.port = null;
        }
        await this.connectPort(settled);

        this.persistRuntimeMode(target === "Cpp Mode" ? "Cpp" : "Blockly");
        console.log(`[Board] Transition to ${target} complete`);
        return true;
      } finally {
        this.transitionInFlight = false;
      }
    };

    // Chain onto any in-flight transition so transitions always happen in order.
    const result = this.transitionChain.then(run);

    this.transitionChain = result.then(
      () => true,
      (error) => {
        console.warn("[Board] Mode transition failed:", error);

        // A command already went out, so the board state is genuinely
        // uncertain — drop the cached runtime instead of trusting it.
        if (commandSent) {
          this.persistRuntimeMode("Unknown");
        }

        return true;
      }
    );

    return result;
  }

  async enterPythonMode(): Promise<void> {
    const ok = await this.switchToMode("Python Mode");

    if (!ok) {
      throw new Error("Board not detected");
    }
  }

  async enterCppMode(): Promise<void> {
    const ok = await this.switchToMode("Cpp Mode");

    if (!ok) {
      throw new Error("Board not detected");
    }
  }

  async exitPythonMode(): Promise<void> {
    const ok = await this.switchToMode("Blockly Mode");

    if (!ok) {
      throw new Error("Board not detected");
    }
  }

  /**
   * Ensures a detected board is ready for the Python editor. A missing board is
   * valid for UI navigation, so it is reported without throwing.
   */
  async ensurePythonMode(): Promise<boolean> {
    return this.switchToMode("Python Mode");
  }

  /**
   * Ensures a detected board is ready for the Blockly/C++ runtime (default).
   * A missing board is valid for UI navigation, so it is reported without
   * throwing.
   */
  async ensureBlocklyMode(): Promise<boolean> {
    return this.switchToMode("Blockly Mode");
  }

  /**
   * Ensures a detected board is ready for the C++ editor. A missing board is
   * valid for UI navigation, so it is reported without throwing.
   */
  async ensureCppMode(): Promise<boolean> {
    return this.switchToMode("Cpp Mode");
  }

  /**
   * Record a runtime change that this service did not drive itself — e.g.
   * after a C++ build/flash, when the board boots straight into the freshly
   * flashed C++ runtime and the USB re-enumeration has invalidated the old
   * tracked state.
   */
  markRuntimeMode(mode: "Blockly" | "Python" | "Cpp") {
    this.persistRuntimeMode(mode);
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
