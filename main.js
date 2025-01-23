class ServerGenerator {
  constructor() {
    this.zip = new JSZip();
    this.websocket = null;
    this.setupEventListeners();
    this.connectWebSocket();
  }

  setupEventListeners() {
    document.getElementById('downloadBtn').addEventListener('click', () => this.generateAndDownload());
  }

  connectWebSocket() {
    this.websocket = new WebSocket('ws://localhost:3000');
    
    this.websocket.onopen = () => {
      document.getElementById('status').textContent = 'WebSocket Status: Connected';
      document.getElementById('status').style.borderColor = '#2ecc71';
    };

    this.websocket.onclose = () => {
      document.getElementById('status').textContent = 'WebSocket Status: Disconnected';
      document.getElementById('status').style.borderColor = '#e74c3c';
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  generatePackageJson() {
    return {
      name: "nodejs-websocket-server",
      version: "1.0.0",
      description: "A Node.js server with WebSocket support",
      main: "server.js",
      scripts: {
        start: "node server.js"
      },
      dependencies: {
        express: "^4.17.1",
        "ws": "^8.2.3",
        "cors": "^2.8.5"
      }
    };
  }

  generateServerJs() {
    return `const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    console.log('Received:', message);
    // Echo the message back
    ws.send(message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Node.js WebSocket Server Running');
});

server.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`;
  }

  generateReadme() {
    return `# Node.js WebSocket Server

This is a simple Node.js server with WebSocket support.

## Installation

1. Extract the ZIP file
2. Open a terminal in the extracted directory
3. Run \`npm install\` to install dependencies
4. Run \`npm start\` to start the server

## Features

- Express.js web server
- WebSocket support
- CORS enabled
- Basic error handling

## Usage

The server will start on port 3000 by default. You can connect to the WebSocket server at \`ws://localhost:3000\`.

## API Endpoints

- GET / - Returns a simple message confirming the server is running

## WebSocket Events

The WebSocket server echoes back any messages it receives.`;
  }

  async generateAndDownload() {
    // Add files to the zip
    this.zip.file('package.json', JSON.stringify(this.generatePackageJson(), null, 2));
    this.zip.file('server.js', this.generateServerJs());
    this.zip.file('README.md', this.generateReadme());

    try {
      // Generate the zip file
      const content = await this.zip.generateAsync({type: 'blob'});
      
      // Create download link
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'nodejs-websocket-server.zip';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating zip:', error);
    }
  }
}

// Initialize the generator when the page loads
window.addEventListener('load', () => {
  new ServerGenerator();
});