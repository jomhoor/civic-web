/**
 * Jomhoor Wallet Bridge
 *
 * When the Civic Compass web app runs inside the Jomhoor mobile app's WebView,
 * this bridge enables communication between the web app and the native wallet.
 *
 * The mobile app injects `window.__JOMHOOR_WALLET__` with the wallet address.
 * Signing requests are sent via `window.ReactNativeWebView.postMessage()` and
 * the response comes back via `window.__jomhoorSignCallback()`.
 */

/* ------------------------------------------------------------------ */
/*  Detection                                                          */
/* ------------------------------------------------------------------ */

declare global {
  interface Window {
    __JOMHOOR_WALLET__?: {
      address: string;
    };
    ReactNativeWebView?: {
      postMessage: (msg: string) => void;
    };
    __jomhoorSignCallback?: (signature: string) => void;
    __jomhoorSignReject?: (error: string) => void;
  }
}

/** Returns true when running inside the Jomhoor app WebView. */
export function isInsideJomhoor(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.__JOMHOOR_WALLET__ &&
    !!window.ReactNativeWebView
  );
}

/** Get the wallet address injected by the Jomhoor app. */
export function getJomhoorAddress(): string | null {
  return window.__JOMHOOR_WALLET__?.address ?? null;
}

/* ------------------------------------------------------------------ */
/*  Signing                                                            */
/* ------------------------------------------------------------------ */

/**
 * Request the Jomhoor app to sign a message.
 *
 * Sends a postMessage to the native side and waits for the callback.
 * The mobile app calls `window.__jomhoorSignCallback(signature)` or
 * `window.__jomhoorSignReject(error)` in response.
 */
export function signMessageViaBridge(message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.ReactNativeWebView) {
      reject(new Error("Not running inside Jomhoor app"));
      return;
    }

    // Set up one-time callbacks
    window.__jomhoorSignCallback = (signature: string) => {
      window.__jomhoorSignCallback = undefined;
      window.__jomhoorSignReject = undefined;
      resolve(signature);
    };

    window.__jomhoorSignReject = (error: string) => {
      window.__jomhoorSignCallback = undefined;
      window.__jomhoorSignReject = undefined;
      reject(new Error(error));
    };

    // Send signing request to the native app
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "SIGN_MESSAGE",
        payload: { message },
      })
    );

    // Timeout after 60 seconds
    setTimeout(() => {
      if (window.__jomhoorSignCallback) {
        window.__jomhoorSignCallback = undefined;
        window.__jomhoorSignReject = undefined;
        reject(new Error("Signing request timed out"));
      }
    }, 60_000);
  });
}
