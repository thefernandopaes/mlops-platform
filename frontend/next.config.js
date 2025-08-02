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
  
  // Configuração de output para Vercel
  output: 'standalone',
};

module.exports = nextConfig;