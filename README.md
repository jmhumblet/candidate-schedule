# PlanIt - Interview Scheduler

PlanIt is a modern, responsive web application designed to streamline the process of scheduling candidate interviews. It allows jury members to define interview parameters, generate visual timelines, and manage email templates for communication.

## 🚀 Features

*   **Session Planning:** Easily configure jury dates, job titles, and candidate counts.
*   **Customizable Sequences:** Define durations for preparation, interview, and debriefing stages, including breaks.
*   **Visual Timeline:** Automatically generate and visualize interview schedules for multiple candidates.
*   **Email Templates:** Built-in editor for invitation and confirmation emails with live preview.
*   **Theme Support:** Fully responsive design with automatic Dark/Light mode support based on system preferences.
*   **Cloud Sync & Sharing:** (New) Optional Google Login to sync sessions across devices and share them with colleagues via email.
*   **Offline First:** Works offline with local storage and syncs changes to the cloud when connectivity is restored.

## 🛠 Tech Stack

*   **Core:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
*   **Backend (BaaS):** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
*   **Styling:** [Bootstrap 5](https://getbootstrap.com/), [React-Bootstrap](https://react-bootstrap.github.io/)
*   **Testing:** [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/)
*   **CI/CD:** GitHub Actions, GitHub Pages

## 🏁 Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/jmhumblet/candidate-schedule.git
    cd candidate-schedule
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration (Firebase)

To enable cloud features (Login, Sync, Sharing), you need to configure Firebase.

1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Authentication** (Google Sign-In).
3.  Enable **Firestore Database**.
4.  Copy the contents of `firestore.rules` from this repository to your Firestore Rules in the console.
5.  Create a Web App in Firebase and copy the configuration object.
6.  Update `src/firebase/config.ts` with your API keys.

### Running Locally

Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## 🧪 Testing

### Unit & Integration Tests

Run the Jest test suite:

```bash
npm run test:ci
```

### End-to-End Tests

Run Playwright E2E tests:

```bash
npx playwright test
```

## 📦 Deployment

The application is automatically deployed to GitHub Pages via GitHub Actions.

*   **Live Demo:** [https://jmhumblet.github.io/candidate-schedule/](https://jmhumblet.github.io/candidate-schedule/)
*   **Feature Previews:** Pull requests generate a preview deployment for testing.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
