# Scoreboard Saga: UI and Design Philosophy

This document details the user interface (UI) design, philosophy, and key components of the Scoreboard Saga application.

---

## 1. Design Philosophy

The UI design philosophy is centered around three core principles:

-   **Clarity**: The primary goal is to present information in a clear and unambiguous way. The layout is clean and structured, with a strong visual hierarchy to guide the user's attention to the most important information, such as the leaderboard rankings.
-   **Efficiency**: The application is designed for a Game Master who may be managing a live event. Workflows are streamlined to allow for quick and easy player and score management. Actions like updating a score or adding a player are handled in focused modals to avoid context switching.
-   **Professionalism**: The aesthetic is professional and focused, using a simple color palette and modern typography to create a sense of seriousness suitable for a competitive environment. Animations are subtle and used purposefully to provide feedback without being distracting.

---

## 2. Color Palette

The color scheme is simple and effective, creating a clean and professional look.

| Role             | Color                               | Hex       | Usage                                                                |
| ---------------- | ----------------------------------- | --------- | -------------------------------------------------------------------- |
| **Primary**      | <div style="background-color:#3F51B5;color:white;padding:4px;border-radius:4px;">Dark Blue</div> | `#3F51B5` | Used for primary buttons, headers, and highlights to draw attention. |
| **Background**   | <div style="background-color:#F5F5F5;padding:4px;border-radius:4px;">Very Light Gray</div> | `#F5F5F5` | Provides a clean, neutral backdrop that enhances readability.      |
| **Accent**       | <div style="background-color:#9575CD;color:white;padding:4px;border-radius:4px;">Muted Purple</div> | `#9575CD` | Used for secondary actions and accents that need to stand out.       |
| **Text**         | <div style="background-color:#333;color:white;padding:4px;border-radius:4px;">Dark Gray</div> | `#333333` | The primary color for body text, ensuring high readability.          |

---

## 3. Typography

-   **Font**: **Inter** (sans-serif)
-   **Reasoning**: 'Inter' was chosen for its excellent readability on screens, its modern aesthetic, and its clean, neutral feel, which complements the overall design philosophy.

---

## 4. Pages and Layout

The application is structured around a few key pages:

-   **/login**: A simple page for the Game Master to enter their credentials and log in to the application.
-   **/signup**: A page for a new Game Master to create an account.
-   **/** (Root/Dashboard): This is the main hub of the application, accessible after login. It is not a landing page but the primary workspace. The layout is a two-column design on larger screens:
    -   **Main Column (Left)**: Prominently features the real-time **Leaderboard**.
    -   **Sidebar (Right)**: Contains the **Activity Log** and **WhatsApp Log Viewer** for tracking recent events.

---

## 5. Key UI Components

The UI is built using a consistent set of components, leveraging the `shadcn/ui` library.

-   **Header**: Contains the application logo/title and the "Add Player" button, which opens a modal.
-   **Leaderboard**: A table that displays all players, their scores, and ranks. It is the central component of the application and updates in real-time. Each row has buttons for updating the score or deleting the player.
-   **Modals (Dialogs)**: Used for focused tasks to keep the main interface clean.
    -   **Add Player Modal**: A form for adding a new player.
    -   **Update Score Modal**: A form to enter a new score for a selected player.
    -   **Player Details Modal**: Shows more detailed information about a specific player.
    -   **Delete Confirmation Dialog**: An alert dialog to prevent accidental deletion of a player.
-   **Cards**: Used to create visual containers for different sections of the UI, such as the Leaderboard, Activity Log, and forms. This creates a structured and organized layout.
-   **Toasts**: Non-intrusive pop-up notifications used to provide feedback on actions (e.g., "Player added successfully," "Error sending message").
-   **Footer**: Contains summary information, such as the total number of players.
