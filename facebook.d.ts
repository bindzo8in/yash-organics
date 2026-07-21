export {};

declare global {
  interface Window {
    fbq: (
      trackType: string,
      eventName: string,
      options?: Record<string, unknown>
    ) => void;
    _fbq?: unknown;
  }
}