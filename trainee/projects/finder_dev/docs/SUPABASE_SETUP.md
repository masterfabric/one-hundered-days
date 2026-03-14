# Supabase Setup Guide

This project uses Supabase as the database. Follow the steps below for setup.

## 1. Creating Supabase Project

1. Go to [Supabase](https://app.supabase.com) and create an account
2. Create a new project
3. Get your URL and API keys from the project settings

## 2. Setting Environment Variables

Create a `.env.local` file in the project root directory and add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note:** The `.env.local` file should not be committed to git (it's already in .gitignore).

## 3. Creating Database Schema

Run the following SQL commands in the Supabase SQL Editor:

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

## 4. Row Level Security (RLS) Policies

Set up RLS policies for security:

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

**Note:** RLS policies should be configured according to your authentication system. The examples above assume Supabase Auth is being used.

## 5. Testing

After setup is complete:

1. Start the development server: `npm run dev`
2. Test the API endpoints
3. Check the database tables in the Supabase Dashboard

## Important Notes

- **Service Role Key:** This key bypasses Row Level Security (RLS) policies. Only use it in server-side code and never expose it to the client-side.
- **Anon Key:** This key can be used in client-side code and is subject to RLS policies.
- **Authentication:** Currently, placeholder user IDs are used in action files. Update these when you integrate the actual authentication system.

## Troubleshooting

- Make sure environment variables are loaded correctly
- Check that your Supabase project is active
- Verify that SQL commands ran successfully
- Check browser console and Supabase logs

