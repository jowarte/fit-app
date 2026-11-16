-- ==============================================================================
-- CRIAR OU RESETAR SUPER ADMINISTRADOR PADRÃO
-- Como usar:
-- 1. Abra o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral, clique em "SQL Editor" -> "New Query"
-- 3. Cole todo este código e clique no botão verde "Run"
--
-- Dados de acesso padrão criados:
--   E-mail: admin@admin.com
--   Senha:  admin123
--
-- DICA: Após fazer login no painel (/admin), acesse a aba "Configurações"
-- para alterar o e-mail e a senha para as suas credenciais definitivas!
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
    -- Inserir novo usuário no Supabase Auth
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
    -- Se já existe, redefine a senha para admin123 e confirma o e-mail
    UPDATE auth.users
    SET 
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = target_user_id;
  END IF;

  -- 2. Garante perfil em public.profiles como super_admin ativo
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
