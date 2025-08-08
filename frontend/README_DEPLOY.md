# Frontend Deploy

## Variáveis de ambiente

- NEXT_PUBLIC_API_URL: URL base do backend (ex.: `https://api.exemplo.com`)

## Vercel

- Configure a env `NEXT_PUBLIC_API_URL` no projeto Vercel
- O arquivo `vercel.json` já define build/install. Garanta que a env está setada em Production/Preview/Development conforme necessário.

## Desenvolvimento local

- `NEXT_PUBLIC_API_URL=http://localhost:8000`
- `npm run dev`


