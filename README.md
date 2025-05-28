# TravelConservation.com

A luxury conservation travel directory that connects conscious travelers with meaningful conservation experiences worldwide.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI v5 with custom conservation theme
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **Routing**: React Router v6
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form with Yup validation

## Features

- 🏠 **Home Page**: Hero section with featured conservation destinations
- 🔍 **Directory**: Searchable conservation travel listings
- 🧠 **Persona Planner**: AI-powered trip planning based on user preferences
- 📊 **Nerd Mode**: Conservation analytics and impact dashboard
- 👤 **User Profile**: Personal dashboard with bookings and saved listings
- 🔐 **Authentication**: Email/password and Google OAuth
- 📱 **Mobile-First**: Responsive design optimized for all devices

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── listings/       # Listing-related components
│   ├── persona/        # Persona planner components
│   └── analytics/      # Analytics components
├── pages/
│   ├── Home/           # Home page
│   ├── Directory/      # Directory and listing detail pages
│   ├── PersonaPlanner/ # AI trip planning
│   ├── NerdMode/       # Analytics dashboard
│   └── Profile/        # User profile and dashboard
├── services/
│   ├── firebase/       # Firebase configuration and services
│   └── api/            # API service functions
├── types/              # TypeScript type definitions
├── theme/              # Material-UI theme configuration
├── hooks/              # Custom React hooks
└── utils/              # Utility functions
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd travelconservation
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - Authentication (Email/Password and Google)
   - Firestore Database
   - Storage
   - Functions
   - Hosting

3. Copy `.env.example` to `.env` and fill in your Firebase configuration:

```bash
cp .env.example .env
```

Update the `.env` file with your Firebase project credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=travelconservation-b4f04.firebaseapp.com
REACT_APP_FIREBASE_STORAGE_BUCKET=travelconservation-b4f04.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 3. Firebase CLI Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 4. Development

```bash
# Start the development server
npm start
```

The application will be available at `http://localhost:3000`

### 5. Build and Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID |

## Design System

### Color Palette

- **Primary**: Deep Forest Green (#1B4332)
- **Secondary**: Earth Brown (#8B4513)
- **Accent**: Ocean Blue (#006994)
- **Success**: Conservation Green (#52B788)
- **Warning**: Sunset Orange (#F77F00)
- **Background**: Warm White (#FEFEFE)
- **Surface**: Light Sage (#F1F8E9)

### Typography

- **Headers**: Playfair Display (elegant, luxury feel)
- **Body**: Inter (clean, readable)

## Data Models

### ConservationListing
- Location and coordinates
- Conservation type (wildlife, marine, forest, cultural)
- Luxury level (1-5)
- Sustainability score
- Activities and certifications
- Availability and pricing

### User
- Profile information
- Travel preferences
- Booking history
- Conservation impact tracking

### Persona
- Travel personality types
- Recommended experiences
- Budget and style preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
