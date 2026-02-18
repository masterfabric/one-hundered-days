"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Github, Linkedin, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        console.log("[Header] Loading user session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Header] Session error:", sessionError);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log("[Header] Session:", session ? "Found" : "Not found", session?.user?.id);

        if (session?.user) {
          console.log("[Header] User found:", session.user.id);
          setUser(session.user);
          
          // Load user profile (optional - don't block if profile doesn't exist)
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("id, username, full_name, avatar_url")
              .eq("id", session.user.id)
              .single();

            if (!profileError && profileData) {
              console.log("[Header] Profile loaded:", (profileData as UserProfile).username);
              setProfile(profileData as UserProfile);
            } else {
              console.log("[Header] Profile not found, using user metadata");
              // If profile doesn't exist, create a minimal profile object from user data
              setProfile({
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "user",
                full_name: session.user.user_metadata?.full_name || null,
                avatar_url: session.user.user_metadata?.avatar_url || null,
              });
            }
          } catch (profileErr) {
            console.error("[Header] Profile load error:", profileErr);
            // Still show user even if profile fails
            setProfile({
              id: session.user.id,
              username: session.user.email?.split("@")[0] || "user",
              full_name: session.user.user_metadata?.full_name || null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
            });
          }
        } else {
          console.log("[Header] No user session");
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("[Header] Error loading user:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
        console.log("[Header] Loading complete");
      }
    }

    // Initial load
    loadUser();

    // Listen for profile updates (custom event from profile page)
    const handleProfileUpdate = async () => {
      console.log("[Header] Profile updated event received");
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Reload profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", session.user.id)
            .single();

          if (!profileError && profileData) {
            console.log("[Header] Profile reloaded after update:", profileData.username);
            setProfile(profileData as UserProfile);
          }
        } catch (profileErr) {
          console.error("[Header] Profile reload error:", profileErr);
        }
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdate);

    // Listen for auth changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Header] Auth state changed:", event, session?.user?.id);
      
      if (session?.user) {
        console.log("[Header] User signed in:", session.user.id);
        setUser(session.user);
        setLoading(false);
        
        // Reload profile when auth state changes
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", session.user.id)
            .single();

          if (!profileError && profileData) {
            console.log("[Header] Profile reloaded:", (profileData as UserProfile).username);
            setProfile(profileData as UserProfile);
          } else {
            console.log("[Header] Profile reload failed, using metadata");
            // Fallback to user metadata
            setProfile({
              id: session.user.id,
              username: session.user.email?.split("@")[0] || "user",
              full_name: session.user.user_metadata?.full_name || null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
            });
          }
        } catch (profileErr) {
          console.error("[Header] Profile reload error:", profileErr);
          setProfile({
            id: session.user.id,
            username: session.user.email?.split("@")[0] || "user",
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
          });
        }
      } else {
        console.log("[Header] User signed out");
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isEmoji = profile?.avatar_url?.startsWith("👨") || 
                  profile?.avatar_url?.startsWith("👩") || 
                  profile?.avatar_url?.startsWith("🧑") ||
                  false;

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex h-16 items-center justify-end pr-6">
        {/* User Actions - Aligned to the right edge */}
        <div className="flex items-center gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-4 mr-2 border-r border-slate-800/60 pr-4">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="GitHub"
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#0A66C2] transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="LinkedIn"
            >
              <Linkedin size={20} className="fill-current" />
            </motion.a>
          </div>

          {!loading && (
            <>
              {user ? (
                <>
                  {/* User Avatar and Profile Link */}
                  <Link href="/profile">
                    <motion.div
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded-lg hover:bg-slate-800/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-slate-700 shadow-lg">
                        {profile?.avatar_url && !isEmoji ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.username || user.email || "User"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">{profile?.avatar_url || "🧑‍💻"}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {profile?.full_name || profile?.username || user.email?.split("@")[0] || "User"}
                      </span>
                    </motion.div>
                  </Link>

                  {/* Logout Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-transparent hover:border-red-500/30"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Çıkış Yap</span>
                  </Button>
                </>
              ) : (
                <>
                  {/* Login and Register Buttons - Only show when NOT logged in */}
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="hover:bg-slate-800/50">
                      Giriş Yap
                    </Button>
                  </Link>

                  <Link href="/register">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20">
                      Kayıt Ol
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
