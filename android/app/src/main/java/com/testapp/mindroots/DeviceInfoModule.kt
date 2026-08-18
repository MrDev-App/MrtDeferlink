package com.testapp.mindroots

import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.provider.Settings
import android.text.format.DateFormat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Locale

class DeviceInfoModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DeviceInfoModule"
    }

    @ReactMethod
    fun getDeviceModel(promise: Promise) {
        try {
            val context = reactApplicationContext
            var deviceName: String? = null

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
                deviceName = Settings.Global.getString(context.contentResolver, "device_name")
            }

            if (deviceName.isNullOrBlank()) {
                deviceName = Settings.Secure.getString(context.contentResolver, "bluetooth_name")
            }

            if (deviceName.isNullOrBlank() ||
                            deviceName.contains("sdk_gphone", ignoreCase = true) ||
                            deviceName.contains("generic", ignoreCase = true)
            ) {
                try {
                    val propertyClass = Class.forName("android.os.SystemProperties")
                    val getMethod = propertyClass.getMethod("get", String::class.java)
                    val avdName = getMethod.invoke(null, "ro.boot.qemu.avd_name") as? String
                    if (!avdName.isNullOrBlank()) {
                        deviceName = avdName.replace('_', ' ')
                    }
                } catch (ignored: Exception) {}
            }

            if (deviceName.isNullOrBlank() || deviceName.contains("sdk_gphone", ignoreCase = true)
            ) {
                val manufacturer = Build.MANUFACTURER
                val model = Build.MODEL
                deviceName =
                        if (model.startsWith(manufacturer, ignoreCase = true)) {
                            model
                        } else {
                            "$manufacturer $model"
                        }
            }

            promise.resolve(deviceName)
        } catch (e: Exception) {
            promise.resolve(Build.MODEL)
        }
    }

    @ReactMethod
    fun getConnectionType(promise: Promise) {
        try {
            val cm =
                    reactApplicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as
                            ConnectivityManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = cm.activeNetwork
                val capabilities = cm.getNetworkCapabilities(network)
                if (capabilities != null) {
                    when {
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ->
                                promise.resolve("wifi")
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ->
                                promise.resolve("cellular")
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) ->
                                promise.resolve("wifi")
                        capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) ->
                                promise.resolve("other")
                        else -> promise.resolve("none")
                    }
                    return
                }
            } else {
                @Suppress("DEPRECATION") val activeNetworkInfo = cm.activeNetworkInfo
                if (activeNetworkInfo != null && activeNetworkInfo.isConnected) {
                    @Suppress("DEPRECATION") val type = activeNetworkInfo.type
                    if (type == ConnectivityManager.TYPE_WIFI ||
                                    type == ConnectivityManager.TYPE_ETHERNET
                    ) {
                        promise.resolve("wifi")
                        return
                    } else if (type == ConnectivityManager.TYPE_MOBILE) {
                        promise.resolve("cellular")
                        return
                    } else {
                        promise.resolve("other")
                        return
                    }
                }
            }
            promise.resolve("none")
        } catch (e: Exception) {
            promise.resolve("unknown")
        }
    }

    @ReactMethod
    fun uses24HourClock(promise: Promise) {
        try {
            val is24 = DateFormat.is24HourFormat(reactApplicationContext)
            promise.resolve(is24)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getRegionInfo(promise: Promise) {
        try {
            val region = Locale.getDefault().country
            val map = Arguments.createMap()
            map.putString("regionCode", region)
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getCurrencyCode(promise: Promise) {
        try {
            val currency = java.util.Currency.getInstance(Locale.getDefault()).currencyCode
            promise.resolve(currency)
        } catch (e: Exception) {
            promise.resolve("USD")
        }
    }

    @ReactMethod
    fun isHighContrastEnabled(promise: Promise) {
        try {
            val resolver = reactApplicationContext.contentResolver
            val highContrast =
                    Settings.Secure.getInt(resolver, "high_text_contrast_enabled", 0) == 1
            val colorInversion =
                    Settings.Secure.getInt(
                            resolver,
                            "accessibility_display_inversion_enabled",
                            0
                    ) == 1
            promise.resolve(highContrast || colorInversion)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun isBoldTextEnabled(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val fontWeightAdjustment =
                        reactApplicationContext.resources.configuration.fontWeightAdjustment
                promise.resolve(fontWeightAdjustment > 0)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun hasCheckedDeferredMatch(promise: Promise) {
        try {
            val context = reactApplicationContext
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            val currentInstallTime = packageInfo.firstInstallTime

            val prefs = context.getSharedPreferences("mrt_deferlink_prefs", Context.MODE_PRIVATE)
            val storedInstallTime = prefs.getLong("stored_first_install_time", 0L)

            if (storedInstallTime != currentInstallTime) {
                promise.resolve(false)
            } else {
                val hasChecked = prefs.getBoolean("has_checked_deferred_match", false)
                promise.resolve(hasChecked)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun markDeferredMatchChecked(promise: Promise) {
        try {
            val context = reactApplicationContext
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            val currentInstallTime = packageInfo.firstInstallTime

            val prefs = context.getSharedPreferences("mrt_deferlink_prefs", Context.MODE_PRIVATE)
            prefs.edit()
                    .putLong("stored_first_install_time", currentInstallTime)
                    .putBoolean("has_checked_deferred_match", true)
                    .apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getOsVersionMajorMinor(promise: Promise) {
        promise.resolve(Build.VERSION.RELEASE)
    }

    @ReactMethod
    fun getBatteryLevel(promise: Promise) {
        try {
            val intent =
                    reactApplicationContext.registerReceiver(
                            null,
                            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
                    )

            val level = intent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale = intent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1

            if (level >= 0 && scale > 0) {
                promise.resolve(level.toDouble() / scale)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("BATTERY_LEVEL_ERROR", e)
        }
    }

    @ReactMethod
    fun isBatteryCharging(promise: Promise) {
        try {
            val intent =
                    reactApplicationContext.registerReceiver(
                            null,
                            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
                    )

            val status = intent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1

            val charging =
                    status == BatteryManager.BATTERY_STATUS_CHARGING ||
                            status == BatteryManager.BATTERY_STATUS_FULL

            promise.resolve(charging)
        } catch (e: Exception) {
            promise.reject("BATTERY_CHARGING_ERROR", e)
        }
    }
    @ReactMethod
    fun getClipboardToken(promise: Promise) {

        try {

            val clipboard =
                    reactApplicationContext.getSystemService(Context.CLIPBOARD_SERVICE) as
                            ClipboardManager

            if (!clipboard.hasPrimaryClip()) {
                promise.resolve(null)
                return
            }

            val clip = clipboard.primaryClip

            val text = clip?.getItemAt(0)?.coerceToText(reactApplicationContext)?.toString()

            promise.resolve(text)
        } catch (e: Exception) {
            promise.reject("CLIPBOARD_ERROR", e)
        }
    }

    @ReactMethod
    fun getScreenBucket(promise: Promise) {
        try {
            val metrics = reactApplicationContext.resources.displayMetrics
            val widthDp = metrics.widthPixels / metrics.density
            val bucket = when {
                widthDp >= 428 -> "large"
                widthDp >= 375 -> "medium"
                else -> "small"
            }
            promise.resolve(bucket)
        } catch (e: Exception) {
            promise.resolve("small")
        }
    }

    @ReactMethod
    fun getPixelRatioBucket(promise: Promise) {
        try {
            val density = reactApplicationContext.resources.displayMetrics.density
            val bucket = if (density >= 2.5) "high" else "standard"
            promise.resolve(bucket)
        } catch (e: Exception) {
            promise.resolve("standard")
        }
    }

    @ReactMethod
    fun getDynamicTypeSize(promise: Promise) {
        try {
            val fontScale = reactApplicationContext.resources.configuration.fontScale
            val size = when {
                fontScale >= 1.3f -> "XL"
                fontScale >= 1.15f -> "L"
                fontScale <= 0.9f -> "S"
                else -> "M"
            }
            promise.resolve(size)
        } catch (e: Exception) {
            promise.resolve("M")
        }
    }

    @ReactMethod
    fun getDeviceLocale(promise: Promise) {
        try {
            val locale = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                reactApplicationContext.resources.configuration.locales.get(0).toLanguageTag()
            } else {
                @Suppress("DEPRECATION")
                reactApplicationContext.resources.configuration.locale.toLanguageTag()
            }
            promise.resolve(locale)
        } catch (e: Exception) {
            promise.resolve("en-US")
        }
    }

    @ReactMethod
    fun getDeviceLanguages(promise: Promise) {
        try {
            val languages = Arguments.createArray()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                val locales = reactApplicationContext.resources.configuration.locales
                for (i in 0 until locales.size()) {
                    languages.pushString(locales.get(i).toLanguageTag())
                }
            } else {
                @Suppress("DEPRECATION")
                languages.pushString(reactApplicationContext.resources.configuration.locale.toLanguageTag())
            }
            promise.resolve(languages)
        } catch (e: Exception) {
            val fallback = Arguments.createArray()
            fallback.pushString("en-US")
            promise.resolve(fallback)
        }
    }

    @ReactMethod
    fun getRegionCode(promise: Promise) {
        try {
            val country = Locale.getDefault().country
            promise.resolve(country.uppercase(Locale.ROOT))
        } catch (e: Exception) {
            promise.resolve("")
        }
    }

    @ReactMethod
    fun isReduceMotionEnabled(promise: Promise) {
        try {
            val scale = Settings.Global.getFloat(
                reactApplicationContext.contentResolver,
                Settings.Global.TRANSITION_ANIMATION_SCALE,
                1.0f
            )
            promise.resolve(scale == 0.0f)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getTimeZone(promise: Promise) {
        try {
            promise.resolve(java.util.TimeZone.getDefault().id)
        } catch (e: Exception) {
            promise.resolve("UTC")
        }
    }

    @ReactMethod
    fun getClockSkewMs(apiUrl: String, promise: Promise) {
        Thread {
            var connection: java.net.HttpURLConnection? = null
            try {
                val url = java.net.URL(apiUrl)
                val localBefore = System.currentTimeMillis()

                connection = url.openConnection() as java.net.HttpURLConnection
                connection.requestMethod = "HEAD"
                connection.connectTimeout = 5000
                connection.readTimeout = 5000
                connection.useCaches = false

                connection.connect()

                val localAfter = System.currentTimeMillis()
                val serverDateStr = connection.getHeaderField("Date")

                if (serverDateStr.isNullOrEmpty()) {
                    promise.resolve(0)
                    return@Thread
                }

                val format = java.text.SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", java.util.Locale.US)
                format.timeZone = java.util.TimeZone.getTimeZone("GMT")
                val serverDate = format.parse(serverDateStr)

                if (serverDate == null) {
                    promise.resolve(0)
                    return@Thread
                }

                val serverTime = serverDate.time
                val localMidpoint = (localBefore + localAfter) / 2.0
                val diff = Math.round(localMidpoint - serverTime).toInt()

                promise.resolve(diff)
            } catch (e: Exception) {
                promise.resolve(0)
            } finally {
                connection?.disconnect()
            }
        }.start()
    }

    @ReactMethod
    fun generateUUID(promise: Promise) {
        try {
            promise.resolve(java.util.UUID.randomUUID().toString())
        } catch (e: Exception) {
            promise.resolve("")
        }
    }
}
