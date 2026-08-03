package com.testapp.mindroots

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WebViewFingerprintModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "WebViewFingerprintModule"
  }

  @ReactMethod
  fun getWebFingerprint(promise: Promise) {
    val activity =
            reactApplicationContext.currentActivity
                    ?: run {
                      promise.reject("NO_ACTIVITY", "currentActivity is null")
                      return
                    }

    activity.runOnUiThread {
      try {
        setupWebView(promise)
      } catch (e: Exception) {
        promise.reject("FINGERPRINT_ERROR", e.message)
      }
    }
  }

  @SuppressLint("SetJavaScriptEnabled", "AddJavascriptInterface")
  private fun setupWebView(promise: Promise) {
    val activity =
            reactApplicationContext.currentActivity
                    ?: run {
                      promise.reject("NO_ACTIVITY", "currentActivity is null")
                      return
                    }

    val webView = WebView(activity)
    webView.settings.javaScriptEnabled = true
    webView.settings.domStorageEnabled = true
    webView.settings.mediaPlaybackRequiresUserGesture = false
    webView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)

    var settled = false

    fun cleanup() {
      activity.runOnUiThread {
        val parent = webView.parent as? android.view.ViewGroup
        parent?.removeView(webView)
        webView.destroy()
      }
    }

    webView.addJavascriptInterface(
            object {
              @JavascriptInterface
              fun onResult(json: String) {
                activity.runOnUiThread {
                  if (settled) return@runOnUiThread
                  settled = true
                  promise.resolve(json)
                  cleanup()
                }
              }

              @JavascriptInterface
              fun onError(message: String) {
                activity.runOnUiThread {
                  if (settled) return@runOnUiThread
                  settled = true
                  promise.reject("FINGERPRINT_JS_ERROR", message)
                  cleanup()
                }
              }
            },
            "AndroidBridge"
    )

    val html =
            """
        <!DOCTYPE html>
        <html><body>
        <script>
          function hashString(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
              hash = (hash << 5) - hash + str.charCodeAt(i);
              hash |= 0;
            }
            return Math.abs(hash).toString(16);
          }

          function getResult() {
            var result = {};
            result.hardwareConcurrency = navigator.hardwareConcurrency || 0;

            try {
              var canvas = document.createElement('canvas');
              var ctx = canvas.getContext('2d');
              ctx.textBaseline = 'top';
              ctx.font = '14px Arial';
              ctx.fillStyle = '#f60';
              ctx.fillRect(0, 0, 100, 20);
              ctx.fillStyle = '#069';
              ctx.fillText('fingerprint-test-\uD83D\uDD12', 2, 2);
              result.canvasHash = hashString(canvas.toDataURL());
            } catch (e) {
              result.canvasHash = null;
            }

            try {
              var glCanvas = document.createElement('canvas');
              var gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
              if (gl) {
                var ext = gl.getExtension('WEBGL_debug_renderer_info');
                result.gpuRenderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
                result.webglVendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
                result.webglHash = (result.gpuRenderer || result.webglVendor) ? hashString((result.gpuRenderer || '') + '-' + (result.webglVendor || '')) : null;
              } else {
                result.gpuRenderer = null;
                result.webglVendor = null;
                result.webglHash = null;
              }
            } catch (e) {
              result.gpuRenderer = null;
              result.webglVendor = null;
              result.webglHash = null;
            }

            try {
              var AudioCtx = window.AudioContext || window.webkitAudioContext;
              if (AudioCtx) {
                var audioCtx = new AudioCtx();
                var oscillator = audioCtx.createOscillator();
                var analyser = audioCtx.createAnalyser();
                var gainNode = audioCtx.createGain();
                gainNode.gain.value = 0;
                oscillator.connect(analyser);
                analyser.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                result.audioFingerprint = hashString(
                  audioCtx.sampleRate + '-' + analyser.fftSize + '-' + audioCtx.state
                );
                try { oscillator.disconnect(); } catch (e) {}
                try { audioCtx.close(); } catch (e) {}
              } else {
                result.audioFingerprint = null;
              }
            } catch (e) {
              result.audioFingerprint = null;
            }

            window.AndroidBridge.onResult(JSON.stringify(result));
          }

          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            getResult();
          } else {
            window.addEventListener('DOMContentLoaded', getResult);
          }
        </script>
        </body></html>
        """.trimIndent()

    val rootView = activity.window.decorView as android.view.ViewGroup
    val layoutParams = android.widget.FrameLayout.LayoutParams(1, 1)
    webView.layoutParams = layoutParams
    webView.alpha = 0f
    rootView.addView(webView)

    webView.webViewClient =
            object : WebViewClient() {
              override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
              }
            }

    webView.loadDataWithBaseURL("https://mrtdeferlink.local/", html, "text/html", "UTF-8", null)

    activity.window.decorView.postDelayed(
            {
              if (!settled) {
                settled = true
                promise.reject("FINGERPRINT_TIMEOUT", "WebView fingerprint timed out")
                cleanup()
              }
            },
            3000
    )
  }
}
