"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadProfileData, loadTechnologies } from "@/utils/content-loader";
import type { UserProfile, UserSkill, TechnologyCategory } from "@/types/profile";

// Mock user data - in real app, this would come from auth/supabase
const mockUser = {
  name: "Alex Turner",
  username: "alexturner",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexturner",
  role: "Full-Stack Dev",
};

export default function ProfileSettingsPage() {
  const profileContent = loadProfileData();
  const technologies = loadTechnologies();
  const [selectedTechnologyId, setSelectedTechnologyId] = useState<string>("");

  const [profile, setProfile] = useState<UserProfile>({
    id: "550e8400-e29b-41d4-a716-446655440000",
    username: "alexturner",
    fullName: "Alex Turner",
    bio: "",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexturner",
    socialLinks: {
      github: "https://github.com/alexturner",
    },
    skills: [
      { id: 1, name: "React", category: "Frontend" },
      { id: 2, name: "TypeScript", category: "Frontend" },
      { id: 3, name: "Node.js", category: "Backend" },
      { id: 4, name: "PostgreSQL", category: "Backend" },
    ],
  });

  // Filter out already selected skills
  const availableTechnologies = useMemo(() => {
    const selectedSkillIds = new Set(profile.skills?.map((s) => s.id) || []);
    return technologies.filter((tech) => !selectedSkillIds.has(tech.id));
  }, [technologies, profile.skills]);

  const handleSocialLinkChange = (field: keyof NonNullable<UserProfile["socialLinks"]>, value: string) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  const handleAddSkill = () => {
    if (!selectedTechnologyId) return;

    const tech = technologies.find((t) => t.id.toString() === selectedTechnologyId);
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

    setSelectedTechnologyId("");
  };

  const handleRemoveSkill = (skillId: number) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill.id !== skillId),
    }));
  };

  const handleSave = () => {
    // In real app, this would save to Supabase
    console.log("Saving settings:", profile);
    // Show toast notification here
  };

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

  return (
    <DashboardLayout user={mockUser}>
      <div className="h-full bg-[hsl(var(--background))]">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              Settings
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Skills Card */}
          <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] mb-6 rounded-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-6">
                {profileContent.sections.skills.title}
              </h2>
              
              {/* Existing Skills */}
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] px-3 py-1"
                    >
                      {skill.name}
                      <span className="ml-2 text-[hsl(var(--muted-foreground))] text-xs">
                        ({skill.category})
                      </span>
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="ml-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
                  {profileContent.sections.skills.empty}
                </p>
              )}

              {/* Add Skill Form */}
              <div className="flex gap-3">
                <Select value={selectedTechnologyId} onValueChange={setSelectedTechnologyId}>
                  <SelectTrigger className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:border-blue-600 flex-1">
                    <SelectValue placeholder="Select a technology" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--popover))] border-[hsl(var(--border))]">
                    {Object.entries(technologiesByCategory).map(([category, techs]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                          {category}
                        </div>
                        {techs.map((tech) => (
                          <SelectItem
                            key={tech.id}
                            value={tech.id.toString()}
                            className="text-[hsl(var(--foreground))] focus:bg-[hsl(var(--accent))]"
                          >
                            {tech.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddSkill}
                  disabled={!selectedTechnologyId}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {profileContent.sections.skills.addSkill}
                </Button>
              </div>
            </div>
          </Card>

          {/* Social Links Card */}
          <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))] mb-6 rounded-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-6">
                {profileContent.sections.socialLinks.title}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                    {profileContent.sections.socialLinks.fields.github}
                  </label>
                  <Input
                    value={profile.socialLinks?.github || ""}
                    onChange={(e) => handleSocialLinkChange("github", e.target.value)}
                    className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-blue-600"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                    {profileContent.sections.socialLinks.fields.website}
                  </label>
                  <Input
                    value={profile.socialLinks?.website || ""}
                    onChange={(e) => handleSocialLinkChange("website", e.target.value)}
                    className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-blue-600"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                    {profileContent.sections.socialLinks.fields.linkedin}
                  </label>
                  <Input
                    value={profile.socialLinks?.linkedin || ""}
                    onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                    className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-blue-600"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                    {profileContent.sections.socialLinks.fields.twitter}
                  </label>
                  <Input
                    value={profile.socialLinks?.twitter || ""}
                    onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                    className="bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-blue-600"
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              className="border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              {profileContent.actions.cancel}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {profileContent.actions.save}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
