# Android Studio Installation Guide

## 🌐 Download Page Opened

I've opened the official Android Studio download page in your browser: **https://developer.android.com/studio** <mcreference link="https://developer.android.com/studio" index="1">1</mcreference>

## 📋 System Requirements

**Minimum Requirements:** <mcreference link="https://www.geeksforgeeks.org/guide-to-install-and-set-up-android-studio/" index="4">4</mcreference>
- **OS**: Windows 8/10/11 (64-bit)
- **RAM**: 8 GB minimum, 16 GB recommended
- **Disk Space**: 2 GB minimum, 4 GB recommended
- **Resolution**: 1280 x 800 minimum

## 🚀 Installation Steps

### Step 1: Download Android Studio
1. On the opened page, click **"Download Android Studio"**
2. Accept the terms and conditions
3. The download will start automatically (approximately 1 GB)

### Step 2: Install Android Studio
1. **Run the installer** (`android-studio-xxxx-windows.exe`) <mcreference link="https://developer.android.com/studio/install" index="5">5</mcreference>
2. **Follow the Setup Wizard:**
   - Choose installation location (default is fine)
   - Select components to install (keep all selected)
   - Choose Start Menu folder
   - Click "Install"

### Step 3: First Launch Setup
1. **Launch Android Studio** after installation
2. **Complete the Setup Wizard:** <mcreference link="https://developer.android.com/studio/install" index="5">5</mcreference>
   - Choose "Standard" setup type
   - Select UI theme (Light/Dark)
   - **Download SDK components** (this will take 10-15 minutes)
   - Accept license agreements

### Step 4: Verify Installation
1. Android Studio should open successfully
2. You should see the "Welcome to Android Studio" screen
3. SDK Manager should show installed components

## 🔧 Post-Installation Setup

### Configure for Capacitor Development
1. **Open SDK Manager**: `Tools` → `SDK Manager`
2. **Ensure these are installed:**
   - Android SDK Platform-Tools
   - Android SDK Build-Tools (latest version)
   - Android 13 (API 33) or later
   - Google Play services

### Set Environment Variables (Optional but Recommended)
1. **Add to System PATH:**
   - `%LOCALAPPDATA%\Android\Sdk\platform-tools`
   - `%LOCALAPPDATA%\Android\Sdk\tools`

## 🎯 Ready for Your SwiftSell AI Project!

Once Android Studio is installed:

1. **Open your project**: `File` → `Open` → Navigate to `x:\swiftsell-ai\android`
2. **Wait for Gradle sync** (first time may take 5-10 minutes)
3. **Build APK**: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`

## 🚨 Troubleshooting

### Common Issues:
- **Slow download**: Use VPN or try different network
- **Installation fails**: Run as Administrator
- **Gradle sync fails**: Check internet connection and try again
- **SDK download fails**: Use SDK Manager to manually download components

### Alternative Download Sources:
- **Direct from Google**: https://developer.android.com/studio
- **Mirror sites**: Available if main site is slow

## 📱 Next Steps After Installation

1. **Open your Capacitor project** in Android Studio
2. **Build your first APK** following the BUILD_APK_GUIDE.md
3. **Test on your Android device**

---

**Installation typically takes 20-30 minutes including SDK downloads.** ⏱️

Once complete, you'll be ready to build native Android APKs from your React app!