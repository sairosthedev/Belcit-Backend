# CORS Configuration for Vercel Frontend

## Overview
The backend CORS configuration has been updated to support deployments on Vercel and other platforms.

## Changes Made

Updated `server.js` CORS configuration to allow requests from:
- ✅ Localhost (development): `http://localhost:3000`, `http://localhost:3001`
- ✅ All Vercel deployments: `https://*.vercel.app`
- ✅ All Render frontends: `https://*.render.com`
- ✅ Custom frontend URL via environment variable

## Environment Variables

You can optionally set a custom frontend URL in your backend environment:

```env
FRONTEND_URL=https://your-custom-domain.com
```

## Security Features

- Regex pattern matching for dynamic Vercel subdomains
- Automatic blocking of unauthorized origins with logging
- Support for credentials (cookies/sessions)
- Explicit allowed HTTP methods and headers

## Testing

The CORS configuration allows:
- Production deployment on Vercel
- Preview deployments (PR-based)
- Local development
- Any Render-based frontend

## Troubleshooting

If you encounter CORS errors:

1. Check the backend logs for the blocked origin message
2. Verify the frontend is using the correct backend URL
3. Ensure credentials are included in requests
4. Check that the Vercel URL matches the pattern `*.vercel.app`

## Deployment

After deploying the updated backend to Render, it will automatically accept requests from:
- Your production Vercel URL
- Any Vercel preview URLs
- Local development environment
