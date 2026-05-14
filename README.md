# College Placement Preparation Portal with AI Mock Interview System

A comprehensive MERN stack application designed to help students prepare for placements through AI-powered mock interviews and interview preparation resources. This project uses **MySQL 8** instead of MongoDB for data persistence.

## 📋 Project Overview

This BCA final year project provides students with:
- **AI-Powered Mock Interviews**: Practice interviews with intelligent feedback
- **Interview Preparation Resources**: Curated materials and practice questions
- **Performance Tracking**: Monitor progress and identify areas for improvement
- **Real-time Feedback**: Get instant analysis of mock interview responses

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library for building interactive user interfaces
- **JavaScript** - Primary programming language

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework

### Database
- **MySQL 8** - Relational database for data management

## 📦 Project Structure

```
College-placement-preparation-portal-with-AI-mock-interview-system-/
├── client/                 # React frontend application
├── server/                 # Node.js/Express backend
├── database/               # MySQL database scripts
├── package.json           # Project dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL 8
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dk62/College-placement-preparation-portal-with-AI-mock-interview-system-.git
   cd College-placement-preparation-portal-with-AI-mock-interview-system-
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure MySQL Database**
   - Create a MySQL database for the project
   - Update database credentials in the backend configuration file
   - Run database migration scripts (if available)

4. **Environment Variables**
   
   Create a `.env` file in the server directory:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=placement_portal
   DB_PORT=3306
   PORT=5000
   NODE_ENV=development
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm start
   
   # Terminal 2 - Start frontend development server
   cd client
   npm start
   ```

   The application will be available at `http://localhost:3000`

## ✨ Features

- 🎙️ **AI Mock Interviews** - Practice with AI-powered interview simulations
- 📊 **Performance Analytics** - Track improvement over time
- 💾 **Interview History** - Review past mock interviews
- 🎯 **Targeted Practice** - Focus on specific topics and skills
- 👤 **User Profiles** - Maintain personalized preparation plans
- 📚 **Resource Library** - Access interview questions and tips

## 🔧 Configuration

### Database Setup

1. Connect to MySQL and create a new database:
   ```sql
   CREATE DATABASE placement_portal;
   USE placement_portal;
   ```

2. Run the schema files to set up tables (locate in the database directory)

### Server Configuration

Update the backend server configuration with:
- Database connection details
- API port settings
- AI service credentials (if applicable)

## 🧪 Testing

```bash
# Run tests (if available)
cd server
npm test

cd ../client
npm test
```

## 📝 API Endpoints

(Add your API documentation here)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is created as a BCA final year project. Please check with your institution for license requirements.

## 👨‍💻 Author

**Dk62** - BCA Final Year Student

## 📞 Support

For questions or issues, please open an issue in the repository or contact the project maintainer.

## 🙏 Acknowledgments

- College placement preparation resources
- AI/ML communities and documentation
- Open-source libraries and frameworks used in this project

---

**Last Updated**: 2026-05-14

