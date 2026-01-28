# Profit Manager

A web application for analyzing sales data and calculating profits for partners.

## Features

- CSV file upload for sales data
- Profit calculation with tiered pricing
- Partner management and profit distribution
- Export functionality for reports
- Customizable pricing configuration

## Tech Stack

- React 18
- Vite
- Lucide React (icons)
- Tailwind CSS (utility classes)

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Create production build
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
# Preview production build locally
npm run preview
```

## Deployment

### Deploy to Vercel

This project is configured for easy deployment to Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect the configuration from `vercel.json`
4. Click Deploy

Alternatively, use the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms

The application can be deployed to any static hosting platform:

- **Netlify**: Drag and drop the `dist` folder or connect your GitHub repository
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **Firebase Hosting**: Use `firebase deploy` after building
- **AWS S3 + CloudFront**: Upload the `dist` folder to S3 and configure CloudFront

## Usage

1. Upload a CSV file with sales data (must include 'Partner', 'Product', and 'Quantity' columns)
2. The application will calculate profits based on configured pricing tiers
3. View profit distribution across partners
4. Export reports as needed

## License

MIT
