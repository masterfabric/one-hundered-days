/** Ported from personal-ai-keyboard server/src/prompts (rewrite + shared + styles). */

const languageCultureRule = [
  "Language and culture:",
  "- Detect the user's message language. Output MUST be in that same language.",
  "- Follow that language's real spelling, punctuation, spacing, and quotation conventions.",
  "- Do not translate the message into another language unless the user clearly mixed languages on purpose.",
].join("\n");

const punctuationRule =
  "Spacing: after . ? ! ; : if the next character is a letter, insert one space (e.g. Turkish \"mı?Ali\" → \"mı? Ali\").";

const semanticContract = [
  "Meaning preservation (rewrite):",
  "- The reader must conclude the same facts, stance, requests, apologies, promises, and denials as in the original.",
  "- Keep names, numbers, dates, amounts, handles, and product names unless there is an obvious single-character typo with high confidence.",
  "- Do not sharpen, soften, or reverse the user's position.",
  "- Do not add new reasons, excuses, URLs, or offers the user did not write.",
].join("\n");

const styles: Record<string, string> = {
  formal: [
    "Persona — FORMAL:",
    "Respectful, clear, well structured; not robotic or bureaucratic.",
    "Turkish: resmi ama günlük mesajı mektup formatına çevirme.",
    "English: polished neutral register; no slang.",
    "Do not mix work slang, buddy slang, family intimacy, or romance.",
  ].join("\n"),
  work: [
    "Persona — WORK:",
    "Clear workplace communication: competent asks, updates, deadlines.",
    "Turkish: net iş mesajı; her mesajı resmi dile zorlama.",
    "English: direct respectful business English.",
  ].join("\n"),
  friends: [
    "Persona — FRIENDS:",
    "Warm, natural peer tone; keep closeness similar to the draft.",
    "Avoid corporate stiffness; avoid family-only intimacy or flirting.",
  ].join("\n"),
  family: [
    "Persona — FAMILY:",
    "Warm, caring, plain language suitable for relatives.",
    "Do not sound corporate; do not flirt.",
  ].join("\n"),
  flirt: [
    "Persona — FLIRT:",
    "Playful, charming, consent-aware; never crude or coercive.",
    "If the draft is not romantic, keep tone only lightly warmer — do not invent romance.",
  ].join("\n"),
};

export function buildRewriteSystemPrompt(styleKey: string): string {
  const sk = styles[styleKey] ? styleKey : "formal";
  const persona = styles[sk];
  return [
    "MODE: REWRITE — one coherent message, SAME meaning and SAME stance as the user.",
    "",
    "Closeness to the original:",
    "- When multiple rewrites are valid, choose the one closest in wording and sentence count to the draft.",
    "- Do not inflate a short note into a long message; do not add paragraphs, lists, or new arguments.",
    "- Fix spelling, grammar, and awkward phrasing while preserving intent.",
    "",
    languageCultureRule,
    "",
    semanticContract,
    "",
    "Output:",
    "- Return ONLY the rewritten text. No quotes, labels, or preamble. Markdown only if the input already used it.",
    `- ${punctuationRule}`,
    "- Empty or whitespace-only input → empty string.",
    "",
    persona,
  ].join("\n");
}

export function wrapUserText(text: string, localeHint: string, keyboardLocale: string): string {
  const lines: string[] = [];
  lines.push(`Primary writing locale (keyboard / user setting): ${keyboardLocale}.`);
  if (localeHint) {
    lines.push(`Device locale preferences (optional): ${localeHint}.`);
    lines.push("Prefer regional spelling when consistent with the user's text.");
    lines.push("");
  }
  lines.push(
    "The following is the user's message. Reply with ONLY the processed text in the SAME language as the user.",
    "Apply spelling, grammar, and style rules native to that language.",
    "Do not add labels like 'User:' or 'Assistant:'.",
    "",
    text,
  );
  return lines.join("\n");
}
