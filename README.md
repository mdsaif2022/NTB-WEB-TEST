# Explore Bangladesh - Tourism Platform (NTB-WEB-TEST)

A modern tourism platform built with React, Vite, and Firebase for exploring Bangladesh's beautiful destinations.

## Features

- 🏞️ **Tour Management**: Admin panel for managing tours and destinations
- 📝 **Blog System**: Content management for travel blogs and articles
- 🎯 **User Authentication**: Secure user registration and login
- 📱 **Responsive Design**: Mobile-first responsive design
- 🔥 **Firebase Integration**: Real-time database and authentication
- 🎨 **Modern UI**: Beautiful UI components with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Image Upload**: Cloudinary
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mdsaif2022/NTB-WEB-TEST.git
cd NTB-WEB-TEST
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure Firebase:
   - Create a Firebase project
   - Add your Firebase config to `.env.local`
   - Enable Firestore and Authentication

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Project Structure

```
NTB-WEB-TEST/
├── client/                 # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── styles/           # CSS and styling
├── shared/               # Shared types and utilities
├── server/               # Backend server (if applicable)
└── public/               # Static assets
```

## Admin Features

- **Tour Management**: Create, edit, and manage tour packages
- **Blog Management**: Approve and manage blog submissions
- **User Management**: View and manage user accounts
- **Analytics Dashboard**: Track bookings and user engagement

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

The app is optimized for Vercel deployment with automatic builds and deployments.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
