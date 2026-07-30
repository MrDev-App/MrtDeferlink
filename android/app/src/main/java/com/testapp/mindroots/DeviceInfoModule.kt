package com.testapp.mindroots
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
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

            if (deviceName.isNullOrBlank() || deviceName.contains("sdk_gphone", ignoreCase = true) || deviceName.contains("generic", ignoreCase = true)) {
                try {
                    val propertyClass = Class.forName("android.os.SystemProperties")
                    val getMethod = propertyClass.getMethod("get", String::class.java)
                    val avdName = getMethod.invoke(null, "ro.boot.qemu.avd_name") as? String
                    if (!avdName.isNullOrBlank()) {
                        deviceName = avdName.replace('_', ' ')
                    }
                } catch (ignored: Exception) {}
            }

            if (deviceName.isNullOrBlank() || deviceName.contains("sdk_gphone", ignoreCase = true)) {
                val manufacturer = Build.MANUFACTURER
                val model = Build.MODEL
                deviceName = if (model.startsWith(manufacturer, ignoreCase = true)) {
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
            val cm = reactApplicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = cm.activeNetwork
                val capabilities = cm.getNetworkCapabilities(network)
                if (capabilities != null) {
                    when {
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> promise.resolve("wifi")
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> promise.resolve("cellular")
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> promise.resolve("wifi")
                        capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) -> promise.resolve("other")
                        else -> promise.resolve("none")
                    }
                    return
                }
            } else {
                @Suppress("DEPRECATION")
                val activeNetworkInfo = cm.activeNetworkInfo
                if (activeNetworkInfo != null && activeNetworkInfo.isConnected) {
                    @Suppress("DEPRECATION")
                    val type = activeNetworkInfo.type
                    if (type == ConnectivityManager.TYPE_WIFI || type == ConnectivityManager.TYPE_ETHERNET) {
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
    fun isHighContrastEnabled(promise: Promise) {
        try {
            val resolver = reactApplicationContext.contentResolver
            val highContrast = Settings.Secure.getInt(resolver, "high_text_contrast_enabled", 0) == 1
            val colorInversion = Settings.Secure.getInt(resolver, "accessibility_display_inversion_enabled", 0) == 1
            promise.resolve(highContrast || colorInversion)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun isBoldTextEnabled(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val fontWeightAdjustment = reactApplicationContext.resources.configuration.fontWeightAdjustment
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
}
