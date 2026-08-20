# LearnPort Web Version

A production-ready web application for learning portfolio and assessment management. Built with React, TypeScript, Tailwind CSS, and Vite.

## Features

### Role-Based Access
- **Learner**: Upload evidence, track portfolio progress, view feedback
- **Assessor**: Mark submissions, provide feedback, flag for IQA
- **Trainer**: Create sessions, manage learning resources
- **IQA**: Sample and quality assure assessor decisions
- **EQA**: Monitor centre compliance and portfolio standards

### Core Functionality
- ✅ Role-based authentication with demo accounts
- ✅ Responsive dashboard with role-specific metrics
- ✅ Portfolio management with unit progress tracking
- ✅ Marking suite with grading and feedback
- ✅ File upload with drag-and-drop support
- ✅ Real-time notifications
- ✅ Compliance tracking and reporting

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 11+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/learnport-web.git
cd learnport-web

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
# http://localhost:5173
```

### Demo Accounts

The app includes demo accounts for all roles:

| Role | Email | Password |
|------|-------|----------|
| Learner | learner@example.com | demo |
| Assessor | assessor@example.com | demo |
| Trainer | trainer@example.com | demo |
| IQA | iqa@example.com | demo |
| EQA | eqa@example.com | demo |

Just select a role on the login screen to proceed.

## Development

### Project Structure

```
src/
├── pages/              # Page components
│   ├── RoleSelect.tsx  # Role selection
│   ├── Dashboard.tsx   # Dashboard
│   ├── Portfolio.tsx   # Learner portfolio
│   ├── MarkingSuite.tsx # Assessor marking
│   └── FileUpload.tsx  # Evidence upload
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── types/              # TypeScript types
│   └── index.ts        # Shared types
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm type-check       # Type check with TypeScript

# Production
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code quality
pnpm lint             # Lint with ESLint (if configured)
pnpm format           # Format with Prettier (if configured)
```

## Deployment

### Quick Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

### Docker Deployment

```bash
# Build image
docker build -t learnport-web .

# Run container
docker run -p 80:80 learnport-web
```

### Traditional Server

```bash
# Build
pnpm build

# Copy dist folder to web server
scp -r dist/ user@server:/var/www/learnport-web/

# Configure Nginx (see nginx.conf)
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Architecture

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with PostCSS
- **Routing**: React Router v7
- **Build Tool**: Vite 8
- **Icons**: Lucide React

### State Management
- React Context API for authentication
- Local Storage for persistence
- Demo data for development

### Backend Integration
- Ready to connect to the mobile app's tRPC API
- Axios for HTTP requests
- Zod for type validation

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=LearnPort
VITE_APP_VERSION=1.0.0
```

### Tailwind CSS

Customize colors in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#0a7ea4',
      secondary: '#64748b',
    },
  },
}
```

## Performance

### Bundle Size
- JavaScript: 427KB (minified)
- CSS: 5.1KB (minified)
- Total: ~432KB

### Optimization Techniques
- Code splitting with Vite
- CSS minification
- JavaScript minification
- Asset optimization
- Tree-shaking of unused code

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Security

- ✅ HTTPS enforced in production
- ✅ Content Security Policy headers
- ✅ XSS protection
- ✅ Secure session management
- ✅ CORS configured for API

## Testing

### Manual Testing Checklist
- [ ] Role selection works for all 5 roles
- [ ] Dashboard displays correct metrics per role
- [ ] Portfolio shows units and progress
- [ ] File upload with drag-and-drop works
- [ ] Marking suite displays submissions
- [ ] All navigation links work
- [ ] Responsive on mobile (375px+)
- [ ] Responsive on tablet (768px+)
- [ ] Responsive on desktop (1024px+)

### Automated Testing (Future)
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Dev Server Won't Start
```bash
# Check if port 5173 is in use
lsof -i :5173

# Use different port
pnpm dev -- --port 3001
```

### Styling Issues
```bash
# Rebuild Tailwind CSS
pnpm build

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 📧 Email: support@learnport.example.com
- 🐛 Issues: GitHub Issues
- 📚 Documentation: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📱 Mobile App: See [../learning-portfolio-app/README.md](../learning-portfolio-app/README.md)

## Related Projects

- **Mobile App**: [learning-portfolio-app](../learning-portfolio-app) - React Native/Expo version
- **Backend API**: [learning-portfolio-app/server](../learning-portfolio-app/server) - tRPC backend

## Roadmap

- [ ] Add real-time collaboration with WebSockets
- [ ] Implement push notifications
- [ ] Add analytics dashboard
- [ ] Create admin panel
- [ ] Add multi-language support
- [ ] Implement dark mode
- [ ] Add accessibility improvements
- [ ] Create mobile app wrapper

## Changelog

### v1.0.0 (2024-07-17)
- Initial release
- Role-based authentication
- Dashboard with role-specific views
- Portfolio management
- Marking suite
- File upload
- Responsive design
