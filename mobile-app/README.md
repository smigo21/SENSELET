# EATMS Mobile App

Ethiopian Agri-Chain Transparency and Monitoring System Mobile Application

## Overview

The EATMS Mobile App is a React Native application that serves as the mobile interface for the Ethiopian Agricultural Supply Chain Transparency and Monitoring System. It provides role-based access for farmers, traders, transporters, and government officials to manage agricultural supply chain operations.

## Features

### For Farmers
- Create and manage crop offers
- View real-time market prices
- Book transportation services
- Track shipment status
- Receive notifications and alerts

### For Traders
- Browse marketplace offers
- Book transportation for purchases
- Confirm deliveries
- View market analytics

### For Transporters
- View assigned trips
- QR code scanning for checkpoints
- Update shipment status
- Real-time route tracking

### For Government Officials
- Monitor supply chain activities
- View analytics and reports
- Scan QR codes at checkpoints
- Access regulatory information

## Technology Stack

- **Framework**: React Native
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **API Communication**: Axios
- **Real-time Updates**: WebSocket (Socket.IO)
- **Authentication**: JWT tokens with AsyncStorage
- **UI Components**: React Native Paper
- **Maps**: React Native Maps
- **QR Scanning**: React Native QR Scanner

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── Auth/          # Authentication screens
│   │   ├── Farmer/        # Farmer-specific screens
│   │   ├── Trader/        # Trader-specific screens
│   │   ├── Transporter/   # Transporter-specific screens
│   │   └── Shared/        # Shared screens (Profile, Notifications)
│   ├── components/        # Reusable UI components
│   ├── services/          # API, WebSocket, SMS services
│   ├── contexts/          # React contexts (Auth, Role)
│   ├── navigation/        # Navigation configuration
│   ├── utils/             # Utilities and constants
│   └── store/             # Redux store and slices
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
├── scripts/               # Development scripts
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env` file

### Running the App

#### Development Mode
```bash
# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android

# Or run on iOS (macOS only)
npm run ios
```

#### Using the startup script
```bash
./scripts/start-local.sh
```

## Environment Configuration

Create a `.env` file based on `.env.example` and configure the following:

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_WS_URL`: WebSocket URL for real-time updates
- `REACT_APP_SMS_GATEWAY_URL`: SMS gateway for USSD integration
- `REACT_APP_MAP_API_KEY`: Map service API key

## API Integration

The app communicates with the EATMS backend through REST APIs and WebSocket connections:

- **Authentication**: JWT-based authentication
- **Real-time Updates**: WebSocket connections for live data
- **SMS/USSD Bridge**: Integration with SMS gateways for feature phone users

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## Building for Production

### Android
```bash
# Build APK
npm run bundle-android

# Build release APK
cd android && ./gradlew assembleRelease
```

### iOS
```bash
# Build for iOS
npm run bundle-ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the EATMS development team or create an issue in the repository.
