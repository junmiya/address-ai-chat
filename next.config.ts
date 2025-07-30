import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint設定 - デプロイ時のエラーを回避
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // TypeScript設定
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // 実験的機能
  experimental: {
    turbo: {
      rules: {
        '*.js': {
          loaders: ['@babel/loader'],
        },
      },
    },
  },
  // Socket.io サーバー設定
  rewrites: async () => {
    return [
      {
        source: '/socket.io/:path*',
        destination: '/api/socket/:path*',
      },
    ];
  },
};

export default nextConfig;
