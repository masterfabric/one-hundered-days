"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastHelper } from "@/lib/toastHelper";

interface OwnerProjectActionsProps {
  projectId: string;
  projectStatus: string;
}

export function OwnerProjectActions({ projectId, projectStatus }: OwnerProjectActionsProps) {
  const router = useRouter();
  const [isFinishing, setIsFinishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCompleted = projectStatus?.toLowerCase() === "completed";

  async function handleFinishProject() {
    if (isCompleted || isFinishing) return;
    setIsFinishing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        ToastHelper.show("Project could not be finished", {
          type: "error",
          description: payload?.message || "Completion rules were not met.",
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      ToastHelper.show("Project marked as completed", {
        type: "success",
        description: "This project now counts as completed.",
        position: "top-right",
        duration: 2000,
      });
      router.refresh();
    } catch {
      ToastHelper.show("Project could not be finished", {
        type: "error",
        description: "Unexpected error while updating project status.",
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsFinishing(false);
    }
  }

  async function handleDeleteProject() {
    if (isDeleting) return;
    const approved = window.confirm(
      "This will permanently delete the project and related requests/memberships. Continue?"
    );
    if (!approved) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        ToastHelper.show("Project could not be deleted", {
          type: "error",
          description: payload?.message || "Delete action failed.",
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      ToastHelper.show("Project deleted", {
        type: "success",
        description: "The project was removed successfully.",
        position: "top-right",
        duration: 2000,
      });
      router.push("/projects");
      router.refresh();
    } catch {
      ToastHelper.show("Project could not be deleted", {
        type: "error",
        description: "Unexpected error while deleting project.",
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={handleFinishProject}
        disabled={isCompleted || isFinishing}
        className="rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white disabled:opacity-70"
      >
        {isFinishing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
        )}
        {isCompleted ? "Completed" : "Finish Project"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleDeleteProject}
        disabled={isDeleting}
        className="rounded-full border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 mr-1.5" />
        )}
        Delete
      </Button>
    </div>
  );
}
