import { FlickeringGrid } from "@/components/magicui/flickering-grid";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <FlickeringGrid
        className="absolute inset-0 z-0 size-full bg-black/30"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
      />
      {children}
    </div>
  );
}
