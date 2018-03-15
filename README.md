
# Cordova Platform String Replace

A plugin for replacing strings in platform files.

## Installation
With Cordova CLI, from npm:
```
$ cordova plugin add cordova-plugin-platform-replace
$ cordova prepare
```

## Usage

```xml
<platform name="android">
	<replace-string file="project.properties" find="regex:com\.facebook\.android\:facebook-android-sdk\:[\+0-9\.]+" replace="com.facebook.android:facebook-android-sdk:4.25.0" />
	<replace-string file="phonegap-plugin-barcodescanner/mobile-barcodescanner.gradle" find="com.android.support:support-v4:+" replace="com.android.support:support-v4:24.1.1+" />
</platform>
```