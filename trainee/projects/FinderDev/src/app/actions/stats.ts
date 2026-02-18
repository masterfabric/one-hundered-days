"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { AppError, HttpStatus } from "@/lib/utils/errors";

/**
 * Get homepage statistics
 */
export async function getHomeStats() {
    try {
        // Get total developers count
        const { count: developersCount, error: devError } = await supabaseServer
            .from("profiles")
            .select("*", { count: "exact", head: true });

        if (devError) {
            console.error("Error fetching developers count:", devError);
        }

        // Get total projects count
        const { count: projectsCount, error: projError } = await supabaseServer
            .from("projects")
            .select("*", { count: "exact", head: true });

        if (projError) {
            console.error("Error fetching projects count:", projError);
        }

        // Get total collaborations (project_members with accepted status)
        const { count: collaborationsCount, error: collabError } = await supabaseServer
            .from("project_members")
            .select("*", { count: "exact", head: true })
            .eq("status", "accepted");

        if (collabError) {
            console.error("Error fetching collaborations count:", collabError);
        }

        return {
            success: true,
            data: {
                developers: developersCount || 0,
                projects: projectsCount || 0,
                collaborations: collaborationsCount || 0,
                // Satisfaction is calculated/static for now
                satisfaction: 98,
            },
        };
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return {
            success: false,
            data: {
                developers: 0,
                projects: 0,
                collaborations: 0,
                satisfaction: 98,
            },
        };
    }
}
