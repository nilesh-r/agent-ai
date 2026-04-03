"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { User } from "@/types";


const navItems = [
  { href: "/", label: "Agent Control", icon: "smart_toy" },
  { href: "/profile", label: "Profile", icon: "person" },
  { href: "/jobs", label: "Jobs", icon: "work" },
  { href: "/emails", label: "Emails", icon: "mail" },
  { href: "/code", label: "Code AI", icon: "terminal" },
  { href: "/logs", label: "Activity Logs", icon: "history" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe("");
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = () => {
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full flex flex-col w-[240px] bg-surface-dim z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0f131c] text-xl">
                terminal
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#dfe2ee] tracking-tight">
                Sovereign AI
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#c0c1ff] font-semibold">
                Career Agent Active
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            <AnimatePresence>
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                    onClose?.();
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold tracking-tight transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-[#c0c1ff] bg-surface-container-highest shadow-sm shadow-[#c0c1ff]/5"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <motion.span 
                    className="material-symbols-outlined text-xl"
                    whileHover={{ scale: 1.1, rotate: [-5, 5, 0] }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="text-sm">{item.label}</span>
                  {isActive(item.href) && (
                    <motion.div 
                      layoutId="active-nav-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c0c1ff] shadow-[0_0_8px_rgba(192,193,255,0.6)]" 
                    />
                  )}
                </motion.a>
              ))}
            </AnimatePresence>

            <div className="pt-2 border-t border-[#31353e]/50 mt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-semibold tracking-tight transition-colors duration-200 text-left"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span className="text-sm">Sign Out</span>
              </motion.button>
            </div>
          </nav>
        </div>

        {/* User Info */}
        <div className="mt-auto p-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#31353e] flex items-center justify-center text-[10px] font-bold text-[#c0c1ff]">
              {user ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">
                {user ? user.name : "Loading..."}
              </p>
              <p className="text-[10px] text-[#908fa0] truncate">
                {user ? user.email : "agent@sovereign"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
