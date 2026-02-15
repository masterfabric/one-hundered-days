
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });

async function seed() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseRoleKey) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseRoleKey);

    console.log("Seeding database...");

    // 1. Create a user/profile
    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: "demo@finderdev.com",
        password: "password123",
    });

    let userId = user?.id;

    if (authError || !userId) {
        console.log("User might already exist, trying login...");
        const { data: loginData } = await supabase.auth.signInWithPassword({
            email: "demo@finderdev.com",
            password: "password123",
        });
        userId = loginData.user?.id;
    }

    if (!userId) {
        console.error("Failed to get user ID");
        return;
    }

    console.log("User ID:", userId);

    // Ensure profile exists (if triggers didn't run)
    const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        username: "demouser",
        full_name: "Demo User",
        avatar_url: "https://github.com/shadcn.png",
    });

    if (profileError) console.error("Profile Error:", profileError);

    // 2. Create Projects
    const projects = [
        {
            title: "E-Commerce Dashboard",
            description: "A comprehensive dashboard for managing online stores using Next.js and Supabase.",
            status: "in_progress",
            owner_id: userId,
            repo_url: "https://github.com/demo/ecommerce",
            demo_url: "https://demo-ecommerce.com",
        },
        {
            title: "Social Media Analytics",
            description: "Analyze social media trends with AI-powered insights. Looking for data scientists.",
            status: "open",
            owner_id: userId,
            repo_url: "https://github.com/demo/analytics",
        },
        {
            title: "Fitness Tracker App",
            description: "Mobile app for tracking workouts and nutrition. Built with React Native.",
            status: "completed",
            owner_id: userId,
            demo_url: "https://fitness-app.com",
        },
    ];

    for (const project of projects) {
        const { error } = await supabase.from("projects").upsert(project, { onConflict: "title" }); // Simple dedup by title
        if (error) console.error("Error creating project:", project.title, error);
        else console.log("Created project:", project.title);
    }

    console.log("Seeding complete!");
}

seed().catch(console.error);
