# Collaborative Task Management System

A complete task management system with client-server architecture, built with React Native (frontend) and Django (backend).



## 📋 Project Structure

### Prerequisites

- Node.js (v22 or higher)
- npm or yarn
- Python 3.11+
- Docker and Docker Compose (recommended for backend)


This repository contains two main components:

### 1. Frontend (task_manager/)

A mobile application developed with React Native and Expo for collaborative task management:

- **Key Features**: User authentication, task management, task assignment, deadlines, overlap detection
- **Technologies**: React Native, Expo, TypeScript, React Navigation, Formik and Yup
- **Interface**: Modern and intuitive with modals for a smooth experience

[View detailed frontend documentation](./task_manager/README.md)

### 2. Backend (backend/)

A RESTful API built with Django and Django Rest Framework:

- **Key Features**: JWT Authentication, user management, task CRUD operations, data validation
- **Technologies**: Django, Django REST Framework, PostgreSQL, Docker
- **Security**: Token-based authentication, protected endpoints, data validation

[View detailed backend documentation](./backend/README.md)



## 🔄 Communication Flow

The frontend (React Native) communicates with the backend (Django) through a REST API:

1. **Authentication**: User logs in and backend generates a JWT token
2. **Authorization**: Requests to the backend include the token to access protected resources
3. **CRUD Operations**: Frontend can create, read, update, and delete tasks through specific endpoints
4. **Validation**: Backend validates data and returns appropriate responses (success/error)

## 📦 Deployment

### Backend

- **Production**: Can be deployed on services like AWS, Google Cloud, Heroku, etc.
- **Docker**: Includes Docker configuration ready for production
- **Database**: Configured to use PostgreSQL

### Frontend

- **Expo**: Can be built for iOS and Android using Expo
- **Standalone**: APKs/IPAs can be generated for distribution
- **Environment Variables**: Configurable for different environments (development/production)

## 👥 Contribution

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and commit (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

## 📞 Contact

For any inquiries about the project, contact us at [nicolashurtado0712@gmail.com](mailto:nicolashurtado0712@gmail.com).

---

Developed with ❤️ by Nicolas Hurtado
