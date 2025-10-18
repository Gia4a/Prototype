const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve static files from the current directory (where built files are copied)
app.use(express.static(path.join(__dirname, '.')));

// Proxy API calls to Firebase Functions (if needed)
// app.use('/api', createProxyMiddleware({
//   target: 'https://your-region-your-project.cloudfunctions.net',
//   changeOrigin: true,
//   pathRewrite: {
//     '^/api': ''
//   }
// }));

// Handle client-side routing - send all non-API requests to index.html
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).send('API route not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Firebase App Hosting server running on port ${port}`);
});