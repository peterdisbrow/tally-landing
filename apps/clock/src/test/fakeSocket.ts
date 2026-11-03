/** Minimal controllable WebSocket for tests. */
export class FakeSocket {
  static instances: FakeSocket[] = [];
  static OPEN = 1;
  static CLOSED = 3;
  readyState = 0;
  sent: string[] = [];
  onopen: ((e?: unknown) => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: ((e?: unknown) => void) | null = null;
  onclose: ((e: { code: number; reason: string }) => void) | null = null;
  constructor(public url: string) { FakeSocket.instances.push(this); }
  send(data: string) { this.sent.push(data); }
  close() { if (this.readyState !== 3) this.serverClose(1005, ""); }
  // test helpers
  serverOpen() { this.readyState = 1; this.onopen?.(); }
  serverSend(msg: unknown) { this.onmessage?.({ data: JSON.stringify(msg) }); }
  serverClose(code = 1006, reason = "") { this.readyState = 3; this.onclose?.({ code, reason }); }
  static reset() { FakeSocket.instances = []; }
  static get last() { return FakeSocket.instances[FakeSocket.instances.length - 1]; }
}
