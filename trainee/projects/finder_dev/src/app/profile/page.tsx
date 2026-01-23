"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadProfileData, loadTechnologies } from "@/utils/content-loader";
import { cn } from "@/lib/utils";
import type { UserProfile, UserSkill, TechnologyCategory } from "@/types/profile";
import { toast } from "sonner";
import { Loader2, Camera, Upload, X, Image as ImageIcon, Plus } from "lucide-react";

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

// Location data - Country -> Cities
const locationData: Record<string, string[]> = {
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana"],
  "United States": ["New York", "San Francisco", "Los Angeles", "Chicago", "Boston", "Seattle"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Edinburgh", "Bristol"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  "France": ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "Remote": [],
};

// Parse location from profile
const parseLocation = (location: string | undefined) => {
  if (!location) return { country: "", city: "" };
  if (location === "Remote") return { country: "Remote", city: "" };
  const parts = location.split(", ");
  if (parts.length === 2) {
    return { country: parts[1], city: parts[0] };
  }
  return { country: "", city: "" };
};

export default function ProfilePage() {
  const pathname = usePathname();
  const profileContent = loadProfileData();
  const technologies = loadTechnologies();
  const [profile, setProfile] = useState<UserProfile>(getInitialProfile());
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Location state
  const initialLocation = parseLocation(profile.location);
  const [selectedCountry, setSelectedCountry] = useState<string>(initialLocation.country);
  const [selectedCity, setSelectedCity] = useState<string>(initialLocation.city);
  
  // Get cities for selected country
  const availableCities = useMemo(() => {
    if (!selectedCountry || selectedCountry === "Remote") return [];
    return locationData[selectedCountry] || [];
  }, [selectedCountry]);
  
  // Update location when country or city changes
  const updateLocation = (country: string, city: string) => {
    if (country === "Remote") {
      setProfile((prev) => ({ ...prev, location: "Remote" }));
    } else if (country && city) {
      setProfile((prev) => ({ ...prev, location: `${city}, ${country}` }));
    } else if (country) {
      setProfile((prev) => ({ ...prev, location: country }));
    } else {
      setProfile((prev) => ({ ...prev, location: "" }));
    }
  };
  
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity("");
    if (country === "Remote") {
      updateLocation("Remote", "");
    } else {
      updateLocation(country, "");
    }
  };
  
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (selectedCountry) {
      updateLocation(selectedCountry, city);
    }
  };

  // Sync location state when profile.location changes externally
  useEffect(() => {
    const parsed = parseLocation(profile.location);
    if (parsed.country && parsed.country !== selectedCountry) {
      setSelectedCountry(parsed.country);
      setSelectedCity(parsed.city);
    }
  }, [profile.location, selectedCountry]);

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

  const handleSave = async () => {
    // Validate required fields
    const trimmedUsername = profile.username?.trim() || "";
    const trimmedFullName = profile.fullName?.trim() || "";
    const trimmedRole = profile.role?.trim() || "";
    
    if (!trimmedUsername || !trimmedFullName || !trimmedRole) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields (marked with *)",
      });
      return;
    }
    
    // In real app, this would save to Supabase
    console.log("Saving profile:", profile);
    
    setIsSaving(true);
    
    // Show loading toast
    const loadingToastId = toast.loading("Saving changes...", {
      description: "Please wait while we save your profile",
    });
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    
    // Dismiss loading toast and show success
    toast.dismiss(loadingToastId);
    toast.success("Changes saved!", {
      description: "Your profile has been updated successfully",
    });
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
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Photo</CardTitle>
                  <CardDescription>
                    Upload a photo to personalize your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative group flex-shrink-0">
                      <Avatar className="h-32 w-32 border-2">
                        {profile.avatarUrl && (
                          <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                        )}
                        <AvatarFallback className="text-2xl">
                          {profile.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="h-6 w-6 text-white" />
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="avatar-upload"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="flex-1 w-full sm:w-auto space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                        {profile.avatarUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setProfile({ ...profile, avatarUrl: undefined })}
                            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span>JPG, PNG or GIF. Max size 2MB</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information Card */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>{profileContent.sections.personalInfo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Two-column row: Full Name and Username */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <span className="text-red-500">*</span> {profileContent.sections.personalInfo.fields.fullName}
                        </label>
                        <Input
                          value={profile.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {profile.fullName || "Full Name"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <span className="text-red-500">*</span> {profileContent.sections.personalInfo.fields.username}
                        </label>
                        <Input
                          value={profile.username}
                          onChange={(e) => handleInputChange("username", e.target.value)}
                          placeholder="Enter your username"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          @{profile.username || "username"}
                        </p>
                      </div>
                    </div>

                    {/* Role field */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <span className="text-red-500">*</span> {profileContent.sections.personalInfo.fields.role}
                      </label>
                      <Select
                        value={profile.role || ""}
                        onValueChange={(value) => handleInputChange("role", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                          <SelectItem value="Junior Developer">Junior Developer</SelectItem>
                          <SelectItem value="Trainee">Trainee</SelectItem>
                          <SelectItem value="Team Lead">Team Lead</SelectItem>
                          <SelectItem value="Full-Stack Developer">Full-Stack Developer</SelectItem>
                          <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                          <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                          <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                          <SelectItem value="Product Manager">Product Manager</SelectItem>
                          <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                          <SelectItem value="Mobile Developer">Mobile Developer</SelectItem>
                          <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground mt-1">
                        {profile.role ? (
                          <Badge variant="secondary" className="text-xs">
                            {profile.role}
                          </Badge>
                        ) : (
                          "Not selected"
                        )}
                      </div>
                    </div>

                    {/* Location field - Nested Select */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {profileContent.sections.personalInfo.fields.location}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={selectedCountry}
                          onValueChange={handleCountryChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(locationData).map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedCity}
                          onValueChange={handleCityChange}
                          disabled={!selectedCountry || selectedCountry === "Remote"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={selectedCountry === "Remote" ? "Remote" : "Select city"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {profile.location || "Not selected"}
                      </p>
                    </div>

                    {/* Bio field */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">
                          {profileContent.sections.personalInfo.fields.bio}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {(profile.bio || "").length}/500
                        </span>
                      </div>
                      <Textarea
                        value={profile.bio || ""}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                        className="h-[120px] resize-none"
                      />
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Card */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>{profileContent.sections.skills.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  
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
                        className="hover:bg-accent transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {profileContent.sections.skills.addSkill}
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
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  {profileContent.actions.cancel}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="ghost"
                  className="hover:bg-green-600/10 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    profileContent.actions.save
                  )}
                </Button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
