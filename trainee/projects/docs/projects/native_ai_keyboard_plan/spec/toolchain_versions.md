# Toolchain and runtime versions

Pinned or documented versions help contributors reproduce builds. Update this file when the implementation repo changes SDKs or CLI versions.

| Technology | Version / target | Notes |
|------------|-------------------|--------|
| **Android** | API / compile SDK **35** (example); **minSdk 26** (example) | Align with `android-keyboard` module when created. |
| **Kotlin** | **2.0.x** (example) | Match Android Studio default for the project year. |
| **iOS deployment target** | **17.0** | Matches `ios-keyboard` XcodeGen `project.yml` where applicable. |
| **Swift** | **5.0** | As set in Xcode project. |
| **Supabase CLI** | Latest stable from [Supabase CLI releases](https://github.com/supabase/cli/releases) | Used for `link`, `db push`, `functions deploy`. |
| **Deno (Edge)** | Managed by Supabase hosted runtime | Local `supabase functions serve` uses CLI-bundled Deno. |
| **Node.js** (optional scripts only) | **20 LTS** | Only if you add small Node tooling; Edge Functions do not use Node in production. |
| **Package manager** (optional host tooling) | **npm** or **pnpm** | Document in the implementation `package.json` if added. |
| **Google Gemini** | Model name via secret `GEMINI_MODEL` (e.g. `gemini-2.0-flash`) | API key only in Supabase Edge secrets. |

Implementation code lives under [`trainee/projects/native_ai_keyboard/`](../../../../native_ai_keyboard/README.md) (when present in the branch). This plan folder stays Markdown-first; SQL and Edge sources live next to the app code.
