package com.testapp.mindroots

import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.facebook.react.bridge.*

class InstallReferrerModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "InstallReferrerModule"

    @ReactMethod
    fun getInstallReferrer(promise: Promise) {

        val referrerClient = InstallReferrerClient.newBuilder(reactApplicationContext).build()

        referrerClient.startConnection(
                object : InstallReferrerStateListener {

                    override fun onInstallReferrerSetupFinished(responseCode: Int) {

                        if (responseCode == InstallReferrerClient.InstallReferrerResponse.OK) {
                            try {
                                val response = referrerClient.installReferrer
                                promise.resolve(response.installReferrer)
                            } catch (e: Exception) {
                                promise.reject("REFERRER_ERROR", e)
                            } finally {
                                referrerClient.endConnection()
                            }
                        } else {
                            promise.resolve(null)
                        }
                    }
                    override fun onInstallReferrerServiceDisconnected() {
                        promise.resolve(null)
                    }
                }
        )
    }
}
