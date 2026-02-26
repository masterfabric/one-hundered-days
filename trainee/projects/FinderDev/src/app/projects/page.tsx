"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type StatusFilter = "all" | "idea" | "planning" | "in_progress" | "completed";

export default function ProjectsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [techSearchQuery, setTechSearchQuery] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  const handleSearch = () => {
    // Arama terimini set et - bu ProjectsGrid'deki useEffect'i tetikleyecek
    const trimmedQuery = searchInput.trim();
    setSearchQuery(trimmedQuery);
    // Filtre menüsü açıksa kapat
    if (showFilters) {
      setShowFilters(false);
    }
    console.log("ProjectsPage: Search triggered with query:", trimmedQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    // Eğer "All" seçildiyse, diğer filtreleri de temizle
    if (status === "all") {
      setSelectedTech([]);
      setSelectedRole([]);
    }
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setSelectedTech([]);
    setSelectedRole([]);
  };

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "idea", label: "Idea" },
    { value: "planning", label: "Planning" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const techOptions = [
    // Programming Languages
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C#",
    "C++",
    "C",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Dart",
    "PHP",
    "Ruby",
    "Scala",
    "R",
    "MATLAB",
    "Perl",
    "Haskell",
    "Elixir",
    "Erlang",
    "Clojure",
    "F#",
    "Objective-C",
    "Lua",
    "Shell",
    "PowerShell",
    
    // Frontend Frameworks & Libraries
    "React",
    "Vue.js",
    "Angular",
    "Svelte",
    "Next.js",
    "Nuxt.js",
    "Gatsby",
    "Remix",
    "Astro",
    "Solid.js",
    "Ember.js",
    "Backbone.js",
    "jQuery",
    "Bootstrap",
    "Tailwind CSS",
    "Material-UI",
    "Chakra UI",
    "Ant Design",
    "Styled Components",
    "Sass",
    "Less",
    "Webpack",
    "Vite",
    "Parcel",
    "Rollup",
    
    // Backend Frameworks
    "Node.js",
    "Express",
    "NestJS",
    "Fastify",
    "Koa",
    "Django",
    "Flask",
    "FastAPI",
    "Spring",
    "Spring Boot",
    "Laravel",
    "Symfony",
    "CodeIgniter",
    "Ruby on Rails",
    "Sinatra",
    "ASP.NET",
    "ASP.NET Core",
    "Phoenix",
    "Gin",
    "Echo",
    "Fiber",
    "Actix",
    "Rocket",
    
    // Mobile Development
    "React Native",
    "Flutter",
    "Ionic",
    "Xamarin",
    "NativeScript",
    "Cordova",
    "PhoneGap",
    "SwiftUI",
    "Jetpack Compose",
    
    // Game Engines
    "Unity",
    "Unreal Engine",
    "Godot",
    "CryEngine",
    "GameMaker Studio",
    "Construct",
    "Phaser",
    "PixiJS",
    "Three.js",
    "Babylon.js",
    "Cocos2d",
    "LibGDX",
    
    // Databases
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "MariaDB",
    "Oracle",
    "SQL Server",
    "Cassandra",
    "CouchDB",
    "Neo4j",
    "Elasticsearch",
    "DynamoDB",
    "Firebase",
    "Supabase",
    "PlanetScale",
    "CockroachDB",
    "InfluxDB",
    "TimescaleDB",
    
    // Cloud & DevOps
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Terraform",
    "Ansible",
    "Jenkins",
    "GitLab CI",
    "GitHub Actions",
    "CircleCI",
    "Travis CI",
    "Vagrant",
    "Puppet",
    "Chef",
    "Prometheus",
    "Grafana",
    "ELK Stack",
    "Splunk",
    
    // AI & Machine Learning
    "TensorFlow",
    "PyTorch",
    "Keras",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "OpenCV",
    "Hugging Face",
    "Jupyter",
    "MLflow",
    "Weights & Biases",
    "Apache Spark",
    "Apache Kafka",
    
    // Web3 & Blockchain
    "Solidity",
    "Web3.js",
    "Ethers.js",
    "Hardhat",
    "Truffle",
    "Foundry",
    "Ethereum",
    "Polygon",
    "Solana",
    "IPFS",
    "The Graph",
    
    // API & Tools
    "GraphQL",
    "REST API",
    "gRPC",
    "WebSocket",
    "Socket.io",
    "Apollo",
    "Prisma",
    "TypeORM",
    "Sequelize",
    "Mongoose",
    "Drizzle",
    "tRPC",
    
    // Testing
    "Jest",
    "Mocha",
    "Cypress",
    "Playwright",
    "Selenium",
    "Puppeteer",
    "Vitest",
    "Testing Library",
    "JUnit",
    "Pytest",
    
    // Other Tools & Technologies
    "Git",
    "GitHub",
    "GitLab",
    "Bitbucket",
    "Jira",
    "Confluence",
    "Figma",
    "Adobe XD",
    "Sketch",
    "Postman",
    "Insomnia",
    "Vercel",
    "Netlify",
    "Heroku",
    "Railway",
    "Render",
    "Cloudflare",
    "Nginx",
    "Apache",
    "Linux",
    "Windows",
    "macOS",
    "Ubuntu",
    "Debian",
    "CentOS",
  ];

  // Duplicate'leri temizle (güvenlik için)
  const uniqueTechOptions = Array.from(new Set(techOptions));

  // Başlangıçta sadece ilk 5 teknolojiyi göster
  const initialTechOptions = uniqueTechOptions.slice(0, 5);
  
  // Arama sorgusuna göre filtrele
  const filteredTechOptions = techSearchQuery
    ? uniqueTechOptions.filter(tech => 
        tech.toLowerCase().includes(techSearchQuery.toLowerCase())
      )
    : (showAllTech ? uniqueTechOptions : initialTechOptions);
  
  const displayedTechOptions = filteredTechOptions;

  const roleOptions = [
    // Development Roles
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "iOS Developer",
    "Android Developer",
    "React Native Developer",
    "Flutter Developer",
    "Game Developer",
    "Unity Developer",
    "Unreal Engine Developer",
    "Web Developer",
    "Desktop Application Developer",
    "Embedded Systems Developer",
    "Firmware Developer",
    "API Developer",
    "Blockchain Developer",
    "Smart Contract Developer",
    "Web3 Developer",
    "Solidity Developer",
    
    // Design Roles
    "UI Designer",
    "UX Designer",
    "UX/UI Designer",
    "Product Designer",
    "Graphic Designer",
    "Visual Designer",
    "Interaction Designer",
    "Motion Designer",
    "3D Designer",
    "Game Designer",
    "Level Designer",
    "Character Designer",
    "UI/UX Researcher",
    "Design System Designer",
    "Brand Designer",
    "Illustrator",
    
    // Engineering & Architecture
    "Software Engineer",
    "Senior Software Engineer",
    "Lead Software Engineer",
    "Principal Engineer",
    "Software Architect",
    "System Architect",
    "Cloud Architect",
    "Solution Architect",
    "Enterprise Architect",
    "DevOps Engineer",
    "Site Reliability Engineer (SRE)",
    "Platform Engineer",
    "Infrastructure Engineer",
    "Security Engineer",
    "Cybersecurity Engineer",
    "Penetration Tester",
    "Security Analyst",
    "Network Engineer",
    "Database Administrator",
    "Database Engineer",
    
    // Data & AI/ML
    "Data Scientist",
    "Data Engineer",
    "Data Analyst",
    "Business Intelligence Analyst",
    "Machine Learning Engineer",
    "MLOps Engineer",
    "AI Engineer",
    "Deep Learning Engineer",
    "Computer Vision Engineer",
    "NLP Engineer",
    "Data Architect",
    "Big Data Engineer",
    "Analytics Engineer",
    
    // Product & Management
    "Product Manager",
    "Senior Product Manager",
    "Product Owner",
    "Technical Product Manager",
    "Product Designer",
    "Product Marketing Manager",
    "Project Manager",
    "Technical Project Manager",
    "Program Manager",
    "Engineering Manager",
    "Engineering Director",
    "CTO",
    "VP of Engineering",
    "Head of Engineering",
    
    // QA & Testing
    "QA Engineer",
    "QA Automation Engineer",
    "Test Engineer",
    "Software Tester",
    "Manual Tester",
    "Performance Test Engineer",
    "Security Tester",
    "Test Architect",
    "QA Lead",
    "Quality Assurance Manager",
    
    // Content & Documentation
    "Technical Writer",
    "Technical Documentation Writer",
    "Content Writer",
    "Technical Content Creator",
    "Developer Advocate",
    "Developer Relations",
    "Technical Evangelist",
    "Technical Marketing",
    
    // Agile & Process
    "Scrum Master",
    "Agile Coach",
    "Product Owner",
    "Release Manager",
    "Change Manager",
    
    // Business & Analysis
    "Business Analyst",
    "Technical Business Analyst",
    "Systems Analyst",
    "Requirements Analyst",
    "Product Analyst",
    "Data Analyst",
    "Financial Analyst",
    "Operations Analyst",
    
    // Specialized Roles
    "Blockchain Developer",
    "Smart Contract Developer",
    "Cryptocurrency Developer",
    "AR/VR Developer",
    "AR Developer",
    "VR Developer",
    "IoT Developer",
    "Embedded Developer",
    "Firmware Engineer",
    "Hardware Engineer",
    "Robotics Engineer",
    "Automation Engineer",
    
    // Consulting & Freelance
    "Technical Consultant",
    "Software Consultant",
    "IT Consultant",
    "Freelance Developer",
    "Contract Developer",
    "Independent Contractor",
    
    // Leadership & Strategy
    "Engineering Lead",
    "Tech Lead",
    "Team Lead",
    "Development Lead",
    "Architecture Lead",
    "Platform Lead",
    "Engineering Director",
    "Head of Product",
    "Head of Design",
    "Head of Data",
    
    // Support & Operations
    "Technical Support Engineer",
    "Customer Success Engineer",
    "Solutions Engineer",
    "Sales Engineer",
    "Pre-Sales Engineer",
    "Implementation Engineer",
    "Integration Engineer",
    "Support Engineer",
    
    // Research & Innovation
    "Research Engineer",
    "Research Scientist",
    "Innovation Engineer",
    "R&D Engineer",
    "Algorithm Engineer",
    
    // Other Specialized
    "Performance Engineer",
    "Scalability Engineer",
    "Reliability Engineer",
    "Compliance Engineer",
    "Accessibility Engineer",
    "SEO Engineer",
    "Growth Engineer",
    "Marketing Engineer",
  ];

  // Duplicate'leri temizle (güvenlik için)
  const uniqueRoleOptions = Array.from(new Set(roleOptions));

  // Başlangıçta sadece ilk 5 rolü göster
  const initialRoleOptions = uniqueRoleOptions.slice(0, 5);
  
  // Arama sorgusuna göre filtrele
  const filteredRoleOptions = roleSearchQuery
    ? uniqueRoleOptions.filter(role => 
        role.toLowerCase().includes(roleSearchQuery.toLowerCase())
      )
    : (showAllRoles ? uniqueRoleOptions : initialRoleOptions);
  
  const displayedRoleOptions = filteredRoleOptions;

  const handleTechToggle = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRole((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const hasActiveFilters = statusFilter !== "all" || selectedTech.length > 0 || selectedRole.length > 0;
  
  // Aktif filtre sayısını hesapla
  const activeFilterCount = [
    statusFilter !== "all" ? 1 : 0,
    selectedTech.length,
    selectedRole.length
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="container py-10">
          <div className="mb-8 space-y-6">
            {/* Başlık */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                  Browse Projects
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover projects looking for collaborators
              </p>
            </div>

            {/* Arama Çubuğu ve Butonlar */}
            <div className="mx-auto max-w-3xl w-[768px]">
              <div className="flex items-center justify-between gap-3 w-full flex-nowrap">
                {/* Search Input Container */}
                <div className="relative flex-1 group min-w-0">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-400 transition-colors duration-200 ease-out z-10">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Search projects by title or description..."
                    className="w-full pl-12 pr-28 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {/* Search Button inside input */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 flex-nowrap">
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleClearSearch}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 ease-out text-muted-foreground hover:text-white flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    )}
                    <Button
                      onClick={handleSearch}
                      className="group rounded-full px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-400 hover:via-purple-400 hover:to-purple-500 hover:shadow-blue-500/30 hover:translate-y-0 text-white font-medium transition-all duration-300 ease-out w-[140px] flex-shrink-0 justify-center"
                    >
                      <Search className="h-4 w-4 mr-2 transition-transform duration-300 ease-out group-hover:scale-110" />
                      Search
                    </Button>
                  </div>
                </div>

                {/* Filters Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`group rounded-full px-6 py-4 border-white/10 backdrop-blur-sm hover:bg-white/15 hover:border-purple-500/30 hover:text-purple-300 hover:shadow-blue-500/30 hover:translate-y-0 transition-all duration-300 ease-out relative flex-shrink-0 w-auto min-w-[120px] justify-center ${
                    hasActiveFilters 
                      ? "bg-purple-500/20 border-purple-500/30 text-purple-300" 
                      : "bg-white/5"
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2 transition-transform duration-300 ease-out group-hover:rotate-12" />
                  Filters
                  {hasActiveFilters && activeFilterCount > 0 && (
                    <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-500/50">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>

              {/* Filters Menu */}
              <AnimatePresence mode="wait">
                {showFilters && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-6 h-auto max-h-[500px] overflow-y-auto w-full max-w-3xl"
                  >
                    {/* Status Filter */}
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                        Filter by Status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {filterOptions.map((option) => {
                          // "All" sadece hiçbir filtre seçili değilse aktif
                          const isAll = option.value === "all";
                          const hasAnyFilter = statusFilter !== "all" || selectedTech.length > 0 || selectedRole.length > 0;
                          const isActive = isAll 
                            ? (statusFilter === "all" && !hasAnyFilter)
                            : (statusFilter === option.value);
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleStatusFilter(option.value)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center ${
                                isActive
                                  ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technologies Filter */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                          Technologies
                        </p>
                        {techSearchQuery && (
                          <button
                            onClick={() => setTechSearchQuery("")}
                            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      
                      {/* Search Bar for Technologies */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Search className="h-4 w-4" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Search technologies..."
                          value={techSearchQuery}
                          onChange={(e) => {
                            setTechSearchQuery(e.target.value);
                            // Arama yapıldığında otomatik olarak tüm teknolojileri göster
                            if (e.target.value && !showAllTech) {
                              setShowAllTech(true);
                            }
                          }}
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 text-sm"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        {displayedTechOptions.length > 0 ? (
                          displayedTechOptions.map((tech) => {
                            const isActive = selectedTech.includes(tech);
                            return (
                              <button
                                key={tech}
                                onClick={() => handleTechToggle(tech)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center ${
                                  isActive
                                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                                    : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                }`}
                              >
                                {tech}
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-sm text-slate-400 py-2">
                            No technologies found matching &quot;{techSearchQuery}&quot;
                          </p>
                        )}
                        {!techSearchQuery && (
                          <button
                            onClick={() => setShowAllTech(!showAllTech)}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-400 hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          >
                            {showAllTech ? "Show Less" : "See All"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Role Filter */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                          Role
                        </p>
                        {roleSearchQuery && (
                          <button
                            onClick={() => setRoleSearchQuery("")}
                            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      
                      {/* Search Bar for Roles */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Search className="h-4 w-4" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Search roles..."
                          value={roleSearchQuery}
                          onChange={(e) => {
                            setRoleSearchQuery(e.target.value);
                            // Arama yapıldığında otomatik olarak tüm rolleri göster
                            if (e.target.value && !showAllRoles) {
                              setShowAllRoles(true);
                            }
                          }}
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 ease-out text-white placeholder:text-white/40 text-sm"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        {displayedRoleOptions.length > 0 ? (
                          displayedRoleOptions.map((role) => {
                            const isActive = selectedRole.includes(role);
                            return (
                              <button
                                key={role}
                                onClick={() => handleRoleToggle(role)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 min-w-[120px] justify-center ${
                                  isActive
                                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-md shadow-pink-500/50"
                                    : "bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                }`}
                              >
                                {role}
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-sm text-slate-400 py-2">
                            No roles found matching &quot;{roleSearchQuery}&quot;
                          </p>
                        )}
                        {!roleSearchQuery && (
                          <button
                            onClick={() => setShowAllRoles(!showAllRoles)}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex-shrink-0 bg-white/5 text-slate-300 border border-white/10 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-600/20 hover:text-blue-400 hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          >
                            {showAllRoles ? "Show Less" : "See All"}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Query Display */}
              {searchQuery && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground mt-4 text-center"
                >
                  Searching for: <span className="text-blue-400 font-medium">&quot;{searchQuery}&quot;</span>
                </motion.p>
              )}
            </div>
          </div>
          <ProjectsGrid 
            searchQuery={searchQuery} 
            statusFilter={statusFilter}
            selectedTech={selectedTech}
            selectedRole={selectedRole}
            onClearFilters={handleClearFilters}
          />
          </div>
        </main>
      </div>
    </div>
  );
}

