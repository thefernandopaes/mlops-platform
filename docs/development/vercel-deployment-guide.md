# Guia de Deployment no Vercel - MLOps Platform

## 🚨 **Resolução de Problemas de Deployment**

### **Problema Identificado**
O erro "All checks have failed" no Vercel geralmente indica problemas de configuração ou build. Este guia resolve os problemas mais comuns.

## 🔧 **Configurações Criadas**

### **1. Arquivo `vercel.json` (Raiz do Projeto)**
```json
{
  "version": 2,
  "name": "mlops-platform",
  "framework": "nextjs",
  "rootDirectory": "frontend"
}
```

### **2. Arquivo `frontend/vercel.json`**
Configuração específica do frontend com otimizações.

### **3. Arquivo `.vercelignore`**
Exclui arquivos desnecessários do deployment para otimizar o processo.

## 🚀 **Passos para Resolver o Erro**

### **Passo 1: Configurar Variáveis de Ambiente no Vercel**

1. Acesse o dashboard do Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione as seguintes variáveis:

```bash
# Variável obrigatória
NEXT_PUBLIC_API_URL=https://sua-api-backend.com

# Variáveis opcionais (se necessário)
NODE_ENV=production
```

### **Passo 2: Configurar o Projeto no Vercel**

1. **Framework Preset**: Next.js
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. **Install Command**: `npm install`

### **Passo 3: Verificar Configurações de Build**

No dashboard do Vercel, em **Settings** > **General**:

```bash
# Build & Development Settings
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

## 🐛 **Problemas Comuns e Soluções**

### **Erro: "Module not found"**
```bash
# Solução: Verificar imports relativos
# ❌ Errado
import { Component } from '../../../components/Component'

# ✅ Correto
import { Component } from '@/components/Component'
```

### **Erro: "Build failed"**
```bash
# Solução: Verificar TypeScript
npm run type-check

# Se houver erros, corrija antes do deployment
```

### **Erro: "API routes not working"**
```bash
# Solução: Configurar variável de ambiente
NEXT_PUBLIC_API_URL=https://sua-api-backend.herokuapp.com
```

### **Erro: "Function timeout"**
```bash
# Solução: Já configurado no vercel.json
"functions": {
  "src/app/**/*.tsx": {
    "maxDuration": 30
  }
}
```

## 📋 **Checklist de Deployment**

### **Antes do Deployment:**
- [ ] ✅ Todos os arquivos de configuração criados
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Build local funcionando (`npm run build`)
- [ ] ✅ TypeScript sem erros (`npm run type-check`)
- [ ] ✅ Linting sem erros (`npm run lint`)

### **Configuração no Vercel:**
- [ ] ✅ Root Directory: `frontend`
- [ ] ✅ Framework: Next.js
- [ ] ✅ Variáveis de ambiente adicionadas
- [ ] ✅ Build command: `npm run build`

## 🔄 **Processo de Re-deployment**

### **Opção 1: Trigger Manual**
1. Vá para o dashboard do Vercel
2. Clique em **Deployments**
3. Clique nos três pontos do último deployment
4. Selecione **Redeploy**

### **Opção 2: Push para Git**
```bash
# Faça um commit vazio para trigger o deployment
git commit --allow-empty -m "trigger vercel deployment"
git push origin main
```

### **Opção 3: Via CLI do Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

## 🎯 **Configuração Recomendada para Produção**

### **1. Backend Separado**
O frontend deve apontar para uma API backend hospedada separadamente:
- Heroku
- Railway
- DigitalOcean
- AWS

### **2. Variáveis de Ambiente**
```bash
# Produção
NEXT_PUBLIC_API_URL=https://api.mlops-platform.com

# Staging
NEXT_PUBLIC_API_URL=https://api-staging.mlops-platform.com
```

### **3. Domínio Customizado**
Configure um domínio customizado no Vercel para produção.

## 🚨 **Troubleshooting Avançado**

### **Se o erro persistir:**

1. **Limpar cache do Vercel:**
   - Vá em Settings > General
   - Clique em "Clear Build Cache"

2. **Verificar logs detalhados:**
   - Vá em Deployments
   - Clique no deployment falhado
   - Analise os logs de build

3. **Testar build local:**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

4. **Verificar dependências:**
   ```bash
   npm audit
   npm update
   ```

## 📞 **Suporte**

Se o problema persistir após seguir este guia:

1. Verifique os logs detalhados no Vercel
2. Teste o build localmente
3. Verifique se todas as dependências estão atualizadas
4. Considere usar uma configuração mais simples inicialmente

## ✅ **Status Esperado**

Após aplicar essas configurações, o deployment deve:
- ✅ Build com sucesso
- ✅ Deploy sem erros
- ✅ Aplicação acessível via URL do Vercel
- ✅ Funcionalidades básicas operando

**Nota**: Lembre-se de que o backend precisa estar hospedado separadamente e a variável `NEXT_PUBLIC_API_URL` deve apontar para ele.