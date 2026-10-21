import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const projectRoot = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

/**
 * Validates that VITE_API_URL is properly configured for production builds.
 *
 * Fail-Closed Invariants:
 * 1. Must be a non-empty string.
 * 2. Must parse as a valid absolute URL using the standard URL API.
 * 3. Must use the HTTPS protocol (insecure HTTP is prohibited in production).
 * 4. Cannot target localhost, 127.x.x.x, 0.0.0.0, [::1], or local mDNS domains.
 */
export function validateProductionApiUrl(apiUrl?: string): string {
  if (!apiUrl || typeof apiUrl !== 'string' || apiUrl.trim().length === 0) {
    throw new Error(
      '[Production Build Guard] VITE_API_URL is missing or empty. ' +
      'A valid, public HTTPS backend URL is required for production builds ' +
      '(e.g. VITE_API_URL=https://govscheme-api.onrender.com).'
    );
  }

  const trimmed = apiUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `[Production Build Guard] VITE_API_URL is malformed: "${trimmed}". ` +
      'A valid absolute HTTPS URL is required (e.g. https://govscheme-api.onrender.com).'
    );
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(
      `[Production Build Guard] VITE_API_URL must use the HTTPS protocol in production builds. ` +
      `Received insecure protocol: "${parsed.protocol}".`
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLoopback =
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    /^127\.\d+\.\d+\.\d+$/.test(hostname) ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname === '[0:0:0:0:0:0:0:1]' ||
    hostname === '::' ||
    hostname === '[::]' ||
    hostname.endsWith('.local');

  if (isLoopback) {
    throw new Error(
      `[Production Build Guard] VITE_API_URL cannot target localhost or loopback addresses in production builds ("${hostname}"). ` +
      'Please specify an authorized public HTTPS backend URL (e.g. https://govscheme-api.onrender.com).'
    );
  }

  return trimmed;
}

export function productionApiGuardPlugin(isProductionBuild: boolean, apiUrl?: string): Plugin {
  return {
    name: 'govscheme-production-api-guard',
    buildStart() {
      if (isProductionBuild) {
        validateProductionApiUrl(apiUrl);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL;
  const isProductionBuild = command === 'build' && mode === 'production';

  if (isProductionBuild) {
    validateProductionApiUrl(apiUrl);
  }

  return {
    plugins: [
      react(),
      productionApiGuardPlugin(isProductionBuild, apiUrl),
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, './src'),
      },
    },
    server: {
      host: true,
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            icons: ['lucide-react'],
            motion: ['framer-motion'],
            three: ['three', '@react-three/fiber', '@react-three/drei'],
            pdf: ['jspdf', 'html2canvas'],
          },
        },
      },
    },
  };
});
