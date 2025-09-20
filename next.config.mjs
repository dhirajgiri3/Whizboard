import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dotenv is preloaded for all Node server runtimes
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable Fast Refresh (HMR)
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      // Exclude Konva and react-konva from server-side bundling
      config.externals = [...config.externals, 'konva', 'react-konva', 'canvas'];
    }

    // Add fallback for canvas module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };

    // Enable React Refresh for development
    if (dev) {
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      };
    }

    // Optimize chunk splitting for better performance
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate chunk for heavy UI libraries
            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Separate chunk for canvas libraries
            konva: {
              name: 'konva',
              test: /[\\/]node_modules[\\/](konva|react-konva)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Separate chunk for Apollo/GraphQL
            apollo: {
              name: 'apollo',
              test: /[\\/]node_modules[\\/](@apollo|graphql)[\\/]/,
              chunks: 'all',
              priority: 25,
            },
            // Icons library
            icons: {
              name: 'icons',
              test: /[\\/]node_modules[\\/](lucide-react|react-icons)[\\/]/,
              chunks: 'all',
              priority: 20,
            },
            // Default vendor chunk
            vendor: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig; 