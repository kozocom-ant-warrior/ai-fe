# Copilot Instructions for AI-FE Project

## Quick Reference

This Next.js 16 application is a CV semantic search engine. When suggesting code:

1. **Always use TypeScript** with strict typing
2. **Follow existing patterns** in the codebase
3. **Use Tailwind CSS** for all styling
4. **Export types** from `src/app/types/index.ts`
5. **Handle errors** gracefully with try-catch and toast notifications
6. **Check authentication** before API calls

## Project Context

- **Framework**: Next.js 16 (App Router)
- **Auth**: AWS Cognito via Amplify
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **HTTP**: Axios

## File Locations

- Components: `src/app/components/` (shared) or `src/app/home/components/` (page-specific)
- Types: `src/app/types/` (export from index.ts)
- API: `src/app/api/`
- Hooks: `src/app/home/hooks/`
- Config: `src/configs/`

## Code Patterns

### Component Template
```typescript
'use client';
import { useState } from 'react';
import type { ComponentProps } from '../types';

interface Props {
  // typed props
}

export default function Component({ prop }: Props) {
  // implementation
}
```

### API Call Pattern
```typescript
import axios from 'axios';
import { envConfig } from '@/configs/env';
import toast from 'react-hot-toast';

export async function fetchData() {
  try {
    const response = await axios.get(`${envConfig.apiBaseUrl}/endpoint`);
    return response.data;
  } catch (error) {
    toast.error('Error message');
    throw error;
  }
}
```

## Important Rules

- ✅ Use `'use client'` for interactive components
- ✅ Type all props and state
- ✅ Use Tailwind utility classes
- ✅ Check `auth.isAuthenticated` for protected routes
- ✅ Use `envConfig.apiBaseUrl` for API calls
- ❌ Don't hardcode API URLs
- ❌ Don't skip TypeScript types
- ❌ Don't use inline styles (use Tailwind)

