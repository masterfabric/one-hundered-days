-- =============================================
-- FinderDev - Örnek Veriler
-- =============================================
-- NOT: Bu SQL'i çalıştırmadan önce auth.users tablosunda
-- kullanıcıların oluşturulmuş olması gerekir (Supabase Auth ile).
-- Aşağıdaki UUID'ler örnek amaçlıdır.

-- =============================================
-- 1. PROFILES (Kullanıcı Profilleri)
-- =============================================

INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, website_url, github_url)
VALUES 
  ('a1b2c3d4-1111-1111-1111-111111111111', 'efeikan', 'Efe İkan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=efe', 'Full Stack Developer | React & Node.js Uzmanı', 'https://efeikan.dev', 'https://github.com/efeikan'),
  
  ('a1b2c3d4-2222-2222-2222-222222222222', 'elifdemir', 'Elif Demir', 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif', 'Frontend Developer | UI/UX Designer', 'https://elifdemir.com', 'https://github.com/elifdemir'),
  
  ('a1b2c3d4-3333-3333-3333-333333333333', 'mehmetkaya', 'Mehmet Kaya', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet', 'Backend Developer | Python & Django Expert', NULL, 'https://github.com/mehmetkaya'),
  
  ('a1b2c3d4-4444-4444-4444-444444444444', 'zeyneparslan', 'Zeynep Arslan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep', 'Mobile Developer | Flutter & React Native', 'https://zeyneparslan.io', 'https://github.com/zeyneparslan'),
  
  ('a1b2c3d4-5555-5555-5555-555555555555', 'ahmetyilmaz', 'Ahmet Yılmaz', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet', 'DevOps Engineer | AWS & Kubernetes', NULL, 'https://github.com/ahmetyilmaz');

-- =============================================
-- 2. TECHNOLOGIES (Teknolojiler)
-- =============================================

INSERT INTO public.technologies (name, category)
VALUES 
  ('React', 'frontend'),
  ('Vue.js', 'frontend'),
  ('Next.js', 'frontend'),
  ('Node.js', 'backend'),
  ('Python', 'backend'),
  ('Django', 'backend'),
  ('PostgreSQL', 'database'),
  ('MongoDB', 'database'),
  ('TypeScript', 'language'),
  ('Flutter', 'mobile'),
  ('React Native', 'mobile'),
  ('Docker', 'devops'),
  ('Kubernetes', 'devops'),
  ('AWS', 'cloud'),
  ('Firebase', 'cloud');

-- =============================================
-- 3. PROJECTS (Projeler)
-- =============================================

INSERT INTO public.projects (id, owner_id, title, description, status, repo_url, demo_url)
VALUES 
  ('p1111111-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', 'E-Commerce Platform', 'Modern ve ölçeklenebilir e-ticaret çözümü. React, Node.js ve PostgreSQL ile geliştirildi.', 'in_progress', 'https://github.com/efeikan/ecommerce', 'https://ecommerce-demo.vercel.app'),
  
  ('p2222222-2222-2222-2222-222222222222', 'a1b2c3d4-2222-2222-2222-222222222222', 'AI Chat Assistant', 'Yapay zeka destekli müşteri hizmetleri chatbot. GPT-4 entegrasyonu ile.', 'idea', 'https://github.com/elifdemir/ai-chat', NULL),
  
  ('p3333333-3333-3333-3333-333333333333', 'a1b2c3d4-3333-3333-3333-333333333333', 'Mobile Fitness App', 'Kişiselleştirilmiş antrenman ve beslenme takip uygulaması.', 'in_progress', 'https://github.com/mehmetkaya/fitness-app', 'https://fitness-app.com'),
  
  ('p4444444-4444-4444-4444-444444444444', 'a1b2c3d4-4444-4444-4444-444444444444', 'Blockchain Wallet', 'Güvenli ve kullanıcı dostu kripto cüzdan uygulaması.', 'completed', 'https://github.com/zeyneparslan/crypto-wallet', 'https://wallet-demo.io'),
  
  ('p5555555-5555-5555-5555-555555555555', 'a1b2c3d4-5555-5555-5555-555555555555', 'DevOps Dashboard', 'Kubernetes cluster yönetimi ve monitoring paneli.', 'in_progress', 'https://github.com/ahmetyilmaz/devops-dash', NULL);

-- =============================================
-- 4. PROJECT_TECHNOLOGIES (Proje-Teknoloji İlişkisi)
-- =============================================

-- E-Commerce Platform - React, Node.js, PostgreSQL, TypeScript
INSERT INTO public.project_technologies (project_id, technology_id)
SELECT 'p1111111-1111-1111-1111-111111111111', id FROM public.technologies WHERE name IN ('React', 'Node.js', 'PostgreSQL', 'TypeScript');

-- AI Chat Assistant - Python, Django, PostgreSQL
INSERT INTO public.project_technologies (project_id, technology_id)
SELECT 'p2222222-2222-2222-2222-222222222222', id FROM public.technologies WHERE name IN ('Python', 'Django', 'PostgreSQL');

-- Mobile Fitness App - React Native, Firebase, TypeScript
INSERT INTO public.project_technologies (project_id, technology_id)
SELECT 'p3333333-3333-3333-3333-333333333333', id FROM public.technologies WHERE name IN ('React Native', 'Firebase', 'TypeScript');

-- Blockchain Wallet - Next.js, Node.js, MongoDB
INSERT INTO public.project_technologies (project_id, technology_id)
SELECT 'p4444444-4444-4444-4444-444444444444', id FROM public.technologies WHERE name IN ('Next.js', 'Node.js', 'MongoDB');

-- DevOps Dashboard - React, Python, Docker, Kubernetes, AWS
INSERT INTO public.project_technologies (project_id, technology_id)
SELECT 'p5555555-5555-5555-5555-555555555555', id FROM public.technologies WHERE name IN ('React', 'Python', 'Docker', 'Kubernetes', 'AWS');

-- =============================================
-- 5. PROJECT_MEMBERS (Proje Üyeleri)
-- =============================================

INSERT INTO public.project_members (project_id, user_id, role_title, status)
VALUES 
  -- E-Commerce'de Elif frontend'ci olarak
  ('p1111111-1111-1111-1111-111111111111', 'a1b2c3d4-2222-2222-2222-222222222222', 'Frontend Developer', 'accepted'),
  -- E-Commerce'de Mehmet backend'ci olarak
  ('p1111111-1111-1111-1111-111111111111', 'a1b2c3d4-3333-3333-3333-333333333333', 'Backend Developer', 'accepted'),
  
  -- AI Chat'de Efe yardımcı olarak
  ('p2222222-2222-2222-2222-222222222222', 'a1b2c3d4-1111-1111-1111-111111111111', 'Technical Advisor', 'pending'),
  
  -- Fitness App'de Zeynep mobile developer
  ('p3333333-3333-3333-3333-333333333333', 'a1b2c3d4-4444-4444-4444-444444444444', 'Mobile Developer', 'accepted'),
  
  -- DevOps Dashboard'da Efe full-stack olarak
  ('p5555555-5555-5555-5555-555555555555', 'a1b2c3d4-1111-1111-1111-111111111111', 'Full Stack Developer', 'accepted');

-- =============================================
-- 6. CONVERSATIONS (Sohbetler)
-- =============================================

INSERT INTO public.conversations (id, is_group, project_id)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', false, NULL),  -- Efe ve Elif arasında özel sohbet
  ('c2222222-2222-2222-2222-222222222222', true, 'p1111111-1111-1111-1111-111111111111');  -- E-Commerce proje grubu

-- =============================================
-- 7. CONVERSATION_PARTICIPANTS (Sohbet Katılımcıları)
-- =============================================

INSERT INTO public.conversation_participants (conversation_id, user_id)
VALUES 
  -- Özel sohbet: Efe ve Elif
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111'),
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-2222-2222-2222-222222222222'),
  
  -- E-Commerce grup sohbeti: Efe, Elif, Mehmet
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-1111-1111-1111-111111111111'),
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-2222-2222-2222-222222222222'),
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-3333-3333-3333-333333333333');

-- =============================================
-- 8. MESSAGES (Mesajlar)
-- =============================================

INSERT INTO public.messages (conversation_id, sender_id, content, is_read)
VALUES 
  -- Özel sohbet mesajları
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', 'Merhaba Elif, E-commerce projesinde frontend için sana ihtiyacımız var!', true),
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-2222-2222-2222-222222222222', 'Merhaba Efe! Çok ilginç görünüyor, detayları paylaşabilir misin?', true),
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', 'Tabii, React ve TypeScript kullanacağız. Tailwind ile styling yapılacak.', false),
  
  -- Grup sohbet mesajları
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-1111-1111-1111-111111111111', 'Ekip olarak bu hafta sprint planning yapalım mı?', true),
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-3333-3333-3333-333333333333', 'Backend API''leri hazır, frontend entegrasyonuna geçebiliriz.', true),
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-2222-2222-2222-222222222222', 'Harika! Ben de component library''yi tamamladım 🎉', false);
