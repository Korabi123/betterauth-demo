import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

export const ErrorCard = ({ error, size = "md" }: { error: string, size?: "sm" | "md" | "lg" }) => {
  return (
    <div className={cn("rounded-lg bg-red-500/10 text-sm text-red-500 border-red-500/30 my-4 border-[1px]", {
      "p-2": size === "sm",
      "p-4": size === "md",
      "p-6": size === "lg",
    })}>
      <span className="flex items-center gap-2">
        <TriangleAlert className="h-4 w-4" />
        {error}
      </span>
    </div>
  )
};
