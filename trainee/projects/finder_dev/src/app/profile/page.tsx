"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { loadProfileData, loadTechnologies } from "@/utils/content-loader";
import { cn } from "@/lib/utils";
import type { UserProfile, UserSkill, TechnologyCategory } from "@/types/profile";

// Mock user data - in real app, this would come from auth/supabase
const mockUser = {
  name: "Alex Turner",
  username: "alexturner",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
  role: "Full-Stack Dev",
};

// Get initial profile data from mockData
function getInitialProfile(): UserProfile {
  const profileData = loadProfileData();
  const mockProfile = profileData.mockData?.profiles?.[0];
  if (mockProfile && typeof mockProfile === 'object') {
    return {
      id: (mockProfile as any).id || "",
      username: (mockProfile as any).username || "",
      fullName: (mockProfile as any).fullName || "",
      avatarUrl: (mockProfile as any).avatarUrl,
      bio: (mockProfile as any).bio,
      role: (mockProfile as any).role || "Full-Stack Developer",
      location: (mockProfile as any).location || "San Francisco, CA",
      socialLinks: (mockProfile as any).socialLinks,
      skills: (mockProfile as any).skills || [],
    };
  }
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    username: "alexturner",
    fullName: "Alex Turner",
    role: "Full-Stack Developer",
    location: "San Francisco, CA",
    bio: "Full-stack developer with 5+ years of experience building scalable web applications. Passionate about React, Node.js, and cloud infrastructure.",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
    socialLinks: {
      website: "https://alexturner.dev",
      github: "https://github.com/alexturner",
      linkedin: "https://linkedin.com/in/alexturner",
      twitter: "https://twitter.com/alexturner",
    },
    skills: [
      { id: 1, name: "React", category: "Frontend" },
      { id: 2, name: "TypeScript", category: "Frontend" },
      { id: 3, name: "Node.js", category: "Backend" },
      { id: 4, name: "PostgreSQL", category: "Backend" },
    ],
  };
}

export default function ProfilePage() {
  const pathname = usePathname();
  const profileContent = loadProfileData();
  const technologies = loadTechnologies();
  const [profile, setProfile] = useState<UserProfile>(getInitialProfile());
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sub-navigation items
  const subNav = [
    {
      name: profileContent.sections.navigation?.profile || "Profile",
      href: "/profile",
    },
    {
      name: profileContent.sections.navigation?.notifications || "Notifications",
      href: "/profile/notifications",
    },
    {
      name: profileContent.sections.navigation?.privacySecurity || "Privacy & Security",
      href: "/profile/privacy-security",
    },
    {
      name: profileContent.sections.navigation?.appearance || "Appearance",
      href: "/profile/appearance",
    },
  ];

  // Filter technologies based on search and already selected
  const availableTechnologies = useMemo(() => {
    const selectedSkillIds = new Set(profile.skills?.map((s) => s.id) || []);
    let filtered = technologies.filter((tech) => !selectedSkillIds.has(tech.id));
    
    if (searchQuery) {
      filtered = filtered.filter((tech) =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [technologies, profile.skills, searchQuery]);

  // Group technologies by category
  const technologiesByCategory = useMemo(() => {
    const grouped: Record<string, typeof technologies> = {};
    availableTechnologies.forEach((tech) => {
      if (!grouped[tech.category]) {
        grouped[tech.category] = [];
      }
      grouped[tech.category].push(tech);
    });
    return grouped;
  }, [availableTechnologies]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    // Bio için karakter limiti kontrolü
    if (field === "bio" && value.length > 500) {
      return;
    }
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (techId: number) => {
    const tech = technologies.find((t) => t.id === techId);
    if (!tech) return;

    const skill: UserSkill = {
      id: tech.id,
      name: tech.name,
      category: tech.category as TechnologyCategory,
    };

    setProfile((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), skill],
    }));

    setOpen(false);
    setSearchQuery("");
  };

  const handleRemoveSkill = (skillId: number) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill.id !== skillId),
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real app, upload to Supabase Storage and update profile
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // In real app, this would save to Supabase
    console.log("Saving profile:", profile);
    // Show toast notification here
  };

  return (
    <DashboardLayout user={mockUser}>
      <div className="h-full gradient-bg">
          {/* Centered Compact Settings Panel */}
        <div className="flex justify-center items-start min-h-full py-8 px-4">
          <div className="flex gap-6 max-w-4xl w-full">
            {/* Left Sub-navigation Card */}
            <aside className="w-56 flex-shrink-0">
              <Card className="gradient-card border-[hsl(var(--border))] rounded-xl shadow-lg sticky top-8">
                <nav className="p-4 space-y-1">
                  {subNav.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href === "/profile" && pathname === "/profile");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-[hsl(var(--primary))] text-white shadow-md"
                            : "text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--muted))]"
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </Card>
            </aside>

            {/* Main Content Panel */}
            <main className="flex-1 max-w-3xl">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1">
                  {profileContent.page.title}
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  {profileContent.page.description}
                </p>
              </div>

              {/* Photo Management Card */}
              <Card className="gradient-card border-[hsl(var(--border))] mb-4 rounded-xl shadow-lg p-5">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-5">
                  Photo
                </h2>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-2 border-[hsl(var(--border))] rounded-full shadow-md">
                      {profile.avatarUrl && (
                        <AvatarImage src={profile.avatarUrl} alt={profile.fullName} className="rounded-full" />
                      )}
                      <AvatarFallback className="bg-[hsl(var(--primary))] text-white text-lg font-semibold rounded-full">
                        {profile.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="avatar-upload">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="avatar-upload"
                        onChange={handleAvatarChange}
                      />
                      <Button
                        type="button"
                        className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 hover:scale-[1.02] hover:shadow-lg text-white rounded-lg px-4 py-2 text-sm shadow-sm transition-all duration-300"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        Change Photo
                      </Button>
                    </label>
                    <Button
                      variant="outline"
                      className="border-red-600/50 text-red-600 bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 rounded-lg px-4 py-2 text-sm transition-all duration-300"
                      onClick={() => setProfile({ ...profile, avatarUrl: undefined })}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Personal Information Card */}
              <Card className="gradient-card border-[hsl(var(--border))] mb-4 rounded-xl shadow-lg">
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-5">
                    {profileContent.sections.personalInfo.title}
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Two-column row: Full Name and Username */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                          {profileContent.sections.personalInfo.fields.fullName}
                        </label>
                        <Input
                          value={profile.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] rounded-lg h-10"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                          {profileContent.sections.personalInfo.fields.username}
                        </label>
                        <Input
                          value={profile.username}
                          onChange={(e) => handleInputChange("username", e.target.value)}
                          className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] rounded-lg h-10"
                          placeholder="Enter your username"
                        />
                      </div>
                    </div>

                    {/* Role field */}
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                        {profileContent.sections.personalInfo.fields.role}
                      </label>
                      <Input
                        value={profile.role || ""}
                        onChange={(e) => handleInputChange("role", e.target.value)}
                        className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-blue-600 rounded-lg h-10"
                        placeholder="e.g., Full-Stack Developer"
                      />
                    </div>

                    {/* Location field */}
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                        {profileContent.sections.personalInfo.fields.location}
                      </label>
                      <Input
                        value={profile.location || ""}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-blue-600 rounded-lg h-10"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>

                    {/* Bio field */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                          {profileContent.sections.personalInfo.fields.bio}
                        </label>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {(profile.bio || "").length}/500
                        </span>
                      </div>
                      <Textarea
                        value={profile.bio || ""}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-blue-600 h-[120px] resize-none rounded-lg"
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Skills Card */}
              <Card className="gradient-card border-[hsl(var(--border))] mb-4 rounded-xl shadow-lg">
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-5">
                    {profileContent.sections.skills.title}
                  </h2>
                  
                  {/* Existing Skills - Blue rounded badges */}
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {profile.skills.map((skill) => (
                        <Badge
                          key={skill.id}
                          className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 hover:scale-105 text-white border-0 px-3 py-1.5 rounded-full font-medium text-sm shadow-sm transition-all duration-300"
                        >
                          {skill.name}
                          <button
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="ml-2 hover:opacity-70 text-white font-bold transition-opacity duration-200"
                            aria-label={`Remove ${skill.name}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[hsl(var(--muted-foreground))] text-sm mb-5">
                      {profileContent.sections.skills.empty}
                    </p>
                  )}

                  {/* Add Skill with Command/Popover */}
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white hover:scale-[1.02] hover:shadow-md rounded-lg px-4 py-2 text-sm transition-all duration-300"
                      >
                        + {profileContent.sections.skills.addSkill}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 rounded-xl shadow-xl" align="start">
                      <Command className="bg-[hsl(var(--popover))] rounded-xl">
                        <CommandInput
                          placeholder="Search technologies..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                          className="border-b border-[hsl(var(--border))] rounded-t-xl"
                        />
                        <CommandList>
                          <CommandEmpty>No technology found.</CommandEmpty>
                          {Object.entries(technologiesByCategory).map(([category, techs]) => (
                            <CommandGroup
                              key={category}
                              heading={category}
                              className="text-[hsl(var(--muted-foreground))]"
                            >
                              {techs.map((tech) => (
                                <CommandItem
                                  key={tech.id}
                                  value={tech.name}
                                  onSelect={() => handleAddSkill(tech.id)}
                                  className="text-[hsl(var(--foreground))] cursor-pointer hover:bg-[hsl(var(--primary))] hover:text-white rounded-lg mx-1"
                                >
                                  {tech.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] rounded-lg px-6 py-2"
                >
                  {profileContent.actions.cancel}
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 hover:scale-[1.02] hover:shadow-lg text-white rounded-lg px-6 py-2 shadow-sm transition-all duration-300"
                >
                  {profileContent.actions.save}
                </Button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
