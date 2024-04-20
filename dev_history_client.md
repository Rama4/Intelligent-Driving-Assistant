# Development History for SmartDrivingAssistant client app

## Initial Commit

create client folder in root directory and initialize new React Native app

    mkdir client
    cd client

    npx react-native@latest init SmartDrivingAssistant

Added this code in the class in MainActivity.java:

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
super.onCreate(null);
}
```

added this in the MainActivity.java:

```java
import android.os.Bundle;
```

Running the command successfully runs it on android device

    yarn start

## install react navigation

    yarn add @react-navigation/native
    yarn add react-native-screens react-native-safe-area-context
    yarn add @react-navigation/native-stack

## Add redux read/update functionality - complete

        yarn add react-redux redux redux-thunk @reduxjs/toolkit

configured Redux, all update actions working.
symptoms array index update working.

## Accelerometer code - basic functionality

using: https://www.npmjs.com/package/react-native-sensors

https://react-native-sensors.github.io/docs/Installation.html

install package with : `yarn add react-native-sensors`

Followed Android configuration instructions

In MainApplication.java, linking at runtime was not necessary, got an error that the app is attempting to link an already linked library.. so skipped that part in the guide:

        // Adding react-native-sensors package link
        // Apparently not necessary, as it is linked already.
        // packages.add(new RNSensorsPackage());

https://react-native-sensors.github.io/docs/Usage.html#Raw-device-acceleration

https://github.com/react-native-sensors/react-native-sensors/blob/master/docs/API.md

To compare previous and current emitted objects in the Subscription, used pairwise() to achieve it:
https://rxjs.dev/api/operators/pairwise

    https://stackoverflow.com/questions/50059622/rxjs-observable-which-emits-both-previous-and-current-value-starting-from-first

The app navigates successfully.

## Native Modules add and test

Reference: https://reactnative.dev/docs/native-modules-android

After you add the native modules, and link it to the package, and then add the package to the MainApplication, just run 'yarn android'.

Added 2 native modules with synchronous and asynchronous methods and tested them from the js side.

## Add Car Dashboard screen

Sort the files properly and refactor some.

Create car dashboard screen with mock components for fuel info, volume control and audio player

## Add incoming Call detection

using the react-native-call-detection package.

got this error after adding the package and running gradle build:

    Execution failed for task ':app:processDebugMainManifest'.
    > Manifest merger failed : Attribute application@allowBackup value=(false) from AndroidManifest.xml:11:7-34
        is also present at [:react-native-call-detection] AndroidManifest.xml:10:9-35 value=(true).
        Suggestion: add 'tools:replace="android:allowBackup"' to <application> element at AndroidManifest.xml:7:5-12:19 to override.

fixed by adding the below attribute to <Application> in AndroidManifest: `tools:replace="android:allowBackup"`

add hook for starting and stopping call detection and state machine.

TODO: test on android phone with sim

## Add phone volume control functionality

yarn add react-native-volume-manager

created a hook for storing current device volume and functions for increasing, decreasing and listening to volume change

## [client][API call layer] initial changes

contains methods for making api calls to server

Add API service with sample api call

npm install @remobile/react-native-call-state --save

get requests to public urls working

## Emergency Contacts screen

using react-native-contacts package

user selects one contact from the list, and saves one phone number which has >= 10 characters.

also added maps screen with source and destination for basic UX.

## Voicemessages

### add redux slice for voicemessages

    create reducer functions and selectors.
    created a new service (voicemessageService) for interfacing between consumers and redux.
    tested basic crud of voicemessages.

    created a new screen for testing these: VoiceMessageTestScreen

### create and store voicemessage mp3 files locally on android devices

### [server][client] Add voicemessages api endpoints

add upload and download endpoints (csrf exempt)

NOTE: they are csrf exempt

add upload and download functions in api service

tested in android api 29

server stores the uploaded files in "caller" folder and the downloadable files to driver folders inside the server folder

## acceletometer initial change

    merged all changes to my branch.
    added basic accelerometer code.

### [server][client] Sync voicemessages between server and client

#### Voicemails initial loading

    upon app load, client searches for locally downloaded voicemails in Download/vms folder.
    it loads the file names to redux and shows that as the list of voicemails.

#### Voicemails sync from server

flow:
client first requests for pending Voicemails to server.
server sends a list of files inside the "caller" folder.
client then downloads all the files from that file list into the "vms" folder in downloads.

home screen shows selected emergency contact.

using uuidv4 for generating voicemessage file names.
got this error: crypto.getRandomValues() not supported
fix: https://stackoverflow.com/a/68097811/4327723

## [server][client][Feature] end-to-end voice message calling flow complete

    TODO: generate voice message text based on context.

flow:
the driver receives an incoming call which becomes a missed call.
upon missed call, the voicemail text is generated and then converted to speech using Google TTS API and saved to mp3 file in "Vmssent" folder in downloads.
this file is then uploaded to the server, which stores it in the "caller" folder.
the caller can then see any voicemails sent by the driver in the voicemail list page, upon syncing.

### Youtube video sound player for top songs of an artist

### fetch top artists given the location and country

TODO: set location and country based on context

### send voice message to emergency contact when collision is detected

[client][Feature] end-to-end emergency voice message sending flow complete

TODO: generate voice message text based on context.

flow:
the client requests the server every few seconds for collision detection.
the server takes in the live camera feed and detects collision or not
if the collision is detected, the client is informed and the voicemail text is generated and then converted to speech using Google TTS API
and saved to mp3 file in "Vmssent" folder in downloads.
This voicemail is then sent to the emergency contact upon syncing the voicemessages.

### fetch ip from .env file in client folder for both server and client, add Readme

### add dotenv to requirements.txt

### fix contacts not selecting the first selected contact.

## cache route traffic context to redux

    able to get traffic route legs distances and durations and traffic conditions.
    using Google maps routes API.
    the data is cached to redux

### car start and stop driving implemented, and add volume control based on context

    increment the polyline counter upon start driving and stop the counter when stop driving.

    add volume control code.

### add accelerometer collision detection and context based volume in Maps Screen

### calculate driving score and fuel information

## slider

using react-native-slider

    yarn add react-native-slider

add vector icons

yarn add react-native-vector-icons

add to android/app/build.gradle:

    ```
    project.ext.vectoricons = [
        iconFontNames: [ 'MaterialIcons.ttf' ] // Specify font files
    ]

    apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
    ```

reference: https://github.com/benevbright/react-native-sound-playerview/blob/master/index.js
