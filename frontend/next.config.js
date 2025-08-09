/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração para produção no Vercel
  trailingSlash: false,
  
  // Otimizações para build
  experimental: {
    optimizeCss: true,
  },
  
  // Configuração de rewrites apenas para desenvolvimento local
  async rewrites() {
    // Só aplica rewrites em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
      ];
    }
    return [];
  },
  
  // Variáveis de ambiente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // Configuração de imagens (se necessário)
  images: {
    domains: ['localhost'],
    unoptimized: true, // Para evitar problemas no Vercel com imagens
  },
  
  // Configuração de headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // CSP básica; ajuste domínios conforme necessário
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '; frame-ancestors \"self\";' },
        ],
      },
    ];
  },
  // Configuração de output para Vercel
  output: 'standalone',
};

module.exports = nextConfig;