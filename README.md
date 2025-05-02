💼 LegacyLink
LegacyLink is a platform designed to connect alumni and students of Tatyasaheb Kore Institute of Engineering and Technology.

🚀 Complete Guide to Set Up and Run LegacyLink Project
📦 Prerequisites Installation
1. Install Node.js
Download from: https://nodejs.org/

Install the LTS version

Verify installation:

bash
Copy
Edit
node --version
npm --version
2. Install PostgreSQL and pgAdmin
Download from: https://www.postgresql.org/download/windows/

Install and remember your superuser password during setup

🛠️ Project Setup
1. Clone the Repository
bash
Copy
Edit
# Create a directory for your projects
mkdir CollegeProjects
cd CollegeProjects

# Clone your repository
git clone https://github.com/yourusername/LegacyLink.git
cd LegacyLink
2. Install Dependencies
bash
Copy
Edit
npm install
🗃️ Database Setup
1. Open pgAdmin
Launch pgAdmin

Connect to PostgreSQL server using your superuser credentials

2. Create Database
Right-click on Databases

Select Create > Database

Name the database: legacylink

🔐 Environment Setup
1. Create .env File
In the root of the project, create a .env file:

bash
Copy
Edit
touch .env
2. Add the Following Environment Variables
env
Copy
Edit
SESSION_SECRET="TOPSECRETWORD"
PG_USER="postgres"
PG_HOST="localhost"
PG_DATABASE="legacylink"
PG_PASSWORD="your_postgres_password"
PG_PORT="5432"
✨ Features
✅ User authentication (Student/Alumni)

📝 Post creation and display

❤️ Like and 💬 comment functionality

👤 Profile management

📧 Alumni-student connection (coming soon!)

🔍 Search and filter posts (coming soon!)

📂 Admin dashboard (planned)
