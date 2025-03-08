"use client";

import { UserButton } from "@/components/auth/user-button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

const ProfilePage = () => {
  const { data } = authClient.useSession();

  if (!data) {
    return (
      <Skeleton className="size-[44px] border-black/60 rounded-full" />
    );
  }

  return (
    // @ts-expect-error Just a simple type error
    <UserButton user={data?.user} session={data?.session} />
  );
}

export default ProfilePage;
