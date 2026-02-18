"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  techStack: string[];
  owner: {
    name: string;
    avatar?: string;
  };
  requiredRoles: string[];
}

// Status badge renklendirme fonksiyonu
function getStatusBadgeStyles(status: string): { base: string; hover: string } {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case "idea":
      return {
        base: "bg-blue-900/30 text-blue-400 border-blue-500/20",
        hover: "hover:bg-blue-900/50 hover:border-blue-500/40 hover:text-blue-300"
      };
    case "planning":
      return {
        base: "bg-purple-900/30 text-purple-400 border-purple-500/20",
        hover: "hover:bg-purple-900/50 hover:border-purple-500/40 hover:text-purple-300"
      };
    case "recruiting":
      return {
        base: "bg-orange-900/30 text-orange-400 border-orange-500/20",
        hover: "hover:bg-orange-900/50 hover:border-orange-500/40 hover:text-orange-300"
      };
    case "in_progress":
      return {
        base: "bg-yellow-900/30 text-yellow-500 border-yellow-500/20",
        hover: "hover:bg-yellow-900/50 hover:border-yellow-500/40 hover:text-yellow-400"
      };
    case "completed":
      return {
        base: "bg-green-900/30 text-green-500 border-green-500/20",
        hover: "hover:bg-green-900/50 hover:border-green-500/40 hover:text-green-400"
      };
    case "on_hold":
      return {
        base: "bg-slate-900/30 text-slate-400 border-slate-500/20",
        hover: "hover:bg-slate-900/50 hover:border-slate-500/40 hover:text-slate-300"
      };
    case "cancelled":
      return {
        base: "bg-red-900/30 text-red-500 border-red-500/20",
        hover: "hover:bg-red-900/50 hover:border-red-500/40 hover:text-red-400"
      };
    default:
      return {
        base: "bg-slate-900/30 text-slate-400 border-slate-500/20",
        hover: "hover:bg-slate-900/50 hover:border-slate-500/40 hover:text-slate-300"
      };
  }
}

// Status metnini formatla
function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ProjectCard({
  id,
  title,
  description,
  status,
  techStack,
  owner,
  requiredRoles,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full"
      >
        <Card className="h-full transition-all duration-300 ease-out cursor-pointer rounded-xl border-slate-800/50 bg-white/5 backdrop-blur-sm hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="line-clamp-1 font-bold text-lg mb-2">
                  {title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              </div>
              <Badge 
                className={`${getStatusBadgeStyles(status).base} ${getStatusBadgeStyles(status).hover} border shrink-0 transition-all duration-200 ease-out cursor-default`}
              >
                {formatStatus(status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Technologies */}
              {techStack && techStack.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                    Technologies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {techStack.slice(0, 6).map((tech) => (
                      <Badge 
                        key={tech} 
                        variant="outline" 
                        className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {techStack.length > 6 && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                        +{techStack.length - 6}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Required Roles */}
              {requiredRoles && requiredRoles.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                    Role
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {requiredRoles.slice(0, 6).map((role) => (
                      <Badge 
                        key={role} 
                        variant="secondary" 
                        className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 transition-colors"
                      >
                        {role.replace(/_/g, " ")}
                      </Badge>
                    ))}
                    {requiredRoles.length > 6 && (
                      <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                        +{requiredRoles.length - 6}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={owner.avatar} />
                <AvatarFallback className="text-xs">
                  {owner.name[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                {owner.name}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              Detayları Gör →
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}

