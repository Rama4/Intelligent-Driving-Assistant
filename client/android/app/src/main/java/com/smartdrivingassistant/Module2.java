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

public class Module2 extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private Callback callback;

    Module2(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "Module2";
    }

    @ReactMethod
    public void foo() {
        Log.d("Module2"," hi da!");
    }

  
}
