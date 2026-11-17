# 📘 GUIA DE INSTALAÇÃO DO SEU APLICATIVO FITNESS
> **Parabéns pela aquisição!** Siga este passo a passo simples de 3 etapas para colocar seu aplicativo no ar em menos de 5 minutos.

---

## 📋 Resumo das 3 Etapas:
1. **Etapa 1:** Criar seu banco de dados gratuito no Supabase (2 minutos)
2. **Etapa 2:** Colocar o aplicativo no ar com 1 clique na Vercel (1 minuto)
3. **Etapa 3:** Primeiro acesso ao seu painel e personalização da sua marca (1 minuto)

---

## 🗄️ ETAPA 1: Criar seu Banco de Dados no Supabase

O Supabase é o servidor onde ficam salvos os seus alunos, treinos e planos com total segurança.

1. Acesse **[supabase.com](https://supabase.com)** e clique em **"Start your project"** (pode entrar com sua conta Google).
2. Clique no botão verde **"New Project"**.
3. Preencha:
   * **Name:** Nome do seu app (ex: `meu-app-fitness`)
   * **Database Password:** Crie uma senha segura e anote.
   * **Region:** Escolha `São Paulo (South America)` ou `East US`.
4. Clique em **"Create new project"** e aguarde cerca de 1 minuto até ele carregar.

### Criando as Tabelas e os 1.850 Exercícios:
1. No menu do lado esquerdo do Supabase, clique no ícone **SQL Editor** (`>_`).
2. Clique em **"New query"** (ou no botão `+`).
3. Abra o arquivo **`supabase_schema.sql`**, copie todo o texto dele, cole no editor e clique no botão verde **RUN**.
4. Em seguida, abra o arquivo **`supabase_exercises.sql`**, copie todo o texto dele, cole no editor e clique no botão verde **RUN**.
   *(Pronto! Todas as tabelas e o catálogo com mais de 1.850 exercícios e vídeos em alta definição já foram criados no seu banco).*

### Pegando suas 2 Chaves de Conexão:
1. No menu esquerdo do Supabase, clique no ícone de engrenagem **Project Settings** (na parte inferior).
2. Clique na aba **"API"**.
3. Deixe essa tela aberta, pois você vai copiar 2 campos daqui a pouco:
   * **Project URL:** Ex: `https://abcdefg.supabase.co`
   * **Project API Keys (anon / public):** Ex: `sb_publishable_...` ou `eyJhbG...`

---

## 🚀 ETAPA 2: Colocar o App no Ar na Vercel (1 Clique)

1. Clique no link oficial de instalação abaixo:
   👉 **[CLIQUE AQUI PARA INSTALAR NA VERCEL](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjowarte%2Ffit-app&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY&envDescription=Insira%20a%20URL%20e%20a%20Chave%20Anon%20do%20seu%20projeto%20no%20Supabase&envLink=https%3A%2F%2Fsupabase.com%2Fdashboard%2Fproject%2F_%2Fsettings%2Fapi&project-name=meu-treino-app&repository-name=meu-treino-app)**
2. Se você ainda não tiver conta na Vercel, clique em **"Continue with GitHub"** ou **"Continue with Google"**.
3. Na tela **"New Project"**, clique no botão preto **"Create"**.
4. A Vercel vai abrir a tela de configuração com **2 caixas de texto**:
   * **`VITE_SUPABASE_URL`**: Cole a **Project URL** que você copiou do Supabase.
   * **`VITE_SUPABASE_ANON_KEY`**: Cole a chave **anon / public** do Supabase.
5. Clique no botão preto **"Deploy"**.
6. Aguarde cerca de 45 segundos até a chuva de confetes aparecer na tela! 🎉
7. Clique na imagem de prévia do site ou no link `.vercel.app` para abrir o seu aplicativo!

---

## 🎨 ETAPA 3: Primeiro Acesso e Personalização da Sua Marca

1. Abra o seu aplicativo no navegador e clique em **Entrar / Login**:
   * **E-mail padrão:** `admin@admin.com`
   * **Senha padrão:** `admin123`
2. No topo da tela inicial, clique no botão azul **"Painel Admin"**.
3. Vá no menu **Configurações**:
   * 🔑 **Troque sua Senha:** Em *"Meus Dados de Acesso"*, altere seu e-mail e crie sua senha definitiva.
   * 🏷️ **Nome do App:** Digite o nome da sua academia ou do seu método.
   * 🖼️ **Logo:** Cole o link da sua logomarca (PNG transparente).
   * 🎨 **Cores da Marca:** Escolha a cor principal do seu app (Verde, Azul, Laranja, Roxo, etc.).
   * 🌄 **Imagem de Capa:** Escolha uma das fotos profissionais prontas ou coloque a sua foto de capa.
4. Vá no menu **Página de Vendas**:
   * Cole sua chave gratuita de IA (Google Gemini ou ChatGPT).
   * Escolha um dos modelos prontos ou digite seu comando.
   * Clique em **"Reformular Página de Vendas com IA"** para criar uma página de vendas única para o seu público!

---

## 🌐 BÔNUS: Como Colocar seu Domínio Próprio (ex: app.minhaacademia.com.br)

1. No painel da Vercel, clique no seu projeto e vá em **Settings ➔ Domains**.
2. Digite o seu domínio ou subdomínio (ex: `app.suaacademia.com.br`) e clique em **Add**.
3. A Vercel mostrará as entradas de DNS (geralmente um apontamento do tipo `CNAME` para `cname.vercel-dns.com`).
4. Adicione essa linha onde você comprou seu domínio (Registro.br, Hostinger, Cloudflare ou GoDaddy).
5. Em poucos minutos o certificado SSL (cadeado de segurança) é ativado automaticamente de graça!

---
*Dúvidas ou suporte? Entre em contato com a equipe que lhe vendeu a licença.*
