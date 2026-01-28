# Deployment Guide

This document provides step-by-step instructions for deploying the Profit Manager application.

## Quick Start (Vercel - Recommended)

1. Push your code to GitHub (already done)
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import the `udevsooriyaarachchi/profit-manager` repository
5. Vercel will auto-detect the configuration
6. Click "Deploy"
7. Your app will be live in ~2 minutes!

## Manual Deployment Steps

### 1. Build the Application

```bash
npm install
npm run build
```

The production-ready files will be in the `dist/` directory.

### 2. Deploy to Your Platform

#### Vercel CLI

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages

Add this to `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    - uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### AWS S3 + CloudFront

```bash
# Build first
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select dist as your public directory
firebase deploy
```

## Environment Variables

Currently, the application doesn't require any environment variables. All configuration is stored in localStorage.

If you need to add environment variables in the future:

1. Create a `.env` file (already in .gitignore)
2. Add variables prefixed with `VITE_`:
   ```
   VITE_API_URL=https://api.example.com
   ```
3. Access in code: `import.meta.env.VITE_API_URL`

## Custom Domain

After deployment, you can configure a custom domain:

- **Vercel**: Project Settings → Domains
- **Netlify**: Site Settings → Domain Management
- **GitHub Pages**: Repository Settings → Pages → Custom Domain
- **Other platforms**: Consult their documentation

## Testing Deployment

After deployment, test these features:

1. ✅ Upload a CSV file
2. ✅ View expense management
3. ✅ Check partner information
4. ✅ Export functionality
5. ✅ Configuration settings

## Monitoring

Consider adding:

- **Vercel Analytics**: Built-in for Vercel deployments
- **Google Analytics**: Add to index.html
- **Sentry**: For error tracking

## Troubleshooting

### Build Fails

- Check Node.js version (requires v16+)
- Clear `node_modules` and `package-lock.json`, then `npm install` again

### Styles Not Working

- Ensure Tailwind CSS is installed: `npm install -D tailwindcss`
- Check that `styles.css` is imported in `main.jsx`

### File Upload Not Working

- Check browser console for errors
- Ensure the file is a valid CSV format

## Continuous Deployment

The GitHub Actions workflow (`.github/workflows/build.yml`) automatically:

- Builds the app on every push to main
- Runs on pull requests
- Uploads build artifacts

For automatic deployment, integrate with your platform's GitHub app:

- **Vercel**: Connects automatically via GitHub integration
- **Netlify**: Enable "Deploy on Git Push" in settings
- **Others**: Add deployment step to the workflow

## Support

For issues or questions:

1. Check the main README.md
2. Review build logs
3. Open an issue on GitHub
