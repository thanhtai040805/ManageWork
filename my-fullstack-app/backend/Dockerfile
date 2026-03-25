# Dùng Node.js
FROM node:20

# Tạo thư mục app
WORKDIR /app

# Copy package.json trước (tối ưu cache)
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ code
COPY . .

# Mở port
EXPOSE 8888

# Chạy app (production start)
CMD ["npm", "start"]