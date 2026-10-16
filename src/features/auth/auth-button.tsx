"use client";

import { LayoutDashboard, LogIn, LogOut, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";

export interface AuthButtonProps {
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export function AuthButton({ size = "sm", variant = "outline", className }: AuthButtonProps) {
  const { configured, loading, user, profile, signInWithGoogle, signOut } = useAuth();
  const [showLocalInfo, setShowLocalInfo] = useState(false);

  if (!configured) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={() => setShowLocalInfo(true)}
        >
          <LogIn className="h-3.5 w-3.5" />
          Masuk dengan Google
        </Button>
        <Dialog open={showLocalInfo} onOpenChange={setShowLocalInfo}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cloud belum dikonfigurasi — Mode Lokal</DialogTitle>
              <DialogDescription className="leading-relaxed">
                Semua fitur gim tetap berjalan, tetapi progres hanya tersimpan di browser
                ini. Untuk mengaktifkan Google SSO, sinkronisasi lintas perangkat, dan
                papan peringkat, isi kredensial Supabase pada file <code>.env</code> —
                panduan langkah demi langkah ada di <strong>README → Setup Cloud</strong>.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (loading) {
    return <div className={cn("h-8 w-28 animate-pulse rounded-md bg-muted", className)} />;
  }

  if (!user) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => void signInWithGoogle()}
      >
        <LogIn className="h-3.5 w-3.5" />
        Masuk dengan Google
      </Button>
    );
  }

  const displayName = profile?.startupName ?? profile?.fullName ?? user.email ?? "Pendiri";
  const avatar = profile?.founderAvatar ?? "🧑‍💻";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <span className="text-base leading-none">{avatar}</span>
          <span className="max-w-28 truncate text-[11px] font-medium">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="text-[12px] font-semibold">{displayName}</div>
          <div className="truncate text-[10.5px] font-normal text-muted-foreground">
            {user.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="gap-2">
            <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard Kelas
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/leaderboard" className="gap-2">
            <Trophy className="h-3.5 w-3.5" /> Papan Peringkat
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/onboarding" className="gap-2">
            <UserRound className="h-3.5 w-3.5" /> Profil Startup
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void signOut()}
          className="gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-3.5 w-3.5" /> Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
