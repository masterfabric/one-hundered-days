"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";

type RequestStatus = "pending" | "accepted" | "rejected";

type RequestRow = {
  id: string;
  project_id: string;
  status: RequestStatus;
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type ProjectLookup = {
  id: string;
  title: string | null;
  status: string | null;
};

function statusClasses(status: RequestStatus): string {
  if (status === "accepted") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  }
  if (status === "rejected") {
    return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  }
  return "bg-amber-500/15 text-amber-200 border-amber-400/30";
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [projectsById, setProjectsById] = useState<Record<string, ProjectLookup>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = "/login";
          return;
        }

        const userId = session.user.id;

        const { data: requestRows, error: requestError } = await supabase
          .from("project_requests")
          .select("id, project_id, status, message, created_at, reviewed_at")
          .eq("requester_id", userId)
          .order("created_at", { ascending: false });

        if (requestError) {
          throw requestError;
        }

        const safeRequests = ((requestRows as RequestRow[] | null) || []).filter(
          (row) => row.status === "pending" || row.status === "accepted" || row.status === "rejected"
        );

        const projectIds = Array.from(new Set(safeRequests.map((row) => row.project_id).filter(Boolean)));
        let lookup: Record<string, ProjectLookup> = {};

        if (projectIds.length > 0) {
          const { data: projects, error: projectsError } = await supabase
            .from("projects")
            .select("id, title, status")
            .in("id", projectIds);

          if (projectsError) {
            throw projectsError;
          }

          lookup = ((projects as ProjectLookup[] | null) || []).reduce<Record<string, ProjectLookup>>(
            (acc, project) => {
              acc[project.id] = project;
              return acc;
            },
            {}
          );
        }

        if (!cancelled) {
          setRequests(safeRequests);
          setProjectsById(lookup);
        }
      } catch (err) {
        console.error("[MyRequestsPage] load failed:", err);
        if (!cancelled) {
          setError("Your requests could not be loaded. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === "pending").length,
      accepted: requests.filter((r) => r.status === "accepted").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };
  }, [requests]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Sidebar />
      <Header />
      <div className="flex flex-1 relative">
        <main className="flex-1 transition-all duration-300">
          <div className="container py-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
                  My Requests
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                {requests.length} total • {summary.pending} pending • {summary.accepted} accepted • {summary.rejected} rejected
              </p>
            </div>

            {loading && (
              <div className="rounded-xl border border-slate-800/50 bg-white/5 p-6 text-center">
                <p className="text-slate-300">Loading your requests...</p>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
                <p className="text-rose-300">{error}</p>
              </div>
            )}

            {!loading && !error && requests.length === 0 && (
              <div className="rounded-xl border border-slate-800/50 bg-white/5 p-8 text-center">
                <h2 className="text-xl font-semibold text-white mb-2">No requests yet</h2>
                <p className="text-slate-400 mb-5">
                  Browse projects and send your first join request.
                </p>
                <Button
                  asChild
                  className="rounded-full px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-400 hover:via-purple-400 hover:to-purple-500 text-white"
                >
                  <Link href="/projects">Browse Projects</Link>
                </Button>
              </div>
            )}

            {!loading && !error && requests.length > 0 && (
              <div className="grid gap-4">
                {requests.map((request) => {
                  const project = projectsById[request.project_id];
                  const projectTitle = project?.title || "Project";

                  return (
                    <div
                      key={request.id}
                      className="rounded-xl border border-slate-800/50 bg-white/5 backdrop-blur-sm p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className="text-white font-semibold truncate">{projectTitle}</p>
                          <p className="text-xs text-slate-400">
                            Requested: {new Date(request.created_at).toLocaleString()}
                            {request.reviewed_at ? ` • Reviewed: ${new Date(request.reviewed_at).toLocaleString()}` : ""}
                          </p>
                        </div>
                        <Badge className={statusClasses(request.status)}>
                          {request.status}
                        </Badge>
                      </div>

                      {request.message?.trim() && (
                        <p className="mt-3 text-sm text-slate-300">
                          {request.message}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        >
                          <Link href={`/projects/${request.project_id}`}>
                            View Project
                            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
