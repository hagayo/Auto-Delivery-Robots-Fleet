import '@testing-library/jest-dom/vitest';

// Minimal EventSource stub so App mount doesn’t crash in jsdom
class MockEventSource {
  url: string;
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null = null;
  constructor(url: string) { this.url = url; }
  addEventListener() {}
  removeEventListener() {}
  close() {}
}
(globalThis as any).EventSource = MockEventSource as any;
