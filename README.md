# 🏛️ Civic Engagement & Community Insight Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)

ระบบรับฟังเสียงประชาชนและวิเคราะห์ปัญหาชุมชน - A comprehensive digital platform for citizens to report community issues and for administrators to analyze and manage them effectively.

![Login Page](docs/screenshots/login.png)

## ✨ Features

### 👥 For Citizens
- 📝 Submit community issues with photos (up to 5 images)
- 📍 Add GPS coordinates (optional)
- 📊 Track issue status in real-time
- 💬 Add comments and updates

### 👨‍💼 For Coordinators
- 🗂️ Manage issues in assigned areas
- 🔄 Update issue status (NEW → IN_PROGRESS → RESOLVED → CLOSED)
- 💭 Add official comments
- 📈 View area-specific analytics

### 🔐 For Administrators
- 📊 Comprehensive dashboard with analytics
- 👥 User management with role assignment
- 🏷️ Category management (bilingual: Thai/English)
- 📍 Area management (province/district/subdistrict)
- 📤 Export reports (PDF/Excel)
- 📈 View statistics and trends

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/civic-engagement-platform.git
cd civic-engagement-platform
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

3. **Setup Database**
```bash
createdb civic_engagement
psql -d civic_engagement -f database/schema.sql
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
```

5. **Run the Application**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

6. **Login**
- URL: http://localhost:5173
- Email: `admin@civic.local`
- Password: `admin123`

⚠️ **Change default password in production!**

## 📁 Project Structure

```
civic-engagement-platform/
├── backend/                 # Node.js/Express API
│   ├── config/             # Configuration files
│   ├── controllers/        # Business logic
│   ├── database/           # Database schema
│   ├── middleware/         # Auth & upload middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded images
│   └── server.js           # Entry point
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── public/
├── docs/                   # Documentation
└── README.md
```

## 🔧 Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi
- **Reporting**: PDFKit, ExcelJS

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Chart.js
- **Styling**: Custom CSS with modern design system

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile

### Issues
- `POST /api/issues` - Create issue
- `GET /api/issues` - List issues (with filters)
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `POST /api/issues/:id/status` - Update status
- `DELETE /api/issues/:id` - Delete issue

### Analytics
- `GET /api/analytics/overview` - Dashboard statistics
- `GET /api/analytics/by-category` - Issues by category
- `GET /api/analytics/by-area` - Issues by area
- `GET /api/analytics/trends` - Trend analysis

[See full API documentation](docs/API.md)

## 🎨 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Submit Issue
![Submit Issue](docs/screenshots/submit-issue.png)

### Issue Management
![Issue Management](docs/screenshots/issue-list.png)

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ File upload validation
- ✅ CORS configuration

## 📈 Database Schema

7 main tables:
- `users` - User accounts with roles
- `categories` - Issue categories (bilingual)
- `areas` - Geographic areas
- `issues` - Community issues
- `issue_images` - Image attachments
- `issue_updates` - Status history
- `user_area_assignments` - Coordinator assignments

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_engagement
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Built with ❤️ for better civic engagement
- Inspired by the need for transparent community issue management
- Thanks to all contributors

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

---

**Made with ❤️ for Thailand's communities**
