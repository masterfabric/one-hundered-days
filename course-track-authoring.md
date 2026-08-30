# Course track authoring

How MasterFabric Academy courses are written in [one-hundered-days](https://github.com/masterfabric/one-hundered-days), then imported here. Use this when adding a new track (for example Swift, Kotlin, or another 100-day path).

Lesson markdown is **English**. The LMS imports it as-is (`TEXT` lessons). Do not mix Turkish into day files.

## What existing courses share

Live catalog (2026) has two shapes:

| Shape | Examples | Source layout | Typical LMS outline |
| --- | --- | --- | --- |
| **100-day roadmap** | Flutter, Expo, NestJS, Next.js, Go, TypeScript, GraphQL, DevOps, AI Agents | `days/{track}/1.md` … `100.md` + `{track}_roadmap.md` | **21 modules / 121 lessons** (20 × 5-day sections + certificate exam) |
| **Short roadmap** | Git, OOP, SDLC | fewer day files (e.g. Git scenarios, OOP ~20 days) | **5 modules / ~21–25 lessons** |

Shared rules:

- One topic per day; title `# Day N: {Section} - {Topic}`.
- Four headings, in this order, with the emoji prefixes other tracks use.
- **Today's Tasks:** four numbered items, each `N. **Title:** doable action` (write, run, build, submit). Not "note that X is deprecated".
- **Task Explanations:** one short paragraph **per task**, in the same order — not a single summary paragraph.
- **What You'll Gain:** starts with `By the end of today, you will …` (Academy uses this as the lesson summary).
- **Dictionary for Developers:** **5–6** terms as `* **Term:** definition` (definitions longer than ~12 characters). Section quizzes are generated from these entries.
- Five-day blocks: last day of many blocks is **review or a small project** (Flutter Days 4–5, 40, 50, …). Do not run new theory every day until a single capstone.
- Tool versions: say **latest stable** by default. Name a version only when the feature needs a minimum (e.g. Typed Throws: Swift 6.0+).
- Deprecated APIs belong in explanations, not as a numbered task.
- Aim for roughly **350+ words** per day (Flutter is often 350–500). Thin days feel empty in the LMS.

Academy import also adds a **Certificate Exam** module and section quizzes. Those are not written by hand in the day files; they are built from tasks + dictionary.

## Repo files (one-hundered-days)

```
days/{track}/
  {track}_roadmap.md    # 20 rows for a 100-day track (Days 1-5, 6-10, … 96-100)
  1.md … 100.md         # one file per day, same template
README.md               # tracks table, /days/ listing, repo-map diagram
```

Track folder names match other tracks: `flutter`, `expo`, `nestjs`, `days/swift`, …

### Roadmap table row

```markdown
| **1-5** | **{Section title}** | Short topic list. | One-line goal for the block. |
```

Module titles in the LMS become:

`Section {n}: {section_title} (Days {start}-{end})`

### Day file — copy this

Save as `days/{track}/{n}.md`. Replace placeholders. Keep the heading text exactly (`Today's Tasks`, `Task Explanations`, `What You'll Gain`, `Dictionary for Developers`) so export scripts can parse them.

```markdown
# Day {N}: {Section title} - {Topic}

## 📝 Today's Tasks

1. **{Action title}:** {Concrete step the learner can finish today.}
2. **{Action title}:** {Concrete step.}
3. **{Action title}:** {Concrete step.}
4. **{Action title}:** {Concrete step — prefer a small build/run over "understand".}

## 📖 Task Explanations

{Paragraph for task 1: why it matters and what "done" looks like.}

{Paragraph for task 2.}

{Paragraph for task 3.}

{Paragraph for task 4.}

## 💡 What You'll Gain

By the end of today, you will {specific outcome}. {One more sentence tying it to later days.}

## 📚 Dictionary for Developers

* **{Term}:** {One or two sentences. Must be a real definition, not just the term repeated.}
* **{Term}:** {Definition.}
* **{Term}:** {Definition.}
* **{Term}:** {Definition.}
* **{Term}:** {Definition.}
```

Parser-sensitive details:

- Numbered tasks: `1. **Title:** rest of line` (bold closes before the colon's following text). Nested `**` inside the rest of the line is OK.
- Dictionary: `* **Term:** definition` with a space after `*`.
- Optional inline code: `` `let` ``, `` `NavigationStack` ``.
- Do not add extra `##` headings; extra H2s break section extraction.

### Filled example (tone)

```markdown
# Day 1: Language Fundamentals - Environment & Variables

## 📝 Today's Tasks

1. **Install the Toolchain:** Install the latest stable Xcode from the App Store (it ships the current Swift compiler, iOS SDK, and Simulator).
2. **Run a Playground:** Create a Playground (or use `swift` in the terminal) and print `"Hello, Swift!"`.
3. **Declare Constants and Variables:** Use `let` for values that never change and `var` for values that do. Prefer `let` by default.
4. **Explore Core Types:** Use `Int`, `Double`, `String`, and `Bool`, and let the compiler infer types.

## 📖 Task Explanations

A correct toolchain install is the whole game on day one: you need the compiler, Simulator, and editor in one place before any later UI or concurrency work.

Printing a string confirms the toolchain, not your skill. If this fails, stop and fix the install; nothing else in the track will run.

The first design choice on every value is `let` vs `var`. Preferring `let` is how the compiler catches accidental mutation.

Core types are still precise even when you omit the annotation. Inference does not mean untyped.

## 💡 What You'll Gain

By the end of today, you will have a working, up-to-date toolchain and can declare correctly typed constants and variables. This is the bedrock for everything that follows.

## 📚 Dictionary for Developers

* **Xcode:** Apple's IDE that bundles the Swift compiler, SDKs, Simulator, and debugging tools.
* **`let`:** Declares an immutable binding whose value is fixed after assignment.
* **`var`:** Declares a mutable variable whose value can be reassigned.
* **Type Inference:** The compiler deducing a value's type from context so you need not write it explicitly.
* **Playground:** A lightweight Xcode document for running Swift without a full app target.
```

## Checklist before you open a PR

- [ ] `{track}_roadmap.md` has **20** five-day rows (100-day track) or a documented shorter table.
- [ ] Files `1.md` … `{last}.md` exist; no gaps.
- [ ] Every day has the four sections above.
- [ ] Four tasks are **doable**; notes/deprecations live in explanations.
- [ ] Gain lines start with **By the end of today, you will**.
- [ ] Dictionary has **5–6** terms with real definitions.
- [ ] Several blocks end in review or a small project; there is at least one mid-track MVP and a capstone (Day 100 on a full track).
- [ ] Versions: latest stable, plus minimum versions only where required.
- [ ] README tracks table, `/days/` list, and repo-map diagram include the track.
- [ ] English only in day files.

## After merge: Academy import

Content lives in **one-hundered-days**. This repo stores snapshots under `scripts/data/courses/{course-id}/` and seeds particular-lms.

1. Add `scripts/data/courses/{course-id}/manifest.json` (`course_id` slug like `swift-developer-roadmap`, tags `roadmap` + `100-days`, `source.type: one_hundred_days`, `days_path`, builder).
2. Wire a builder (reuse `scripts/lib/one-hundred-days-curriculum-build.mjs` where possible) and `scripts/export-curriculum-data.mjs`.
3. Export: `node scripts/export-curriculum-data.mjs --course={course-id} --all-batches`.
4. Review `validation.json` (`missing_days` must be empty).
5. Seed course shell + modules/lessons (`npm run seed:…:execute`). Quizzes come from dictionary + tasks via `scripts/lib/curriculum-quiz-build.mjs`.

See `scripts/data/README.md` for folder layout and seed commands.

## Short tracks (Git / OOP / SDLC)

Same day template. Fewer days and sections. Git uses **scenarios** in module titles (`Scenarios {{day_range}}`) instead of `Days`. Do not stretch a short topic to 100 days to match Flutter.
