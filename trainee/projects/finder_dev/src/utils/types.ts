// Type definitions for JSON data files

export interface SplashData {
  title: string;
  tagline: string;
  description: string;
  loading: {
    text: string;
    subtext: string;
  };
  animation: {
    duration: number;
    fadeOutDuration: number;
  };
}

export interface SiteData {
  siteName: string;
  siteDescription: string;
  defaultTheme: "light" | "dark";
  meta: {
    ogTitle: string;
    ogDescription: string;
    twitterCard: string;
  };
}

export interface HomeData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  splash: {
    showOnLoad: boolean;
    minDisplayTime: number;
  };
}

export interface SentryData {
  page: {
    title: string;
    description: string;
    icon: string;
  };
  hero: {
    title: string;
    description: string;
  };
  button: {
    label: string;
    text: string;
  };
  messages: {
    loading: string;
    success: string;
    connectivity: {
      title: string;
      description: string;
    };
    error: {
      title: string;
      description: string;
    };
  };
  links: {
    issues: {
      text: string;
      url: string;
    };
    documentation: {
      text: string;
      url: string;
    };
  };
  meta: {
    title: string;
    description: string;
  };
}

export interface ProfileData {
  page: {
    title: string;
    description: string;
  };
  sections: {
    personalInfo: {
      title: string;
      fields: {
        username: string;
        fullName: string;
        role?: string;
        location?: string;
        bio: string;
        avatar: string;
      };
    };
    skills: {
      title: string;
      empty: string;
      addSkill: string;
      removeSkill: string;
    };
    socialLinks: {
      title: string;
      fields: {
        website: string;
        github: string;
        linkedin: string;
        twitter: string;
      };
    };
    projects: {
      title: string;
      empty: string;
      viewAll: string;
    };
    navigation?: {
      profile?: string;
      notifications?: string;
      privacySecurity?: string;
      appearance?: string;
    };
  };
  actions: {
    edit: string;
    save: string;
    cancel: string;
    delete: string;
  };
  mockData?: {
    profiles?: unknown[];
  };
}