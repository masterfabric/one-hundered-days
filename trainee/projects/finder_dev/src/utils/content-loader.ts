// Utility functions for loading JSON content files

import type { SplashData } from './types';
import type { SiteData } from './types';
import type { HomeData } from './types';
import type { ProfileData } from './types';
import splashData from '../data/splash.json';
import siteData from '../config/site-data.json';
import homeData from '../data/home.json';
import profileData from '../data/profile.json';
import technologiesData from '../data/technologies.json';

export function loadSplashData(): SplashData {
  return splashData as SplashData;
}

export function loadSiteData(): SiteData {
  return siteData as SiteData;
}

export function loadHomeData(): HomeData {
  return homeData as HomeData;
}

export function loadProfileData(): ProfileData {
  return profileData as ProfileData;
}

export function loadTechnologies() {
  return technologiesData.technologies as Array<{ id: number; name: string; category: string }>;
}
