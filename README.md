# LegacyLink

LegacyLink is a comprehensive web application designed to bridge the gap between alumni and current students of Tatyasaheb Kore Institute of Engineering and Technology, fostering meaningful connections and knowledge sharing within the educational community.

## � Features

- **Multi-User Authentication**
  - Student Login
  - Alumni Login
  - Admin Dashboard

- **Admin Features**
  - Add/Manage Students
  - Add/Manage Alumni
  - Bulk Import Feature
  - View Complete Lists

- **Interactive Interface**
  - Responsive Design
  - Modern UI/UX
  - Real-time Chat Feature with Gemini AI

## 💻 Tech Stack

- **Frontend**
  - HTML5
  - CSS3/SCSS
  - JavaScript
  - EJS (Embedded JavaScript Templates)

- **Backend**
  - Node.js
  - Express.js

- **AI Integration**
  - Google Gemini AI for Chatbot

## 📁 Project Structure

```
LegacyLink/
├── assets/           # Core assets
├── public/           # Public assets
│   ├── css/         # Stylesheets
│   ├── img/         # Images
│   ├── js/          # JavaScript files
│   └── scss/        # SCSS source files
├── views/           # EJS templates
│   ├── admin/       # Admin panel views
│   └── partials/    # Reusable view components
└── index.js         # Application entry point
```

## 🛠️ Installation

1. Install Node.js
   - Download from: https://nodejs.org/
   - Install the LTS version
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. Clone the repository
   ```bash
   git clone https://github.com/PrashantK4747/Legacy-Link.git
   cd LegacyLink
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Configure environment variables
   - Create a `.env` file in the root directory:
     ```env
     SESSION_SECRET="Your Own Secret key"
     PG_USER="Database User Name (like: postgre)"
     PG_HOST="localhost"
     PG_DATABASE="Database Name (Like: legacylink)"
     PG_PASSWORD="Your Own Password"
     PG_PORT="Your Port Number"

     ```

5. Start the application
   ```bash
   npm start
   ```

## 👥 User Roles

1. **Admin**
   - Manage student and alumni accounts
   - Import data in bulk
   - View and manage user lists

2. **Alumni**
   - Create and manage profile
   - Connect with students
   - Share experiences and knowledge

3. **Students**
   - Access alumni profiles
   - Interact through chat
   - Learn from alumni experiences

## ✨ Current Features

- ✅ User authentication (Student/Alumni)
- 📝 Profile creation and management
- 💬 AI-powered chatbot integration
- 👥 Alumni-student connection
- 🔍 Search and filter profiles
- 📊 Admin dashboard

## � Upcoming Features

- 📧 Direct messaging between alumni and students
- � Mobile responsive design improvements
- 🎯 Job opportunity posting
- � Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👏 Acknowledgments

- Tatyasaheb Kore Institute of Engineering and Technology for their support
- All contributors who have helped this project grow
- Open source community for various tools and libraries used

---

## Contact

For questions or suggestions, open an issue or contact [prashantk4747@gmail.com]

