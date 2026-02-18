/**
 * Parse comma-separated string to array
 */
export function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

/**
 * Parse string to number with default
 */
export function parseNumber(
  value: string | undefined,
  defaultValue: number
): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse string to boolean
 */
export function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  return value.toLowerCase() === "true";
}

/**
 * Check if user has required skills for a project
 */
export function hasRequiredSkills(
  userSkills: Array<{ name: string; level: string }>,
  projectTechStack: Array<{ name: string }>
): boolean {
  const userSkillNames = userSkills.map((skill) =>
    skill.name.toLowerCase()
  );
  const projectTechNames = projectTechStack.map((tech) =>
    tech.name.toLowerCase()
  );

  return projectTechNames.some((tech) => userSkillNames.includes(tech));
}

/**
 * Calculate skill match percentage
 */
export function calculateSkillMatch(
  userSkills: Array<{ name: string; level: string }>,
  projectTechStack: Array<{ name: string }>
): number {
  if (projectTechStack.length === 0) return 100;

  const userSkillNames = userSkills.map((skill) =>
    skill.name.toLowerCase()
  );
  const projectTechNames = projectTechStack.map((tech) =>
    tech.name.toLowerCase()
  );

  const matchedSkills = projectTechNames.filter((tech) =>
    userSkillNames.includes(tech)
  );

  return Math.round((matchedSkills.length / projectTechStack.length) * 100);
}

/**
 * Format date to relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return then.toLocaleDateString();
}

/**
 * Sanitize user input (basic XSS prevention)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Generate slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + data.length < total,
    },
  };
}

