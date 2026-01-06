# AI-FE
Kozocom HireGraph - CV Semantic Search Engine

## Mô tả
Ứng dụng web Next.js để tìm kiếm CV theo ngữ nghĩa, giúp nhà tuyển dụng tìm ứng viên phù hợp nhất với mô tả công việc.

## Yêu cầu hệ thống
- Node.js >= 18.x
- npm hoặc yarn hoặc pnpm

## Hướng dẫn cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd ai-fe
```

### 2. Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` trong thư mục gốc của project với nội dung sau:

```env
# AWS Cognito Configuration
NEXT_PUBLIC_USER_POOL_ID=ap-southeast-1_BXDk3dhbU
NEXT_PUBLIC_CLIENT_ID=40d5q9prdkl811tenqkj1b9uvs
NEXT_PUBLIC_REGION=ap-southeast-1
NEXT_PUBLIC_DOMAIN=

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

**Lưu ý:** 
- Thay đổi các giá trị trên theo môi trường của bạn
- File `.env.local` không được commit lên git (đã có trong `.gitignore`)

### 4. Chạy ứng dụng

#### Development mode
```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

#### Production mode
```bash
# Build ứng dụng
npm run build

# Chạy production server
npm start
```

### 5. Kiểm tra
Mở trình duyệt và truy cập: http://localhost:3000

## Cấu trúc thư mục

```
ai-fe/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API routes và services
│   │   ├── components/  # React components dùng chung
│   │   ├── home/        # Trang chủ và components
│   │   ├── providers/   # Context providers
│   │   ├── schemas/     # Zod validation schemas
│   │   └── types/       # TypeScript type definitions
│   └── configs/         # Configuration files
├── public/              # Static files
└── package.json         # Dependencies và scripts
```

## Scripts có sẵn

- `npm run dev` - Chạy development server
- `npm run build` - Build ứng dụng cho production
- `npm start` - Chạy production server
- `npm run lint` - Chạy ESLint để kiểm tra code

## Công nghệ sử dụng

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **AWS Amplify** - Authentication (Cognito)
- **Zod** - Schema validation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Xử lý lỗi thường gặp

### Lỗi kết nối API
- Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trong file `.env.local`
- Đảm bảo API server đang chạy

### Lỗi xác thực
- Kiểm tra các biến môi trường AWS Cognito
- Xác nhận User Pool ID và Client ID đúng

### Lỗi build
- Xóa thư mục `.next` và `node_modules`, sau đó chạy lại `npm install`
- Kiểm tra version Node.js (yêu cầu >= 18.x)

## Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## License
Private - Kozocom
