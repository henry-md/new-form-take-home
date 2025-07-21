"use client";

import { Input } from "@/components/ui/input";
import useUserEmail from "@/hooks/use-test";

export default function Home() {
  const { email, loading, error } = useUserEmail("Henry");

  return (
    <div className="flex flex-col items-center justify-center h-screen w-[600px] p-0 mx-auto">
      <div>Email: {loading ? "Loading..." : error ? error : email}</div>
      <Input />
    </div>
  );
}
