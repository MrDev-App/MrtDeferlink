import Foundation
import WebKit

@objc(WebViewFingerprintModule)
class WebViewFingerprintModule: NSObject, WKScriptMessageHandler {

  private var webView: WKWebView?
  private var pendingResolve: RCTPromiseResolveBlock?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func getWebFingerprint(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.pendingResolve = resolve

      let contentController = WKUserContentController()
      contentController.add(self, name: "fingerprintHandler")

      let config = WKWebViewConfiguration()
      config.userContentController = contentController

      let webView = WKWebView(frame: .zero, configuration: config)
      self.webView = webView
      webView.loadHTMLString(WebViewFingerprintModule.fingerprintHTML, baseURL: nil)
    }
  }

  func userContentController(_ userContentController: WKUserContentController,
                              didReceive message: WKScriptMessage) {
    if message.name == "fingerprintHandler" {
      pendingResolve?(message.body)
      cleanup()
    }
  }

  private func cleanup() {
    webView?.configuration.userContentController.removeScriptMessageHandler(forName: "fingerprintHandler")
    webView = nil
    pendingResolve = nil
  }

  static let fingerprintHTML = """
  <!DOCTYPE html>
  <html><body>
  <script>
    function hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    }

    function getResult() {
      const result = {};
      result.hardwareConcurrency = navigator.hardwareConcurrency || 0;

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 100, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('fingerprint-test-\\uD83D\\uDD12', 2, 2);
        result.canvasHash = hashString(canvas.toDataURL());
      } catch (e) {
        result.canvasHash = null;
      }

      try {
        const glCanvas = document.createElement('canvas');
        const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        result.gpuRenderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        result.webglVendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
        result.webglHash = hashString(result.gpuRenderer + '-' + result.webglVendor);
      } catch (e) {
        result.gpuRenderer = null;
        result.webglVendor = null;
        result.webglHash = null;
      }

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const analyser = audioCtx.createAnalyser();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        oscillator.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        result.audioFingerprint = hashString(
          audioCtx.sampleRate + '-' + analyser.fftSize + '-' + audioCtx.state
        );
        oscillator.disconnect();
        audioCtx.close();
      } catch (e) {
        result.audioFingerprint = null;
      }

      window.webkit.messageHandlers.fingerprintHandler.postMessage(JSON.stringify(result));
    }
    getResult();
  </script>
  </body></html>
  """
}
