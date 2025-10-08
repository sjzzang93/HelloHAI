# Node.js 앱을 위한 Dockerfile
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 앱 소스 복사
COPY . .

# 포트 3000 노출
EXPOSE 3000

# 앱 실행
CMD ["npm", "start"]
