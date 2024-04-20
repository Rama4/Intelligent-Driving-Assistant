package com.smartdrivingassistant;

import java.util.ArrayList;
import java.util.List;
import java.lang.Math;
import java.io.File;

import android.graphics.Bitmap;
import android.media.MediaMetadataRetriever;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;

import android.graphics.Color;
import android.os.Environment;
import android.os.AsyncTask;
import android.util.Log;

public class Module1 extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private Callback callback;

    Module1(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "Module1";
    }
    
    @ReactMethod
    public void foo() {
        Log.d("Module1"," hi da!");
    }

    @ReactMethod
    public void doAsynchronousTask(int threshold, final Callback callback) {
        try {
            this.callback = callback;
            AsynchronousTask task = new AsynchronousTask(threshold);
            task.execute();
        } catch (Exception e) {
            if (callback != null) {
                callback.invoke(e.toString(), null);
            }
        }
    }

    private class AsynchronousTask extends AsyncTask<Void, Void, String> {
        private int Threshold;
        AsynchronousTask() {
            super();
            this.Threshold = 1000;
        }

        AsynchronousTask(int threshold) {
            super();
            this.Threshold = threshold;
        }

        @Override
        protected String doInBackground(Void... params) {
            try {
                
                // Do some background task
                
                int x = this.Threshold;
                return String.valueOf(x);
            } catch (Exception e) {
                return e.toString();
            }
        }

        @Override
        protected void onPostExecute(String result) {
            if (callback != null) {
                if (result != null) {
                    callback.invoke("Success", result);
                } else {
                    callback.invoke("Error", null);
                }
            }
        }
    }
}
