import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

type FeatureGateResult = {
  planCode: string;
  planName: string;
  projectLimit: number;
  advancedFilters: boolean;
  priorityVisibility: boolean;
  analyticsEnabled: boolean;
  isPremium: boolean;
};

function db() {
  return (supabaseAdmin || supabaseServer) as any;
}

async function getFreePlan() {
  const client = db();
  const { data } = await client
    .from("subscription_plans")
    .select("id, code, name, project_limit, advanced_filters, priority_visibility, analytics_enabled")
    .eq("code", "free")
    .eq("is_active", true)
    .maybeSingle();

  return data || {
    id: null,
    code: "free",
    name: "Free",
    project_limit: 3,
    advanced_filters: false,
    priority_visibility: false,
    analytics_enabled: false,
  };
}

export async function getUserFeatureGates(userId: string): Promise<FeatureGateResult> {
  const client = db();
  const freePlan = await getFreePlan();

  const { data: activeSubscription } = await client
    .from("user_subscriptions")
    .select("plan_id, status, current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!activeSubscription?.plan_id) {
    return {
      planCode: freePlan.code,
      planName: freePlan.name,
      projectLimit: Number(freePlan.project_limit || 3),
      advancedFilters: Boolean(freePlan.advanced_filters),
      priorityVisibility: Boolean(freePlan.priority_visibility),
      analyticsEnabled: Boolean(freePlan.analytics_enabled),
      isPremium: false,
    };
  }

  const { data: plan } = await client
    .from("subscription_plans")
    .select("code, name, project_limit, advanced_filters, priority_visibility, analytics_enabled")
    .eq("id", activeSubscription.plan_id)
    .maybeSingle();

  if (!plan) {
    return {
      planCode: freePlan.code,
      planName: freePlan.name,
      projectLimit: Number(freePlan.project_limit || 3),
      advancedFilters: Boolean(freePlan.advanced_filters),
      priorityVisibility: Boolean(freePlan.priority_visibility),
      analyticsEnabled: Boolean(freePlan.analytics_enabled),
      isPremium: false,
    };
  }

  return {
    planCode: plan.code,
    planName: plan.name,
    projectLimit: Number(plan.project_limit || 3),
    advancedFilters: Boolean(plan.advanced_filters),
    priorityVisibility: Boolean(plan.priority_visibility),
    analyticsEnabled: Boolean(plan.analytics_enabled),
    isPremium: plan.code !== "free",
  };
}

