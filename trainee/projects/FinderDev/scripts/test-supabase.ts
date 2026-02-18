// Test script for Supabase connection
// Run with: npx ts-node --esm scripts/test-supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("Testing Supabase connection...");
console.log("URL:", supabaseUrl);
console.log("Key exists:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    // Test 1: Check profiles
    console.log("\n--- Testing profiles table ---");
    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .limit(5);

    if (profileError) {
        console.error("Profile error:", profileError);
    } else {
        console.log("Profiles found:", profiles?.length || 0);
        console.log("Profiles:", profiles);
    }

    // Test 2: Check projects
    console.log("\n--- Testing projects table ---");
    const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .limit(5);

    if (projectError) {
        console.error("Project error:", projectError);
    } else {
        console.log("Projects found:", projects?.length || 0);
        console.log("Projects:", projects);
    }
}

test().catch(console.error);
