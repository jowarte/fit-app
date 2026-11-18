-- ==============================================================================
-- ESTRUTURA DO BANCO DE DADOS SUPABASE (TREINO APP)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELA: profiles (Perfis de Usuários vinculados ao Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  fitness_goal TEXT,
  experience_level TEXT,
  workout_location TEXT,
  status TEXT DEFAULT 'active',
  plan_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  access_home_override BOOLEAN DEFAULT NULL,
  access_gym_override BOOLEAN DEFAULT NULL,
  access_create_override BOOLEAN DEFAULT NULL,
  access_whatsapp_override BOOLEAN DEFAULT NULL,
  role TEXT DEFAULT 'user',
  wa_enabled BOOLEAN DEFAULT FALSE,
  wa_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TRIGGER: Criar perfil automaticamente no cadastro do Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_count INT;
  assigned_role TEXT := 'user';
BEGIN
  -- Se for o primeiro usuário do banco OU se o e-mail começar com admin@
  SELECT count(*) INTO profile_count FROM public.profiles;
  IF profile_count = 0 OR NEW.email ILIKE 'admin@%' THEN
    assigned_role := 'super_admin';
  END IF;

  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Administrador'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.profiles.name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. TABELA: plans (Planos de Assinatura)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT DEFAULT '0,00',
  cycle TEXT DEFAULT 'Mensal',
  checkout_url TEXT DEFAULT '',
  is_visible BOOLEAN DEFAULT TRUE,
  is_recommended BOOLEAN DEFAULT FALSE,
  is_trial BOOLEAN DEFAULT FALSE,
  trial_days INTEGER DEFAULT 7,
  features JSONB DEFAULT '[]'::jsonb,
  access_home BOOLEAN DEFAULT TRUE,
  access_gym BOOLEAN DEFAULT FALSE,
  access_create BOOLEAN DEFAULT FALSE,
  access_whatsapp BOOLEAN DEFAULT FALSE,
  access_advanced BOOLEAN DEFAULT FALSE,
  webhook_product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABELA: app_settings (Configurações Gerais do App e Webhooks)
-- 5. TABELA: app_settings (Configurações Gerais do App, Identidade Visual e Webhooks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id BIGINT PRIMARY KEY,
  app_name TEXT DEFAULT 'TreinoApp',
  app_logo_url TEXT DEFAULT '',
  app_cover_url TEXT DEFAULT '/hero-bg.png',
  primary_color TEXT DEFAULT '#00ff88',
  seo_title TEXT DEFAULT 'TreinoApp - Seu Treino Em Qualquer Lugar',
  seo_description TEXT DEFAULT 'Plataforma completa de treinos com mais de 1.800 exercícios em vídeo e GIF, fichas personalizadas e resultados rápidos.',
  ai_provider TEXT DEFAULT 'gemini',
  ai_api_key TEXT DEFAULT '',
  ai_prompt TEXT DEFAULT '',
  sales_badge TEXT DEFAULT 'O APP MAIS COMPLETO DO BRASIL',
  sales_headline TEXT DEFAULT 'Transforme seu corpo com o método definitivo de treino.',
  sales_subheadline TEXT DEFAULT 'Pare de pular treinos. Tenha acesso a vídeos realistas de alta qualidade, crie rotinas personalizadas e mantenha o foco inabalável.',
  sales_cta_text TEXT DEFAULT 'Ver Planos',
  sales_benefits JSONB DEFAULT '[]'::jsonb,
  n8n_webhook_url TEXT,
  n8n_webhook_name TEXT DEFAULT 'Integração 1 (n8n, Make, etc)',
  bot_vende_webhook_url TEXT,
  bot_vende_webhook_name TEXT DEFAULT 'Integração 2 (Bot Vende, etc)',
  evolution_url TEXT,
  evolution_key TEXT,
  evolution_instance TEXT,
  evolution_api_url TEXT,
  evolution_api_key TEXT,
  whatsapp_bot_number TEXT,
  whatsapp_activation_message TEXT DEFAULT 'Olá! Sou aluno e quero ativar meus lembretes de treino neste número.',
  fb_pixel TEXT
  fb_pixel TEXT,
  sales_page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que todas as colunas novas existam caso a tabela já tenha sido criada antes
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'TreinoApp';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_logo_url TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_cover_url TEXT DEFAULT '/hero-bg.png';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#00ff88';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'TreinoApp - Seu Treino Em Qualquer Lugar';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Plataforma completa de treinos com mais de 1.800 exercícios em vídeo e GIF, fichas personalizadas e resultados rápidos.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'gemini';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS ai_api_key TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS ai_prompt TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_badge TEXT DEFAULT 'O APP MAIS COMPLETO DO BRASIL';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_headline TEXT DEFAULT 'Transforme seu corpo com o método definitivo de treino.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_subheadline TEXT DEFAULT 'Pare de pular treinos. Tenha acesso a vídeos realistas de alta qualidade, crie rotinas personalizadas e mantenha o foco inabalável.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_cta_text TEXT DEFAULT 'Ver Planos';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_benefits JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS fb_pixel TEXT;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS sales_page_url TEXT;

-- ==============================================================================
-- 6. TABELA: exercises (Banco Global de Exercícios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  media_url TEXT,
  media_type TEXT DEFAULT 'local_video',
  muscle_group TEXT DEFAULT 'Geral',
  target_gender TEXT DEFAULT 'Ambos',
  is_premium BOOLEAN DEFAULT FALSE,
  release_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhorar a performance de busca
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_name ON public.exercises(name);

-- ==============================================================================
-- 7. TABELA: user_exercises (Exercícios personalizados e Catálogo de Séries)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_exercises_user_id ON public.user_exercises(user_id);

-- ==============================================================================
-- 8. TABELA: routines (Treinos Criados / Fichas do Aluno)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_of_week TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABELA: routine_exercises (Exercícios vinculados a cada Ficha)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  name TEXT,
  order_index INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 1,
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '10',
  rest_time INTEGER DEFAULT 60,
  weight NUMERIC DEFAULT 0,
  weight_unit TEXT DEFAULT 'kg',
  notes TEXT,
  target_muscle TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que todas as colunas existam caso a tabela já tenha sido criada antes
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1;
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 1;
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS rest_time INTEGER DEFAULT 60;
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 0;
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg';
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS target_muscle TEXT;
ALTER TABLE public.routine_exercises ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- ==============================================================================
-- 10. TABELA: user_workouts (Sessões de Treino Executadas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  volume_kg NUMERIC DEFAULT 0,
  prs_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. TABELA: workout_exercises (Exercícios realizados dentro de uma Sessão)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.user_workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.user_exercises(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. TABELA: user_sets (Séries, Cargas e Repetições registradas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  weight NUMERIC DEFAULT 0,
  reps INTEGER DEFAULT 0,
  rir INTEGER DEFAULT 0,
  e1rm NUMERIC DEFAULT 0,
  is_pr BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. TABELA: whatsapp_reminders (Lembretes Automáticos de Treino)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 14. POLÍTICAS DE ACESSO (Row Level Security - RLS)
-- ==============================================================================
-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para PROFILES
CREATE POLICY "Permitir leitura de perfis para usuários autenticados" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir que usuários atualizem seu próprio perfil ou admins atualizem qualquer um" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Permitir inserção de perfis" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir exclusão de perfis por admin" ON public.profiles FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Políticas para PLANS (Público para leitura, admin para modificação)
CREATE POLICY "Qualquer um pode ver planos" ON public.plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Apenas admin pode modificar planos" ON public.plans FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Políticas para APP_SETTINGS (Leitura livre, admin para modificação)
CREATE POLICY "Qualquer um pode ver app_settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Apenas admin pode modificar app_settings" ON public.app_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Políticas para EXERCISES (Leitura livre, admin para modificação)
CREATE POLICY "Qualquer um pode ler exercicios" ON public.exercises FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Apenas admin pode inserir/modificar exercicios" ON public.exercises FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Políticas para USER_EXERCISES
CREATE POLICY "Ler exercícios globais ou próprios" ON public.user_exercises FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Gerenciar próprios exercícios" ON public.user_exercises FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Políticas para ROUTINES & ROUTINE_EXERCISES
CREATE POLICY "Gerenciar próprias rotinas" ON public.routines FOR ALL TO authenticated USING (user_id IS NULL OR user_id = auth.uid()) WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Gerenciar exercícios da rotina" ON public.routine_exercises FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para WORKOUTS, WORKOUT_EXERCISES & SETS
CREATE POLICY "Gerenciar próprios treinos" ON public.user_workouts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Gerenciar exercícios do treino" ON public.workout_exercises FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Gerenciar séries do treino" ON public.user_sets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para WHATSAPP_REMINDERS
CREATE POLICY "Gerenciar lembretes whatsapp" ON public.whatsapp_reminders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 15. DADOS INICIAIS (SEEDS)
-- ==============================================================================

-- Inserir Configurações Padrão
INSERT INTO public.app_settings (id, n8n_webhook_url, n8n_webhook_name, bot_vende_webhook_url, bot_vende_webhook_name, evolution_instance, evolution_api_url, evolution_api_key, whatsapp_bot_number, whatsapp_activation_message)
VALUES (1, 'https://noeflow.com/api/webhooks/ext/webhook-cxgz1', NULL, 'https://noeflow.com/api/webhooks/ext/webhook-gvhdv', NULL, 'cmprvbh0-no-1', 'https://api.noeflow.com', 'Jow123456', '556993681011', 'Sou aluno e quero ativar meus lembretes de treino neste número.')
ON CONFLICT (id) DO NOTHING;

-- Inserir Planos Padrão
INSERT INTO public.plans (id, name, price, cycle, checkout_url, is_visible, is_recommended, is_trial, trial_days, features, access_home, access_gym, access_create, access_whatsapp, access_advanced, webhook_product_id)
VALUES ('1786146397702', 'Standard', '19,90', 'Mensal', 'https://pay.cakto.com.br/spv85bp', TRUE, TRUE, FALSE, 7, '["Acesso ao Treino em Casa","Criar Treinos Personalizados"]'::jsonb, TRUE, FALSE, TRUE, FALSE, TRUE, NULL)
INSERT INTO public.app_settings (
  id, 
  app_name, 
  app_logo_url, 
  app_cover_url, 
  primary_color, 
  seo_title, 
  seo_description, 
  sales_badge, 
  sales_headline, 
  sales_subheadline, 
  sales_cta_text, 
  sales_benefits,
  whatsapp_bot_number, 
  whatsapp_activation_message
)
VALUES (
  1, 
  'TreinoApp', 
  '', 
  '/hero-bg.png', 
  '#00ff88', 
  'TreinoApp - Seu Treino Em Qualquer Lugar', 
  'Plataforma completa de treinos com mais de 1.800 exercícios em vídeo e GIF, fichas personalizadas e resultados rápidos.', 
  'O APP MAIS COMPLETO DO BRASIL', 
  'Transforme seu corpo com o método definitivo de treino.', 
  'Pare de pular treinos. Tenha acesso a vídeos realistas de alta qualidade, crie rotinas personalizadas e mantenha o foco inabalável.', 
  'Ver Planos', 
  '[{"title":"Vídeos de Alta Definição","desc":"Mais de 1.800 exercícios com execuções perfeitas gravadas em detalhes para nunca mais errar o movimento."},{"title":"Treine Onde Quiser","desc":"Fichas completas tanto para academia quanto para casa usando apenas o peso do seu corpo."},{"title":"Compartilhe no WhatsApp","desc":"Envie suas rotinas e vídeos de treino para você mesmo ou amigos no WhatsApp com apenas 1 clique."},{"title":"Acompanhamento Semanal","desc":"Registre cada treino concluído e acompanhe sua evolução semana a semana."}]'::jsonb,
  '5511999999999', 
  'Olá! Sou aluno e quero tirar dúvidas sobre os treinos.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  cycle = EXCLUDED.cycle,
  checkout_url = EXCLUDED.checkout_url,
  is_visible = EXCLUDED.is_visible,
  is_recommended = EXCLUDED.is_recommended,
  is_trial = EXCLUDED.is_trial,
  trial_days = EXCLUDED.trial_days,
  features = EXCLUDED.features,
  access_home = EXCLUDED.access_home,
  access_gym = EXCLUDED.access_gym,
  access_create = EXCLUDED.access_create,
  access_whatsapp = EXCLUDED.access_whatsapp,
  access_advanced = EXCLUDED.access_advanced;
  app_name = COALESCE(public.app_settings.app_name, EXCLUDED.app_name),
  sales_badge = COALESCE(public.app_settings.sales_badge, EXCLUDED.sales_badge),
  sales_headline = COALESCE(public.app_settings.sales_headline, EXCLUDED.sales_headline),
  sales_subheadline = COALESCE(public.app_settings.sales_subheadline, EXCLUDED.sales_subheadline),
  sales_cta_text = COALESCE(public.app_settings.sales_cta_text, EXCLUDED.sales_cta_text);

-- Inserir Planos Padrão Prontos para Venda
INSERT INTO public.plans (id, name, price, cycle, checkout_url, is_visible, is_recommended, is_trial, trial_days, features, access_home, access_gym, access_create, access_whatsapp, access_advanced, webhook_product_id)
VALUES ('1786041274307', 'Free', '', 'Único (Teste)', '', FALSE, FALSE, TRUE, 365, '[]'::jsonb, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
VALUES ('plan_free', 'Free (Iniciante)', '0,00', 'Mensal', '', TRUE, FALSE, FALSE, 7, '["Acesso ao Treino em Casa","Diário de Treino Básico"]'::jsonb, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  cycle = EXCLUDED.cycle,
  checkout_url = EXCLUDED.checkout_url,
  is_visible = EXCLUDED.is_visible,
  is_recommended = EXCLUDED.is_recommended,
  is_trial = EXCLUDED.is_trial,
  trial_days = EXCLUDED.trial_days,
  features = EXCLUDED.features,
  access_home = EXCLUDED.access_home,
  access_gym = EXCLUDED.access_gym,
  access_create = EXCLUDED.access_create,
  access_whatsapp = EXCLUDED.access_whatsapp,
  access_advanced = EXCLUDED.access_advanced;
  is_visible = EXCLUDED.is_visible;

INSERT INTO public.plans (id, name, price, cycle, checkout_url, is_visible, is_recommended, is_trial, trial_days, features, access_home, access_gym, access_create, access_whatsapp, access_advanced, webhook_product_id)
VALUES ('1', 'Plano Pró / Anual', '149,90', 'Anual', 'https://pay.cakto.com.br/35ry768_1024322', FALSE, TRUE, FALSE, 7, '["Diário de Treino Básico"]'::jsonb, TRUE, TRUE, TRUE, TRUE, TRUE, NULL)
VALUES ('plan_pro', 'PRO (Recomendado)', '29,90', 'Mensal', '', TRUE, TRUE, FALSE, 7, '["Acesso Total (Casa e Academia)","Criação ilimitada de treinos","Compartilhar no WhatsApp","Gráficos de Evolução","Acesso ao Treino Avançado"]'::jsonb, TRUE, TRUE, TRUE, TRUE, TRUE, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  cycle = EXCLUDED.cycle,
  checkout_url = EXCLUDED.checkout_url,
  is_visible = EXCLUDED.is_visible,
  is_recommended = EXCLUDED.is_recommended,
  is_trial = EXCLUDED.is_trial,
  trial_days = EXCLUDED.trial_days,
  features = EXCLUDED.features,
  access_home = EXCLUDED.access_home,
  access_gym = EXCLUDED.access_gym,
  access_create = EXCLUDED.access_create,
  access_whatsapp = EXCLUDED.access_whatsapp,
  access_advanced = EXCLUDED.access_advanced;
  is_visible = EXCLUDED.is_visible;

INSERT INTO public.plans (id, name, price, cycle, checkout_url, is_visible, is_recommended, is_trial, trial_days, features, access_home, access_gym, access_create, access_whatsapp, access_advanced, webhook_product_id)
VALUES ('1786146223618', 'Master', '49,90', 'Trimestral', 'https://pay.cakto.com.br/33xoqin', TRUE, FALSE, FALSE, 7, '[]'::jsonb, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  cycle = EXCLUDED.cycle,
  checkout_url = EXCLUDED.checkout_url,
  is_visible = EXCLUDED.is_visible,
  is_recommended = EXCLUDED.is_recommended,
  is_trial = EXCLUDED.is_trial,
  trial_days = EXCLUDED.trial_days,
  features = EXCLUDED.features,
  access_home = EXCLUDED.access_home,
  access_gym = EXCLUDED.access_gym,
  access_create = EXCLUDED.access_create,
  access_whatsapp = EXCLUDED.access_whatsapp,
  access_advanced = EXCLUDED.access_advanced;

-- Inserir Exercícios do Catálogo Global (user_exercises com user_id nulo)
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('59c527cc-fcf5-43e9-8157-cd02fe215198', NULL, 'Supino Reto', 'Peito', 'Barra')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('ab962b1d-69d3-4fab-abff-90202524e74d', NULL, 'Supino Inclinado', 'Peito', 'Halter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('79c3bd55-3fcf-466e-b8a7-f59e64c52ee9', NULL, 'Puxada Frontal', 'Costas', 'Máquina')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('d15c97e4-421a-40b1-b7be-f3d8cbe430fd', NULL, 'Remada Curvada', 'Costas', 'Barra')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('05147798-4abe-4541-94f0-19eb336550a6', NULL, 'Desenvolvimento', 'Ombros', 'Halter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('3eb9ef49-2bc0-4625-acd2-3ad993d40c47', NULL, 'Elevação Lateral', 'Ombros', 'Halter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('95de7c9e-2f05-4720-a9ad-d70510c346d7', NULL, 'Agachamento Livre', 'Quadríceps', 'Barra')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('1e291f24-b27d-4fda-b716-de39326aab42', NULL, 'Leg Press 45', 'Quadríceps', 'Máquina')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('17721523-8d1e-446b-8087-8ab8823a985a', NULL, 'Cadeira Extensora', 'Quadríceps', 'Máquina')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('a186f697-20b6-4194-b4de-54326baa08e2', NULL, 'Mesa Flexora', 'Posterior', 'Máquina')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('582ef228-f476-41dc-ab96-d048e1df2f24', NULL, 'Elevação Pélvica', 'Glúteo', 'Barra')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('4b5e4eac-3c9e-44d0-b8a6-c42d1cd18c2c', NULL, 'Panturrilha em pé', 'Panturrilha', 'Máquina')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('0ce258f3-3027-45c0-843f-16fbcb31f8d3', NULL, 'Rosca Direta', 'Bíceps', 'Barra')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('67b9723d-532e-4c35-b41b-9482582a282e', NULL, 'Tríceps Corda', 'Tríceps', 'Cabo')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_exercises (id, user_id, name, muscle_group, equipment)
VALUES ('a40804b3-7e0e-4b06-bed1-e69359ad1ca4', NULL, 'Abdominal Supra', 'Abdômen', 'Livre')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 10. SUPER ADMINISTRADOR PADRÃO (SETUP INICIAL)
-- Credenciais padrão:
--   E-mail: admin@admin.com
--   Senha:  admin123
-- Após entrar no painel (/admin -> Configurações), você poderá alterar o e-mail e a senha!
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  superadmin_id UUID := 'a0000000-0000-0000-0000-000000000001'::uuid;
  admin_email TEXT := 'admin@admin.com';
  admin_password TEXT := 'admin123';
  target_user_id UUID;
BEGIN
  -- 1. Verifica se já existe um usuário com esse email no auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;

  IF target_user_id IS NULL THEN
    -- Insere o usuário padrão no auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      superadmin_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Super Administrador"}'::jsonb,
      NOW(),
      NOW(),
      ''
    );
    target_user_id := superadmin_id;
  ELSE
    -- Se já existe, atualiza a senha para a padrão e garante email confirmado
    UPDATE auth.users
    SET 
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = target_user_id;
  END IF;

  -- 2. Garante que o perfil em public.profiles tem nível 'super_admin' e está 'active'
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (
    target_user_id,
    admin_email,
    'Super Administrador',
    'super_admin',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = 'super_admin',
    status = 'active';

END $$;


-- ==============================================================================
-- 13. TABELA: system_updates (Central de Atualizações de Versões do App)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.system_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  changelog JSONB DEFAULT '[]'::jsonb,
  download_url TEXT DEFAULT 'https://github.com/jowarte/fit-app',
  release_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_updates' AND policyname = 'system_updates_select_all'
  ) THEN
    CREATE POLICY "system_updates_select_all" ON public.system_updates FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_updates' AND policyname = 'system_updates_manage_superadmin'
  ) THEN
    CREATE POLICY "system_updates_manage_superadmin" ON public.system_updates FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
  END IF;
END $$;

-- Inserir versão inicial caso a tabela esteja vazia
INSERT INTO public.system_updates (version, title, description, changelog, download_url)
SELECT 
  '1.2.0',
  'Alarme Sonoro no Cronômetro, Otimização Mobile e Estabilidade Total',
  'Versão com apito de academia no descanso, melhorias visuais e banco de dados otimizado.',
  '["Alarme sonoro com apito e vibração ao zerar o cronômetro de descanso", "Botão de silenciar ou ativar alarme no timer", "Correção de botões ocultos em celulares e telas pequenas", "Salvamento de treinos 100% sem conflitos de banco", "Carregamento fluído de todos os exercícios em vídeo e GIF"]'::jsonb,
  'https://github.com/jowarte/fit-app'
WHERE NOT EXISTS (SELECT 1 FROM public.system_updates LIMIT 1);
