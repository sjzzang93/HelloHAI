#!/bin/bash

echo "🚀 하이HAI 크롤러 시작 중..."
echo ""

# Node.js 설치 확인
if ! command -v node &> /dev/null
then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "https://nodejs.org 에서 Node.js를 설치해주세요."
    exit 1
fi

echo "✅ Node.js 버전: $(node -v)"
echo "✅ npm 버전: $(npm -v)"
echo ""

# node_modules가 없으면 설치
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    npm install
    echo ""
fi

# 서버 실행
echo "🌐 서버 시작..."
echo "브라우저에서 http://localhost:3000 으로 접속하세요."
echo ""
echo "종료하려면 Ctrl+C를 누르세요."
echo ""

npm start

