# GreatUniHack 2024 Project
# ChronoQuest

## Project Description

ChronoQuest is a multiplayer web game where players guess the time and place of historical photographs, competing in real time to earn points for accuracy.

## Features

- Real-time multiplayer matches using PartyKit
- Players guess both the year and location of historical images
- Scoring system rewards accuracy in both time and place
- Adaptive difficulty adjusts challenge level based on player performance
- Responsive, accessible interface built with React, Next.js, and Tailwind CSS
- Animated transitions and feedback using Framer Motion
- Social features for challenging friends and sharing results

## Technology Stack

- Next.js (React framework)
- TypeScript
- PartyKit (real-time multiplayer backend)
- Tailwind CSS (UI styling)
- Framer Motion (UI animation)

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-org/chronoquest.git
   cd chronoquest
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables as needed (see `.env.example`).
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser to `http://localhost:3000`.

## How to Play

- Join or create a multiplayer game room.
- Each round, view a historical photograph.
- Enter your guess for the year and location.
- Points are awarded based on how close your guesses are.
- The player with the highest score at the end wins.

## Development Notes

- Game state and player actions are synchronized in real time using PartyKit.
- Historical data is validated for accuracy before being added to the game.
- The scoring algorithm considers both time and location accuracy.
- The content management system allows easy addition of new historical events.

## Future Plans

- Augmented reality mode for immersive experiences
- Classroom features for educators
- Themed historical event packs
- Mobile app versions for iOS and Android

## License

MIT License

---
