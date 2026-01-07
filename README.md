# AI-FE
Kozocom HireGraph - CV Semantic Search Engine

## Description
Next.js web application for semantic CV search, helping recruiters find the most suitable candidates for job descriptions.

## System Requirements
- Node.js >= 18.x
- npm or yarn or pnpm

## Installation Guide

### 1. Clone repository
```bash
git clone <repository-url>
cd ai-fe
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables
Create a `.env.local` file in the project root directory with the following content:

```env
# AWS Cognito Configuration
NEXT_PUBLIC_USER_POOL_ID=ap-southeast-1_BXDk3dhbU
NEXT_PUBLIC_CLIENT_ID=40d5q9prdkl811tenqkj1b9uvs
NEXT_PUBLIC_REGION=ap-southeast-1
NEXT_PUBLIC_DOMAIN=

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

**Note:** 
- Change the values above according to your environment
- The `.env.local` file should not be committed to git (already in `.gitignore`)

### 4. Run the application

#### Development mode
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will run at: http://localhost:3000

#### Production mode
```bash
# Build the application
npm run build

# Run production server
npm start
```

### 5. Verify
Open your browser and access: http://localhost:3000

## Directory Structure

```
ai-fe/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API routes and services
│   │   ├── components/  # Shared React components
│   │   ├── home/        # Home page and components
│   │   ├── providers/   # Context providers
│   │   ├── schemas/     # Zod validation schemas
│   │   └── types/       # TypeScript type definitions
│   └── configs/         # Configuration files
├── public/              # Static files
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build application for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint to check code

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **AWS Amplify** - Authentication (Cognito)
- **Zod** - Schema validation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Common Issues and Solutions

### API Connection Error
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local` file
- Ensure API server is running

### Authentication Error
- Check AWS Cognito environment variables
- Verify User Pool ID and Client ID are correct

### Build Error
- Delete `.next` and `node_modules` folders, then run `npm install` again
- Check Node.js version (requires >= 18.x)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Private - Kozocom
