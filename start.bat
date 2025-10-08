@echo off
chcp 65001 > nul
echo 🚀 하이HAI 크롤러 시작 중...
echo.

REM Node.js 설치 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다.
    echo https://nodejs.org 에서 Node.js를 설치해주세요.
    pause
    exit /b 1
)

echo ✅ Node.js 설치 확인 완료
node -v
npm -v
echo.

REM node_modules가 없으면 설치
if not exist "node_modules" (
    echo 📦 의존성 설치 중...
    call npm install
    echo.
)

REM 서버 실행
echo 🌐 서버 시작...
echo 브라우저에서 http://localhost:3000 으로 접속하세요.
echo.
echo 종료하려면 Ctrl+C를 누르세요.
echo.

npm start

