# Scoreboard Saga

Scoreboard Saga is a web application that allows you to create and manage scoreboards for your games and competitions. It provides a real-time leaderboard that updates automatically as scores change.

## Features

- **Player Registration**: Capture player details: name, surname, email, and phone number.
- **Leaderboard Display**: Display a real-time scoreboard showing player names and scores.
- **Dynamic Ranking**: Automatically update the scoreboard when a new player is added or a score changes, ensuring the list is always ordered by score.

## Tech Stack

- **Next.js**: A React framework for building user interfaces.
- **Firebase**: A platform for building web and mobile applications.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Genkit**: An open source library for building AI-powered features.
- **Twilio**: A customer engagement platform for building voice, video, and messaging applications.

## Getting Started

To get started with Scoreboard Saga, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/scoreboard-saga.git
   ```

2. **Install dependencies**:

   ```bash
   cd scoreboard-saga
   npm install
   ```

3. **Set up Firebase**:

   - Create a new Firebase project.
   - Add a new web app to your Firebase project.
   - Copy your Firebase configuration and paste it into a new `.env.local` file in the root of the project.

4. **Run the development server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project is structured as follows:

- **`src/app`**: Contains the main application pages.
- **`src/components`**: Contains the reusable UI components.
- **`src/lib`**: Contains the Firebase configuration and utility functions.
- **`src/ai`**: Contains the Genkit AI flows.
- **`public`**: Contains the static assets.

## Styling Guidelines

- **Primary color**: Dark Blue (`#3F51B5`)
- **Background color**: Very light gray (`#F5F5F5`)
- **Accent color**: A muted Purple color (`#9575CD`)
- **Body and headline font**: 'Inter'
- **Icons**: Simple, flat icons
- **Layout**: Clean, structured layout
- **Animations**: Subtle animations for score updates
