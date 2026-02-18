# Supabase Kurulum Rehberi

Bu proje Supabase veritabanı kullanmaktadır. Kurulum için aşağıdaki adımları takip edin.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://app.supabase.com) sitesine gidin ve bir hesap oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından URL ve API anahtarlarınızı alın

## 2. Environment Variables Ayarlama

Proje kök dizininde `.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url

# Supabase panelindeki "App Frameworks" ekranında gördüğün publishable key:
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key

# İstersen aynı değeri klasik anon key ismine de kopyalayabilirsin
# (kod zaten ikisinden birini otomatik alıyor):
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Not:** `.env.local` dosyası git'e commit edilmemelidir (zaten .gitignore'da).

## 3. Veritabanı Şeması Oluşturma

Supabase SQL Editor'da aşağıdaki SQL komutlarını çalıştırın:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning',
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tech_stack TEXT[] DEFAULT '{}',
  required_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id, role)
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_applications_project_id ON applications(project_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. Row Level Security (RLS) Politikaları

Güvenlik için RLS politikalarını ayarlayın:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users: Users can read all profiles, but only update their own
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Projects: Everyone can read, only owners can modify
CREATE POLICY "Anyone can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update projects" ON projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete projects" ON projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Applications: Users can view their own applications, project owners can view project applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Project owners can view project applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = applications.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Project owners can update application status" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = applications.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Conversations: Users can view conversations they're part of
CREATE POLICY "Users can view conversations" ON conversations
  FOR SELECT USING (true); -- Adjust based on your participant logic

-- Messages: Users can view messages in conversations they're part of
CREATE POLICY "Users can view messages" ON messages
  FOR SELECT USING (true); -- Adjust based on your participant logic

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Not:** RLS politikaları authentication sisteminize göre ayarlanmalıdır. Yukarıdaki örnekler Supabase Auth kullanıldığını varsayar.

## 5. Test Etme

Kurulum tamamlandıktan sonra:

1. Development server'ı başlatın: `npm run dev`
2. API endpoint'lerini test edin
3. Supabase Dashboard'da veritabanı tablolarını kontrol edin

## Önemli Notlar

- **Service Role Key:** Bu anahtar Row Level Security (RLS) politikalarını bypass eder. Sadece server-side kodda kullanın ve asla client-side'a expose etmeyin.
- **Anon Key:** Bu anahtar client-side kodda kullanılabilir ve RLS politikalarına tabidir.
- **Authentication:** Şu anda action dosyalarında placeholder user ID'ler kullanılmaktadır. Gerçek authentication sistemini entegre ettiğinizde bunları güncelleyin.

## Sorun Giderme

- Environment variables'ların doğru yüklendiğinden emin olun
- Supabase projenizin aktif olduğunu kontrol edin
- SQL komutlarının başarıyla çalıştığını doğrulayın
- Browser console ve Supabase logs'ları kontrol edin

