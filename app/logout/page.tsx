"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    signOut(auth).then(() => {
      router.push("/auth/login");
    });
  }, []);

  return <p className="p-4">Logging out…</p>;
}
