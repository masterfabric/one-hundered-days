"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastHelper } from "@/lib/toastHelper";

type RequestStatus = "pending" | "accepted" | "rejected" | null;

interface ProjectRequestButtonProps {
  projectId: string;
  initialStatus: RequestStatus;
}

function getStatusLabel(status: RequestStatus): string {
  if (status === "pending") return "Request Pending";
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Request Again";
  return "Request to Join";
}

export function ProjectRequestButton({ projectId, initialStatus }: ProjectRequestButtonProps) {
  const [status, setStatus] = useState<RequestStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequest() {
    if (status === "pending" || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/project-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        const errorMessage = payload?.message || "Could not send join request.";
        ToastHelper.show("Request failed", {
          type: "error",
          description: errorMessage,
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      setStatus("pending");
      ToastHelper.show("Request sent", {
        type: "success",
        description: "Project owner can now review your request.",
        position: "top-right",
        duration: 2000,
      });
    } catch {
      ToastHelper.show("Request failed", {
        type: "error",
        description: "Unexpected error while sending join request.",
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const disabled = isLoading || status === "pending" || status === "accepted";

  return (
    <Button
      type="button"
      onClick={handleRequest}
      disabled={disabled}
      className="rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 hover:from-blue-400 hover:via-violet-400 hover:to-purple-400 text-white shadow-lg shadow-violet-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          {getStatusLabel(status)}
        </>
      )}
    </Button>
  );
}
