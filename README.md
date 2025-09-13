# Scoreboard Saga

Scoreboard Saga is a web application that allows you to create and manage scoreboards for your games and competitions. It provides a real-time leaderboard that updates automatically as scores change. This project is built with Next.js, Firebase, and Tailwind CSS.

## Features

-   **Player Registration**: Capture player details: name, surname, email, and phone number.
-   **Leaderboard Display**: Display a real-time scoreboard showing player names and scores.
-   **Dynamic Ranking**: Automatically update the scoreboard when a new player is added or a score changes, ensuring the list is always ordered by score.
-   **WhatsApp Integration**: Send updates to players via WhatsApp using Twilio.

## Tech Stack

-   [Next.js](https://nextjs.org/) - A React framework for building user interfaces.
-   [Firebase](https://firebase.google.com/) - A platform for building web and mobile applications.
-   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for styling.
-   [Twilio](https://www.twilio.com/) - A customer engagement platform for building voice, video, and messaging applications.
-   [Radix UI](https://www.radix-ui.com/) - A collection of unstyled, accessible UI components.
-   [React Hook Form](https://react-hook-form.com/) - A library for managing forms in React.
-   [Zod](https://zod.dev/) - A TypeScript-first schema declaration and validation library.
-   [Vitest](https://vitest.dev/) - A fast and simple testing framework.

## Getting Started

To get started with Scoreboard Saga, follow these steps:

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (version 20 or higher)
-   [npm](https://www.npmjs.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/scoreboard-saga.git
cd scoreboard-saga
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project by copying the example file:

```bash
cp .env.example .env.local
```

Then, fill in the required values in the `.env.local` file. You will need to create a Firebase project and a Twilio account to get the necessary credentials.

### 4. Run the development server

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## Available Scripts

-   `npm run dev`: Runs the application in development mode.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the code using Next.js's built-in ESLint configuration.
-   `npm run typecheck`: Checks the code for TypeScript errors.
-   `npm test`: Runs the test suite using Vitest.

## Project Structure

```
.
├── src
│   ├── app
│   │   ├── api         # API routes
│   │   ├── (pages)     # Next.js pages
│   │   └── layout.tsx  # Root layout
│   ├── components      # Reusable UI components
│   ├── hooks           # Custom React hooks
│   ├── lib             # Utility functions and Firebase configuration
│   └── styles          # Global styles
├── public              # Static assets
└── ...
```

## Styling Guidelines

-   **Primary color**: Dark Blue (`#3F51B5`)
-   **Background color**: Very light gray (`#F5F5F5`)
-   **Accent color**: A muted Purple color (`#9575CD`)
-   **Body and headline font**: 'Inter'
-   **Icons**: Simple, flat icons
-   **Layout**: Clean, structured layout
-   **Animations**: Subtle animations for score updates

## Deployment

This application is configured for deployment to [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). You can deploy the application by connecting your Firebase project to your GitHub repository and following the instructions in the Firebase console.

## Contributing

Contributions are welcome! Please follow the coding standards outlined in `AGENTS.md`.
