@echo off
REM Hostel Management backend launcher (Windows).
REM 1. Defaults below target local MySQL on 3306 (XAMPP-friendly: root + empty password).
REM 2. If backend\.env exists, its KEY=VALUE lines override the defaults
REM    (no spaces around "=", "#" starts a comment).
set "DB_URL=jdbc:mysql://localhost:3306/hostel_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
set "DB_USERNAME=root"
set "DB_PASSWORD="
if exist "%~dp0..\backend\.env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%~dp0..\backend\.env") do set "%%A=%%B"
)
cd /d "%~dp0..\backend"
if defined JAVA_HOME (
  set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
) else (
  set "JAVA_CMD=java"
)
"%JAVA_CMD%" -jar target\hostel-management-1.0.0.jar
