import { TriangleAlert } from "lucide-react";

export const ErrorCard = ({ error }: { error: string }) => {
  return (
    <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border-red-500/30 my-4 border-[1px]">
      <span className="flex items-center gap-2">
        <TriangleAlert className="h-4 w-4" />
        {error}
      </span>
    </div>
  )
};
