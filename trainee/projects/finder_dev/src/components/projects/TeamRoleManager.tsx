"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ToastHelper } from "@/lib/toastHelper";

type TeamRole = "leader" | "co_leader" | "member";

type TeamMemberRoleRow = {
  userId: string;
  displayName: string;
  currentRole: TeamRole;
};

interface TeamRoleManagerProps {
  projectId: string;
  members: TeamMemberRoleRow[];
}

export function TeamRoleManager({ projectId, members }: TeamRoleManagerProps) {
  const [memberRoles, setMemberRoles] = useState<TeamMemberRoleRow[]>(members);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  async function updateRole(userId: string, teamRole: TeamRole) {
    setBusyUserId(userId);
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamRole }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        ToastHelper.show("Role update failed", {
          type: "error",
          description: payload?.message || "Could not update member role.",
          position: "top-right",
          duration: 2000,
        });
        return;
      }

      setMemberRoles((prev) =>
        prev.map((member) =>
          member.userId === userId ? { ...member, currentRole: teamRole } : member
        )
      );
      ToastHelper.show("Role updated", {
        type: "success",
        description: "Team permission role is updated.",
        position: "top-right",
        duration: 2000,
      });
    } catch {
      ToastHelper.show("Role update failed", {
        type: "error",
        description: "Unexpected error while updating member role.",
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setBusyUserId(null);
    }
  }

  if (memberRoles.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-sm uppercase tracking-wider text-slate-300 mb-3">Team Roles</h3>
      <div className="space-y-2">
        {memberRoles.map((member) => {
          const isBusy = busyUserId === member.userId;
          return (
            <div
              key={member.userId}
              className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-3 flex items-center justify-between gap-3"
            >
              <p className="text-sm text-white truncate">{member.displayName}</p>
              <div className="inline-flex items-center gap-2">
                {isBusy && <Loader2 className="h-3.5 w-3.5 text-slate-300 animate-spin" />}
                <select
                  value={member.currentRole}
                  disabled={isBusy}
                  onChange={(e) => updateRole(member.userId, e.target.value as TeamRole)}
                  className="rounded-full bg-slate-900 border border-slate-600 px-3 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  <option value="member">Member</option>
                  <option value="co_leader">Co-Leader</option>
                  <option value="leader">Leader</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

