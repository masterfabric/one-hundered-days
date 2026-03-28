"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiSelectPopover } from "@/components/ui/multi-select-popover";
import { Calendar, CalendarClock, Check, ChevronDown, FileText, Link2, Users } from "lucide-react";
import { ToastHelper } from "@/lib/toastHelper";

type ProjectStatus =
  | "idea"
  | "in development"
  | "MVP Ready"
  | "Recruiting"
  | "Refactoring";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "in development", label: "In Development" },
  { value: "MVP Ready", label: "MVP Ready" },
  { value: "Recruiting", label: "Recruiting" },
  { value: "Refactoring", label: "Refactoring" },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const deadlineInputRef = useRef<HTMLInputElement | null>(null);
  const documentationFileInputRef = useRef<HTMLInputElement | null>(null);
  const statusTriggerRef = useRef<HTMLDivElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<ProjectStatus>("idea");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [statusMenuPosition, setStatusMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [teamCapacity, setTeamCapacity] = useState("10");
  const [teamCapacityError, setTeamCapacityError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [estimatedStartDate, setEstimatedStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [documentationFile, setDocumentationFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSidebar, setOpenSidebar] = useState<"technologies" | "roles" | null>(null);

  function handleTeamCapacityChange(value: string) {
    setTeamCapacity(value);
    if (!value) {
      setTeamCapacityError("Team capacity is required.");
      return;
    }
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      setTeamCapacityError("Please enter a valid number.");
      return;
    }
    if (parsed < 1) {
      setTeamCapacityError("Team capacity cannot be less than 1.");
      return;
    }
    if (parsed > 20) {
      setTeamCapacityError("Maximum team capacity is 20.");
      return;
    }
    setTeamCapacityError(null);
  }

  function getTimelineError(startDate: string, endDate: string): string | null {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    return end < start ? "Deadline cannot be earlier than Estimated Start." : null;
  }

  const selectedStatusLabel =
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  useEffect(() => {
    function updateStatusMenuPosition() {
      if (!statusTriggerRef.current) return;
      const rect = statusTriggerRef.current.getBoundingClientRect();
      setStatusMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }

    if (!statusMenuOpen) return;

    updateStatusMenuPosition();
    window.addEventListener("resize", updateStatusMenuPosition);
    window.addEventListener("scroll", updateStatusMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateStatusMenuPosition);
      window.removeEventListener("scroll", updateStatusMenuPosition, true);
    };
  }, [statusMenuOpen]);

  useEffect(() => {
    if (!statusMenuOpen) return;
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (statusTriggerRef.current?.contains(target)) return;
      if (statusMenuRef.current?.contains(target)) return;
      setStatusMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [statusMenuOpen]);

  useEffect(() => {
    setTimelineError(getTimelineError(estimatedStartDate, deadline));
  }, [estimatedStartDate, deadline]);

  // Options for multi-select - All technologies
  const allTechOptions = [
    // Programming Languages
    "C", "C++", "C#", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust",
    "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "Perl", "Lua",
    "Objective-C", "Clojure", "Haskell", "Erlang", "Elixir", "F#", "VB.NET",
    "Shell", "Bash", "PowerShell",
    // Frontend Frameworks & Libraries
    "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "Remix", "Gatsby",
    // Backend Frameworks
    "Node.js", "Express", "Fastify", "NestJS", "Koa.js", "Hapi.js",
    // Python Frameworks
    "Django", "Flask", "FastAPI", "Pyramid", "Tornado", "Sanic",
    // Java Frameworks
    "Spring Boot", "Spring", "Quarkus", "Micronaut", "Play Framework",
    // .NET
    ".NET", "ASP.NET", "ASP.NET Core",
    // PHP Frameworks
    "Laravel", "Symfony", "CodeIgniter", "Yii", "Zend Framework",
    // Ruby Frameworks
    "Ruby on Rails", "Sinatra",
    // Go Frameworks
    "Gin", "Echo", "Fiber", "Beego",
    // Rust Frameworks
    "Actix", "Rocket", "Axum",
    // Mobile
    "React Native", "Flutter", "Ionic", "Xamarin",
    // Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "MariaDB", "Cassandra", "Elasticsearch",
    // Cloud & DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins",
    // Other Technologies
    "GraphQL", "REST API", "WebSocket", "Firebase", "Supabase",
    "Tailwind CSS", "Bootstrap", "SASS", "LESS", "Webpack", "Vite", "Parcel",
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence",
    // Additional Technologies
    "Nginx", "Apache", "RabbitMQ", "Apache Kafka", "Prometheus",
  ].sort();

  // Popular technologies (shown by default - top 14)
  const popularTechOptions = [
    "React", "Node.js", "Python", "TypeScript", "Next.js",
    "Vue.js", "JavaScript", "PostgreSQL", "MongoDB", "AWS",
    "Docker", "Express", "Angular", "Django",
  ];

  // All role options
  const allRoleOptions = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "UI Designer", "UX Designer", "UI/UX Designer", "Product Designer",
    "Mobile Developer", "iOS Developer", "Android Developer",
    "DevOps Engineer", "Site Reliability Engineer", "Cloud Engineer",
    "Data Engineer", "Data Scientist", "Machine Learning Engineer", "AI Engineer",
    "QA Engineer", "Test Engineer", "Automation Engineer",
    "Product Manager", "Project Manager", "Technical Product Manager",
    "Software Architect", "Tech Lead", "Engineering Manager",
    "Security Engineer", "Cybersecurity Specialist",
    "Blockchain Developer", "Smart Contract Developer",
    "Game Developer", "Unity Developer", "Unreal Engine Developer",
    "Embedded Systems Engineer", "IoT Developer",
    "Salesforce Developer", "Business Analyst", "Data Analyst",
    "Content Writer", "Technical Writer", "Marketing Specialist",
    "Scrum Master", "Agile Coach", "Business Development",
  ].sort();

  // Popular roles (shown by default - top 8)
  const popularRoleOptions = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "UI Designer", "UX Designer", "Mobile Developer",
    "DevOps Engineer", "Product Manager",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !description) {
      ToastHelper.validation(
        "Missing required fields",
        "Please fill in both project title and description."
      );
      return;
    }

    const parsedCapacity = Number.parseInt(teamCapacity, 10);
    if (Number.isNaN(parsedCapacity) || parsedCapacity < 1 || parsedCapacity > 20) {
      const message =
        parsedCapacity > 20
          ? "Team capacity cannot be greater than 20."
          : "Team capacity must be between 1 and 20.";
      setTeamCapacityError(message);
      ToastHelper.validation("Invalid team capacity", message);
      return;
    }

    const timelineMessage = getTimelineError(estimatedStartDate, deadline);
    if (timelineMessage) {
      setTimelineError(timelineMessage);
      ToastHelper.validation("Invalid timeline", timelineMessage);
      return;
    }
    setTimelineError(null);

    setIsSubmitting(true);
    try {
      const body = {
        title,
        description,
        shortDescription: description.length > 10 ? description.slice(0, 200) : undefined,
        status,
        techStackText: selectedTech.join(", "),
        lookingFor: selectedRoles,
        techStack: selectedTech.length > 0
          ? selectedTech.map((t) => ({
            name: t.trim(),
            category: "other" as const,
          }))
          : [{ name: "Other", category: "other" as const }],
        requiredRoles: selectedRoles.length > 0
          ? selectedRoles.map(() => ({
            role: "other" as const,
            count: 1,
            filled: 0,
          }))
          : [
            {
              role: "other" as const,
              count: 1,
              filled: 0,
            },
          ],
        githubUrl: githubUrl || "",
        liveUrl: liveUrl || "",
        teamCapacity: parsedCapacity,
        estimatedStartDate: estimatedStartDate || undefined,
        deadline: deadline || undefined,
        documentationUrl: documentationUrl || undefined,
        documentationFileName: documentationFile?.name || undefined,
        thumbnailUrl: "",
        tags: [],
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const errorMessage = data?.message || "Failed to create project.";
        throw new Error(errorMessage);
      }

      ToastHelper.show("Project created successfully!", {
        type: "success",
        description: "Your project is now listed and visible to collaborators.",
        position: "top-right",
        duration: 2000,
      });
      router.push("/projects");
      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred while creating the project.";

      ToastHelper.show("Project creation failed", {
        type: "error",
        description:
          errorMessage.toLowerCase().includes("no user")
            ? `${errorMessage} Please log out and sign in again.`
            : errorMessage,
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="container py-10">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="relative py-6 text-center space-y-2">
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-1/2 h-44 w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/12 via-purple-500/10 to-blue-500/12 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-32 w-72 -translate-x-[8%] -translate-y-[42%] rounded-full bg-cyan-400/12 blur-2xl" />
                <div className="absolute left-1/2 top-1/2 h-28 w-64 -translate-x-[82%] -translate-y-[2%] rounded-full bg-purple-500/10 blur-2xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                  Create New Project
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                Start a new project and find collaborators
              </p>
            </div>

            <Card className="bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-400/5 backdrop-blur-xl border border-violet-400/20 rounded-2xl overflow-visible">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Project Details</CardTitle>
                <CardDescription className="text-slate-300">
                  Fill in the details about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
              <form className="space-y-6 relative" onSubmit={handleSubmit}>
                <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-400/5 backdrop-blur-xl p-5 space-y-4">
                  <div className="space-y-2 relative z-[300]">
                    <label className="text-sm font-medium text-slate-200">
                      Project Title <span className="text-red-300">*</span>
                    </label>
                    <Input
                      placeholder="Enter project title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Description <span className="text-red-300">*</span>
                    </label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all duration-200 ease-out resize-none"
                      placeholder="Describe your project..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Status <span className="text-red-300">*</span>
                    </label>
                    <div ref={statusTriggerRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setStatusMenuOpen((prev) => !prev)}
                        className="w-full min-h-[56px] py-4 px-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-violet-400/40 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 outline-none transition-all duration-200 ease-out cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-white text-sm">{selectedStatusLabel}</span>
                        <motion.div
                          animate={{ rotate: statusMenuOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-white/60" />
                        </motion.div>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-400/5 backdrop-blur-xl p-5">
                  <MultiSelectPopover
                    options={allTechOptions}
                    popularOptions={popularTechOptions}
                    selected={selectedTech}
                    onChange={setSelectedTech}
                    placeholder="Click to select technologies..."
                    label="Technologies"
                    required
                    onSidebarOpen={() => setOpenSidebar("technologies")}
                    onSidebarClose={() => setOpenSidebar(null)}
                    isOtherSidebarOpen={openSidebar === "roles"}
                  />
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-400/5 backdrop-blur-xl p-5">
                  <MultiSelectPopover
                    options={allRoleOptions}
                    popularOptions={popularRoleOptions}
                    selected={selectedRoles}
                    onChange={setSelectedRoles}
                    placeholder="Click to select roles..."
                    label="Required Roles"
                    required
                    onSidebarOpen={() => setOpenSidebar("roles")}
                    onSidebarClose={() => setOpenSidebar(null)}
                    isOtherSidebarOpen={openSidebar === "technologies"}
                  />
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-400/5 backdrop-blur-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-violet-200" />
                    <p className="text-sm font-semibold text-white">Team & Timeline</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200 inline-flex items-center gap-2">
                        <Users className="h-4 w-4 text-violet-100" />
                        Team Capacity <span className="text-red-300">*</span>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        placeholder="e.g. 10"
                        value={teamCapacity}
                        onChange={(e) => handleTeamCapacityChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                            e.preventDefault();
                          }
                        }}
                        className="w-full py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      {teamCapacityError && (
                        <p className="text-xs text-red-300">{teamCapacityError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200 inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-white/90" />
                        Estimated Start
                      </label>
                      <div className="relative">
                        <Input
                          ref={startDateInputRef}
                          type="date"
                          value={estimatedStartDate}
                          onChange={(e) => setEstimatedStartDate(e.target.value)}
                          className="w-full py-4 pr-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            startDateInputRef.current?.focus();
                            (startDateInputRef.current as any)?.showPicker?.();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/90 hover:bg-white/10 transition-colors"
                          aria-label="Open estimated start date picker"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200 inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-white/90" />
                        Deadline
                      </label>
                      <div className="relative">
                        <Input
                          ref={deadlineInputRef}
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="w-full py-4 pr-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            deadlineInputRef.current?.focus();
                            (deadlineInputRef.current as any)?.showPicker?.();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/90 hover:bg-white/10 transition-colors"
                          aria-label="Open deadline date picker"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {timelineError && (
                    <p className="text-xs text-red-300">{timelineError}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-400/5 backdrop-blur-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-200" />
                    <p className="text-sm font-semibold text-white">Project Documentation</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Documentation URL
                    </label>
                    <Input
                      placeholder="https://docs.google.com/... or Notion page..."
                      value={documentationUrl}
                      onChange={(e) => setDocumentationUrl(e.target.value)}
                      className="w-full py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-slate-300">
                        Attach document (optional)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => documentationFileInputRef.current?.click()}
                        className="rounded-full px-4 py-2 bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-violet-400/40"
                      >
                        Choose File
                      </Button>
                    </div>
                    <input
                      ref={documentationFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      onChange={(e) => setDocumentationFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {documentationFile && (
                      <p className="text-xs text-slate-400">
                        Selected file: {documentationFile.name}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      File upload is UI-ready. Persistence will be connected to Supabase Storage in the next step.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-400/5 backdrop-blur-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-blue-300" />
                    <p className="text-sm font-semibold text-white">Project Links</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      GitHub URL
                    </label>
                    <Input
                      placeholder="https://github.com/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Live URL
                    </label>
                    <Input
                      placeholder="https://your-app.com"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      className="w-full py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-400 hover:via-purple-400 hover:to-purple-500 hover:shadow-blue-500/30 text-white font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/projects")}
                    className="rounded-full px-6 py-3 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/15 hover:border-purple-500/30 hover:text-purple-300 text-slate-300 transition-all duration-300 ease-out"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {statusMenuOpen &&
            typeof window !== "undefined" &&
            createPortal(
              <>
                <div className="fixed inset-0 z-[9998] bg-transparent" />
                <div
                  ref={statusMenuRef}
                  className="fixed z-[9999] rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/50 p-2"
                  style={{
                    top: `${statusMenuPosition.top}px`,
                    left: `${statusMenuPosition.left}px`,
                    width: `${statusMenuPosition.width || 0}px`,
                  }}
                >
                  {STATUS_OPTIONS.map((option) => {
                    const selected = status === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setStatus(option.value);
                          setStatusMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-left text-sm flex items-center justify-between transition-all duration-150 ${
                          selected
                            ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white border border-violet-400/30"
                            : "text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span>{option.label}</span>
                        {selected && <Check className="h-4 w-4 text-violet-200" />}
                      </button>
                    );
                  })}
                </div>
              </>,
              document.body
          )}
        </div>
        </div>
      </main>
      </div>
    </div>
  );
}

