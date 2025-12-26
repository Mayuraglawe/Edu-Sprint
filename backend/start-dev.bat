@echo off
REM EduSprint Backend - Quick Start Script for Windows
REM This script builds and runs the Spring Boot backend in development mode

echo ================================================================================
echo   EduSprint Backend - Spring Boot
echo   Starting in Development Mode (H2 Database)
echo ================================================================================
echo.

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven from https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

REM Check if Java 17+ is installed
java -version 2>&1 | findstr /R "version \"1[7-9]\|version \"[2-9][0-9]" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java 17 or higher is required
    echo Please install Java 17+ from https://adoptium.net/
    pause
    exit /b 1
)

echo [1/3] Cleaning previous builds...
call mvn clean

echo.
echo [2/3] Building project (this may take a few minutes on first run)...
call mvn install -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Spring Boot application...
echo.
echo Access points:
echo   - API Base: http://localhost:8081/api
echo   - Swagger UI: http://localhost:8081/swagger-ui.html
echo   - H2 Console: http://localhost:8081/h2-console
echo.
echo Default test users:
echo   - Faculty: faculty@edusprint.com / password123
echo   - Student: student@edusprint.com / password123
echo   - Admin: admin@edusprint.com / password123
echo.
echo Press Ctrl+C to stop the server
echo ================================================================================
echo.

call mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause
