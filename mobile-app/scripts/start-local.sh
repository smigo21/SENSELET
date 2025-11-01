#!/bin/bash

# EATMS Mobile App Local Development Startup Script

echo "🚀 Starting EATMS Mobile App Development Environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if React Native CLI is installed
if ! command -v npx react-native &> /dev/null; then
    echo "⚠️  React Native CLI not found. Installing globally..."
    npm install -g @react-native-community/cli
fi

# Navigate to mobile app directory
cd "$(dirname "$0")/.."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Android SDK is available (for Android development)
if [ -d "$ANDROID_HOME" ]; then
    echo "✅ Android SDK found at $ANDROID_HOME"
else
    echo "⚠️  Android SDK not found. Please set ANDROID_HOME environment variable for Android development."
fi

# Check if iOS development environment is available (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcodebuild &> /dev/null; then
        echo "✅ Xcode found"
    else
        echo "⚠️  Xcode not found. Please install Xcode for iOS development."
    fi
fi

echo ""
echo "📱 Available commands:"
echo "  npm run android    - Run on Android device/emulator"
echo "  npm run ios        - Run on iOS simulator (macOS only)"
echo "  npm start          - Start Metro bundler"
echo "  npm test           - Run tests"
echo "  npm run lint       - Run ESLint"
echo ""

# Start Metro bundler
echo "🔄 Starting Metro bundler..."
npm start
