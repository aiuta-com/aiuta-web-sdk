#!/usr/bin/env node

// This is a simple entry point script that starts the Next.js application
console.log('Starting Aiuta Web SDK...');

// Import the Next.js package
const next = require('next');

// Create the Next.js app instance
const app = next({
  dev: false,
  dir: '.'
});

// Get the request handler from Next.js
const handle = app.getRequestHandler();

// Prepare the Next.js app and start the HTTP server
app.prepare()
  .then(() => {
    const http = require('http');
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(8080, '0.0.0.0', () => {
      console.log('Aiuta Web SDK is running on port 8080');
    });
  })
  .catch(err => {
    console.error('Error starting Aiuta Web SDK:', err);
    process.exit(1);
  });
