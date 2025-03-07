"use client";

import { UserButton } from "@/components/auth/user-button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const ProfilePage = () => {
  const { data } = authClient.useSession();

  if (!data) {
    return (
      <>
        <Link href="/login">
          <p>Login</p>
        </Link>
      </>
    );
  }

  data?.user.twoFactorEnabled

  console.log(data?.user.name);

  return (
    // @ts-expect-error Just a simple type error
    <UserButton user={data?.user} session={data?.session} />
  );
}

export default ProfilePage;
