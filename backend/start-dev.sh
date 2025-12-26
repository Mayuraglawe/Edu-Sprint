#!/bin/bash

# EduSprint Backend - Quick Start Script for Linux/Mac
# This script builds and runs the Spring Boot backend in development mode

echo "================================================================================"
echo "  EduSprint Backend - Spring Boot"
echo "  Starting in Development Mode (H2 Database)"
echo "================================================================================"
echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven is not installed or not in PATH"
    echo "Please install Maven from https://maven.apache.org/download.cgi"
    exit 1
fi

# Check if Java 17+ is installed
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed"
    echo "Please install Java 17+ from https://adoptium.net/"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "ERROR: Java 17 or higher is required (found Java $JAVA_VERSION)"
    echo "Please install Java 17+ from https://adoptium.net/"
    exit 1
fi

echo "[1/3] Cleaning previous builds..."
mvn clean

echo ""
echo "[2/3] Building project (this may take a few minutes on first run)..."
mvn install -DskipTests

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Build failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "[3/3] Starting Spring Boot application..."
echo ""
echo "Access points:"
echo "  - API Base: http://localhost:8081/api"
echo "  - Swagger UI: http://localhost:8081/swagger-ui.html"
echo "  - H2 Console: http://localhost:8081/h2-console"
echo ""
echo "Default test users:"
echo "  - Faculty: faculty@edusprint.com / password123"
echo "  - Student: student@edusprint.com / password123"
echo "  - Admin: admin@edusprint.com / password123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================================================"
echo ""

mvn spring-boot:run -Dspring-boot.run.profiles=dev
