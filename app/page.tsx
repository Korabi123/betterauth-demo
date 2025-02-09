import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <h1 className="text-5xl font-medium mb-4">BetterAuth Demo</h1>
      <Link href="/login">
        <Button>Login</Button>
      </Link>
    </div>
  );
}
