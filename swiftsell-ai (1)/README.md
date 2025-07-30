# SwiftSell AI - Mobile App

This project uses Capacitor to wrap the React web application into a native Android app.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version)
- [Android Studio](https://developer.android.com/studio)
- A physical Android device or an Android Emulator

## 1. Setup

### Install Dependencies
First, install all the required npm packages.

```bash
npm install
```

### Configure API Key
The application requires a Google Gemini API key.

1.  Create a file named `.env.local` in the root of the project.
2.  Add your API key to this file:

```
VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
```
The build process is configured to make this key available to the application as `process.env.API_KEY`.

## 2. Running the App in a Browser

To test the web application part of the project locally, run:

```bash
npm run dev
```
This will start a local development server, and you can open the provided URL in your browser.

## 3. Building the Android APK

Follow these steps to build the application for Android.

### Step 3.1: Build the Web App
Create a production build of the React application. This command compiles all the web assets into the `dist` directory, which Capacitor will use.

```bash
npm run build
```

### Step 3.2: Add the Android Platform
Add the Android platform to your Capacitor project. This will create an `android` directory in your project.

```bash
npx cap add android
```

### Step 3.3: Sync Web Assets
Copy the latest web build into the native Android project. You should run this command every time you make changes to your web code and want to test them on the device.

```bash
npx cap sync
```

### Step 3.4: Open in Android Studio
Open the native Android project in Android Studio.

```bash
npx cap open android
```

### Step 3.5: Build the APK
Once the project is open in Android Studio:

1.  Wait for Gradle to sync and index the project.
2.  Select your target device (either a connected physical device or a virtual emulator) from the toolbar.
3.  Go to the menu `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`.
4.  Once the build is complete, Android Studio will show a notification with a link to locate the generated APK file. You can install this file on your device.
