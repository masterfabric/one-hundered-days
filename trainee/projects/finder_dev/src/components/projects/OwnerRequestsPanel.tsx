"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Check, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToastHelper } from "@/lib/toastHelper";

type PendingRequest = {
  id: string;
  requester_profile_id: string;
  requester_name: string;
  requester_label: string;
  message: string | null;
  created_at: string;
};

interface OwnerRequestsPanelProps {
  projectId: string;
  initialRequests: PendingRequest[];
}

export function OwnerRequestsPanel({ projectId, initialRequests }: OwnerRequestsPanelProps) {
  const [requests, setRequests] = useState<PendingRequest[]>(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingCount = useMemo(() => requests.length, [requests.length]);

  async function reviewRequest(requestId: string, status: "accepted" | "rejected") {
    setLoadingId(requestId);
    try {
      const response = await fetch(`/api/project-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        ToastHelper.show("Request update failed", {
          type: "error",
          description: payload?.message || "Could not update request status.",
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      setRequests((prev) => prev.filter((item) => item.id !== requestId));
      ToastHelper.show(status === "accepted" ? "Request accepted" : "Request rejected", {
        type: "success",
        description: "Request list is updated.",
        position: "top-right",
        duration: 2000,
      });
    } catch {
      ToastHelper.show("Request update failed", {
        type: "error",
        description: "Unexpected error while updating request.",
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm uppercase tracking-wider text-slate-300 inline-flex items-center gap-2">
          <Bell className="h-4 w-4 text-violet-200" />
          Pending Requests
        </h3>
        <Badge className="bg-violet-500/15 text-violet-200 border-violet-400/30 hover:bg-violet-500/15">
          {pendingCount} pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-slate-400">No pending requests for this project.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const isBusy = loadingId === request.id;
            return (
              <div
                key={request.id}
                className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/profile/${request.requester_profile_id}`}
                      className="text-sm font-medium text-white hover:text-violet-200 transition-colors"
                    >
                      {request.requester_name}
                    </Link>
                    <p className="text-xs text-slate-400">{request.requester_label}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-slate-300">
                  {request.message?.trim() || "No message provided."}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => reviewRequest(request.id, "accepted")}
                    className="rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white"
                  >
                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span className="ml-1">Accept</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => reviewRequest(request.id, "rejected")}
                    className="rounded-full border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                  >
                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    <span className="ml-1">Reject</span>
                  </Button>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-slate-500">
            Notifications for requests are shown here until the global notifications center is connected.
          </p>
        </div>
      )}
    </div>
  );
}
