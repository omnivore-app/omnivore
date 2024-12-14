# Omnivore - Android

## Setup with gradle

In case you do not have Android Studio and you do not want to install it, you may want to use gradlew scripts to build the application.

`./gradlew assembleDebug` should create `./app/build/outputs/apk/debug/app-debug.apk`


## Setup

From the root directory run the following command:

`make droid`

This will copy a secrets.xml file into the strings directory.
If you have a PSPDF license key then paste that value into the
`pspdfkit_license_key` entry in that file.
