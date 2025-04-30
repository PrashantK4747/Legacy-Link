# LegacyLink

LegacyLink is a platform designed to connect alumni and students of Tatyasaheb Kore Institute of Engineering and Technology.

## Complete Guide to Set Up and Run LegacyLink Project

Prerequisites Installation
1.Install Node.js
# Download Node.js from https://nodejs.org/
# Install the LTS version
# Verify installation
node --version
npm --version

2.Install PostgreSQL and pgAdmin
# Download PostgreSQL with pgAdmin from https://www.postgresql.org/download/windows/
# Run the installer
# Remember your superuser password during installation

Project Setup
1.Clone the Repository
# Create a directory for your projects
mkdir CollegeProjects
cd CollegeProjects

# Clone your repository
git clone https://github.com/yourusername/LegacyLink.git
cd LegacyLink

2.Install Dependencies
npm install

Database Setup
1.Open pgAdmin
Launch pgAdmin
Connect to PostgreSQL server
Enter your superuser password

2.Create Database
Right-click on "Databases"
Select "Create" > "Database"
Name it "legacylink"

Environment Setup
1.Create .env file
# Create .env file in project root
touch .env

2.Add Environment Variables
SESSION_SECRET="TOPSECRETWORD"
PG_USER="postgres"
PG_HOST="localhost"
PG_DATABASE="legacylink"
PG_PASSWORD="your_postgres_password"
PG_PORT="5432"

## Features

*   User authentication (student/alumni)
*   Post creation and display
*   Like and comment functionality
*   Profile management
*   ... (Add other features)
