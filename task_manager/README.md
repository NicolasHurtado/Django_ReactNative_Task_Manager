# Collaby - Collaborative Task Manager

A modern mobile application for team task management, built with React Native and Expo.

![Splash Screen](./assets/Blur.png)

## 📱 Features

- **User Authentication**: Secure registration and login system
- **Task Management**: Create, edit, delete, and view tasks
- **Task Assignment**: Assign tasks to different team members
- **Deadlines**: Set start and end dates for each task
- **Overlap Detection**: Alert when tasks overlap in time
- **Intuitive Interface**: Modern design with modals for a smooth experience

## 🛠️ Technologies

- **Frontend**:
  - React Native
  - Expo
  - TypeScript
  - React Navigation
  - Formik and Yup (form validation)
  - Zustand (state management)
  - Expo Linear Gradient and Expo Blur (visual effects)

- **Other packages**:
  - React Native Elements
  - React Native Modal DateTime Picker
  - Axios (HTTP requests)
  - AsyncStorage (local storage)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android emulator) or Xcode (for iOS)

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd task_manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the application**:
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on device or emulator**:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan the QR code with the Expo Go app (Android/iOS)

## 📱 Using the Application

1. **Sign In / Register**:
   - Use your credentials to access
   - Register if you're a new user

2. **Task Management**:
   - Tap the "Create a Task" button to create a new task
   - Set title, description, assignee, start/end dates
   - Tap an existing task to view or edit its details

3. **Navigation**:
   - Use the bottom navigation to move between sections
   - Swipe to refresh the task list

## 🔧 Configuration

The application uses environment variables to configure the connection with the backend. Make sure to correctly configure the endpoints as needed.

## 👥 Contribution

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/amazing-feature`)
3. Make your changes and commit (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📞 Contact

For any inquiries about the project, contact us at [nicolashurtado0712@gmail.com](mailto:nicolashurtado0712@gmail.com).

---

Developed with ❤️ by Nicolas Hurtado