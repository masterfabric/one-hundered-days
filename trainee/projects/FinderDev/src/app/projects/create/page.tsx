"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { motion } from "framer-motion";

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSidebar, setOpenSidebar] = useState<"technologies" | "roles" | null>(null);

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
    setError(null);

    if (!title || !description) {
      setError("Title ve description zorunlu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        title,
        description,
        shortDescription: description.length > 10 ? description.slice(0, 200) : undefined,
        status: "idea",
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
        throw new Error(data?.message || "Failed to create project");
      }

      // Başarılı ise projeler sayfasına dön
      router.push("/projects");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Proje oluşturulurken hata oluştu."
      );
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
          <div className="container py-10">
          <div className="max-w-2xl mx-auto space-y-6 relative">
            {/* Başlık */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                  Create New Project
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                Start a new project and find collaborators
              </p>
            </div>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-visible">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Project Details</CardTitle>
                <CardDescription className="text-slate-400">
                  Fill in the details about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
              <form className="space-y-6 relative" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Project Title
                  </label>
                  <Input
                    placeholder="Enter project title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all duration-200 ease-out resize-none"
                    placeholder="Describe your project..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                {/* Technologies Selection */}
                <MultiSelectPopover
                  options={allTechOptions}
                  popularOptions={popularTechOptions}
                  selected={selectedTech}
                  onChange={setSelectedTech}
                  placeholder="Click to select technologies..."
                  label="Technologies"
                  onSidebarOpen={() => setOpenSidebar("technologies")}
                  onSidebarClose={() => setOpenSidebar(null)}
                  isOtherSidebarOpen={openSidebar === "roles"}
                />

                {/* Roles Selection */}
                <MultiSelectPopover
                  options={allRoleOptions}
                  popularOptions={popularRoleOptions}
                  selected={selectedRoles}
                  onChange={setSelectedRoles}
                  placeholder="Click to select roles..."
                  label="Role"
                  onSidebarOpen={() => setOpenSidebar("roles")}
                  onSidebarClose={() => setOpenSidebar(null)}
                  isOtherSidebarOpen={openSidebar === "technologies"}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
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
                  <label className="text-sm font-medium text-slate-300">
                    Live URL
                  </label>
                  <Input
                    placeholder="https://your-app.com"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400"
                  >
                    <p className="font-semibold mb-1">Error creating project</p>
                    <p>{error}</p>
                    {error.includes("kayıtlı kullanıcı yok") && (
                      <p className="mt-2 text-red-300">
                        You need to set up your profile first.{" "}
                        Please contact support or try logging out and back in.
                      </p>
                    )}
                  </motion.div>
                )}

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
        </div>
        </div>
      </main>
      </div>
    </div>
  );
}

