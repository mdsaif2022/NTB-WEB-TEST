import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  const plugins = [react()];
  
  if (command === "serve") {
    // Only require and use the express plugin in dev
    const { createServer } = require("./server");
    plugins.push(expressPlugin(createServer));
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'client'),
        '@shared': resolve(__dirname, 'shared'),
      },
    },
    root: './client',
    publicDir: '../public',
    server: {
      port: 8080,
      host: "::",
      open: true
    },
    build: {
      outDir: '../dist/spa',
    },
    define: {
      global: 'globalThis',
    }
  };
});

// Express plugin definition
function expressPlugin(createServer) {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
