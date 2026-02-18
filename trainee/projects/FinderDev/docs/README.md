# FinderDev

Find developers, discover projects, and build amazing things together. The perfect platform to connect developers with exciting projects.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Validation**: Zod
- **Styling**: Tailwind CSS

## Project Structure

```
src/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── projects.ts
│   │   ├── applications.ts
│   │   ├── users.ts
│   │   └── chat.ts
│   ├── api/                  # API Routes (REST endpoints)
│   │   ├── projects/
│   │   ├── applications/
│   │   ├── users/
│   │   └── chat/
│   └── ...
├── lib/
│   ├── validations/          # Zod validation schemas
│   │   ├── projects.ts
│   │   ├── applications.ts
│   │   ├── users.ts
│   │   └── chat.ts
│   └── utils/
│       ├── errors.ts         # Error handling utilities
│       └── helpers.ts        # Helper functions
└── types/
    └── index.ts              # Shared TypeScript types
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to `http://localhost:3000`

## Database

This project uses **Supabase** as the database solution. 

### Quick Setup

1. **Create a Supabase project** at [supabase.com](https://app.supabase.com)
2. **Set up environment variables** - Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. **Run the database schema** - See `docs/SUPABASE_SETUP.md` for detailed SQL schema and setup instructions

For detailed setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## Next Steps

1. ✅ Database solution configured (Supabase)
2. ✅ Database logic implemented in Server Actions
3. Set up authentication (Supabase Auth recommended)
4. Configure Row Level Security (RLS) policies in Supabase

## Development

- Server Actions are in `src/app/actions/`
- API Routes are in `src/app/api/`
- Validation schemas are in `src/lib/validations/`
- Utility functions are in `src/lib/utils/`
