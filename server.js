const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve static files from the frontend/dist directory
const staticPath = path.join(__dirname, 'frontend', 'dist');
console.log('Serving static files from:', staticPath);

if (require('fs').existsSync(staticPath)) {
  console.log('Static directory exists. Contents:', require('fs').readdirSync(staticPath));
  
  // Check if assets directory exists
  const assetsPath = path.join(staticPath, 'assets');
  if (require('fs').existsSync(assetsPath)) {
    console.log('Assets directory contents:', require('fs').readdirSync(assetsPath));
  }
  
  app.use(express.static(staticPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
} else {
  console.error('Static directory does not exist:', staticPath);
  console.log('Root directory contents:', require('fs').readdirSync(__dirname));
}

// Proxy API calls to Firebase Functions (if needed)
// app.use('/api', createProxyMiddleware({
//   target: 'https://your-region-your-project.cloudfunctions.net',
//   changeOrigin: true,
//   pathRewrite: {
//     '^/api': ''
//   }
// }));

// Handle client-side routing - send all requests to index.html
// This should be LAST and only handle routes that aren't static files
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  console.log('Serving index.html for route:', req.path);

  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('index.html not found at:', indexPath);
    res.status(404).send('index.html not found');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Firebase App Hosting server running on port ${port}`);
  console.log('Working directory:', __dirname);
  console.log('Directory contents:', require('fs').readdirSync(__dirname));
});