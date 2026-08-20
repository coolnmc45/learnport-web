# LearnPort Web Version - Deployment Guide

## Production Build

The production-ready build is located in the `dist/` directory and contains:
- Optimized JavaScript bundle (427KB)
- Minified CSS styles (5.1KB)
- HTML entry point with proper asset references

### Build Output
```
dist/
├── index.html          # Main HTML file
└── assets/
    ├── index-*.js      # Minified React application
    └── index-*.css     # Minified Tailwind CSS
```

## Deployment Options

### Option 1: Vercel (Recommended)
Vercel provides free hosting with automatic deployments from Git.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# For production deployment
vercel --prod
```

### Option 2: Netlify
Netlify offers free hosting with continuous deployment.

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages
Host directly from a GitHub repository.

```bash
# Update package.json with:
"homepage": "https://yourusername.github.io/learnport-web"

# Build and deploy
npm run build
# Push dist folder to gh-pages branch
```

### Option 4: Traditional Web Server (Nginx/Apache)
Copy the `dist` folder contents to your web server.

```bash
# Nginx configuration example
server {
    listen 80;
    server_name learnport.example.com;
    
    root /var/www/learnport-web/dist;
    index index.html;
    
    # SPA routing: redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option 5: Docker Container
Deploy as a containerized application.

```dockerfile
# Dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Configuration

Create a `.env.production` file for production settings:

```env
VITE_API_URL=https://api.learnport.example.com
VITE_APP_NAME=LearnPort
VITE_APP_VERSION=1.0.0
```

## Performance Optimization

The production build includes:
- Code splitting for faster initial load
- CSS minification
- JavaScript minification and compression
- Asset optimization
- Tree-shaking of unused code

### Bundle Analysis
```bash
# Install bundle analyzer
npm install -D rollup-plugin-visualizer

# Analyze bundle size
npm run build -- --analyze
```

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **CORS**: Configure CORS headers for API requests
3. **CSP**: Implement Content Security Policy headers
4. **Authentication**: Use secure session management
5. **API Keys**: Never commit API keys; use environment variables

## Monitoring & Analytics

### Add Google Analytics
```typescript
// In src/main.tsx
import { useEffect } from 'react'

useEffect(() => {
  // Add GA script
  window.dataLayer = window.dataLayer || []
  function gtag(...args) { dataLayer.push(arguments) }
  gtag('js', new Date())
  gtag('config', 'GA_MEASUREMENT_ID')
}, [])
```

### Error Tracking
Integrate Sentry for error monitoring:

```bash
npm install @sentry/react @sentry/tracing
```

## Scaling Considerations

### Database
- Use PostgreSQL for production (already configured in mobile app)
- Implement connection pooling
- Set up automated backups

### API
- Use the existing tRPC backend from the mobile app
- Implement rate limiting
- Cache frequently accessed data

### CDN
- Serve static assets from a CDN (Cloudflare, AWS CloudFront)
- Cache CSS and JavaScript files
- Compress responses with gzip/brotli

## Maintenance

### Regular Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update major versions
npm install react@latest react-dom@latest
```

### Monitoring Checklist
- [ ] Monitor error rates
- [ ] Track page load times
- [ ] Monitor API response times
- [ ] Check user engagement metrics
- [ ] Review security logs

## Rollback Procedure

If issues occur in production:

```bash
# Revert to previous version
git revert <commit-hash>
npm run build
# Redeploy
```

## Support & Documentation

- **Mobile App**: See `/home/ubuntu/learning-portfolio-app/README.md`
- **API Documentation**: See `/home/ubuntu/learning-portfolio-app/server/README.md`
- **Issue Tracking**: Use GitHub Issues for bug reports
- **Contact**: support@learnport.example.com

## Next Steps

1. Choose a deployment platform
2. Configure environment variables
3. Set up CI/CD pipeline
4. Configure monitoring and analytics
5. Test in staging environment
6. Deploy to production
7. Monitor performance and errors
