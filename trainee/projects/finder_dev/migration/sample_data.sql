-- =============================================
-- FinderDev - Sample Data
-- =============================================
-- NOTE: Before running this SQL, users must be created
-- in the auth.users table (via Supabase Auth).
-- The UUIDs below are for example purposes.

-- =============================================
-- 1. PROFILES (User Profiles)
-- =============================================

INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, website_url, github_url)
VALUES 
  ('a1b2c3d4-1111-1111-1111-111111111111', 'efeikan', 'Efe Ikan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=efe', 'Full Stack Developer | React & Node.js Expert', 'https://efeikan.dev', 'https://github.com/efeikan'),
  
  ('a1b2c3d4-2222-2222-2222-222222222222', 'elifdemir', 'Elif Demir', 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif', 'Frontend Developer | UI/UX Designer', 'https://elifdemir.com', 'https://github.com/elifdemir'),
  
  ('a1b2c3d4-3333-3333-3333-333333333333', 'mehmetkaya', 'Mehmet Kaya', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet', 'Backend Developer | Python & Django Expert', NULL, 'https://github.com/mehmetkaya'),
  
  ('a1b2c3d4-4444-4444-4444-444444444444', 'zeyneparslan', 'Zeynep Arslan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep', 'Mobile Developer | Flutter & React Native', 'https://zeyneparslan.io', 'https://github.com/zeyneparslan'),
  
  ('a1b2c3d4-5555-5555-5555-555555555555', 'ahmetyilmaz', 'Ahmet Yilmaz', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet', 'DevOps Engineer | AWS & Kubernetes', NULL, 'https://github.com/ahmetyilmaz');

-- =============================================
-- 2. TECHNOLOGIES
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
-- 3. PROJECTS
-- =============================================

INSERT INTO public.projects (id, owner_id, title, description, status, repo_url, demo_url)
VALUES 
  ('p1111111-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', 'E-Commerce Platform', 'Modern and scalable e-commerce solution. Built with React, Node.js and PostgreSQL.', 'in_progress', 'https://github.com/efeikan/ecommerce', 'https://ecommerce-demo.vercel.app'),
  
  ('p2222222-2222-2222-2222-222222222222', 'a1b2c3d4-2222-2222-2222-222222222222', 'AI Chat Assistant', 'AI-powered customer service chatbot. With GPT-4 integration.', 'idea', 'https://github.com/elifdemir/ai-chat', NULL),
  
  ('p3333333-3333-3333-3333-333333333333', 'a1b2c3d4-3333-3333-3333-333333333333', 'Mobile Fitness App', 'Personalized workout and nutrition tracking application.', 'in_progress', 'https://github.com/mehmetkaya/fitness-app', 'https://fitness-app.com'),
  
  ('p4444444-4444-4444-4444-444444444444', 'a1b2c3d4-4444-4444-4444-444444444444', 'Blockchain Wallet', 'Secure and user-friendly crypto wallet application.', 'completed', 'https://github.com/zeyneparslan/crypto-wallet', 'https://wallet-demo.io'),
  
  ('p5555555-5555-5555-5555-555555555555', 'a1b2c3d4-5555-5555-5555-555555555555', 'DevOps Dashboard', 'Kubernetes cluster management and monitoring panel.', 'in_progress', 'https://github.com/ahmetyilmaz/devops-dash', NULL);

-- =============================================
-- 4. PROJECT_TECHNOLOGIES (Project-Technology Relationship)
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
-- 5. PROJECT_MEMBERS (Project Members)
-- =============================================

INSERT INTO public.project_members (project_id, user_id, role_title, status)
VALUES 
  -- Elif as frontend developer in E-Commerce
  ('p1111111-1111-1111-1111-111111111111', 'a1b2c3d4-2222-2222-2222-222222222222', 'Frontend Developer', 'accepted'),
  -- Mehmet as backend developer in E-Commerce
  ('p1111111-1111-1111-1111-111111111111', 'a1b2c3d4-3333-3333-3333-333333333333', 'Backend Developer', 'accepted'),
  
  -- Efe as technical advisor in AI Chat
  ('p2222222-2222-2222-2222-222222222222', 'a1b2c3d4-1111-1111-1111-111111111111', 'Technical Advisor', 'pending'),
  
  -- Zeynep as mobile developer in Fitness App
  ('p3333333-3333-3333-3333-333333333333', 'a1b2c3d4-4444-4444-4444-444444444444', 'Mobile Developer', 'accepted'),
  
  -- Efe as full-stack developer in DevOps Dashboard
  ('p5555555-5555-5555-5555-555555555555', 'a1b2c3d4-1111-1111-1111-111111111111', 'Full Stack Developer', 'accepted');

-- =============================================
-- 6. CONVERSATIONS
-- =============================================

INSERT INTO public.conversations (id, is_group, project_id)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', false, NULL),  -- Private chat between Efe and Elif
  ('c2222222-2222-2222-2222-222222222222', true, 'p1111111-1111-1111-1111-111111111111');  -- E-Commerce project group

-- =============================================
-- 7. CONVERSATION_PARTICIPANTS
-- =============================================

INSERT INTO public.conversation_participants (conversation_id, user_id)
VALUES 
  -- Private chat: Efe and Elif
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111'),
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-2222-2222-2222-222222222222'),
  
  -- E-Commerce group chat: Efe, Elif, Mehmet
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-1111-1111-1111-111111111111'),
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-2222-2222-2222-222222222222'),
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-3333-3333-3333-333333333333');

-- =============================================
-- 8. MESSAGES
-- =============================================

INSERT INTO public.messages (conversation_id, sender_id, content, is_read)
VALUES 
  -- Private chat messages
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', 'Hello Elif, we need you for frontend in the E-commerce project!', true),
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-2222-2222-2222-222222222222', 'Hello Efe! It looks very interesting, can you share the details?', true),
  ('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', 'Sure, we will use React and TypeScript. Styling will be done with Tailwind.', false),
  
  -- Group chat messages
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-1111-1111-1111-111111111111', 'Should we do sprint planning as a team this week?', true),
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-3333-3333-3333-333333333333', 'Backend APIs are ready, we can move on to frontend integration.', true),
  ('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-2222-2222-2222-222222222222', 'Great! I also completed the component library 🎉', false);
