"use client";

import { UserButton } from "@/components/auth/user-button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const ProfilePage = () => {
  const { data } = authClient.useSession();
  // const blabla = session.data

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
    // <div>
    //   <span>{data?.user.name}</span>
    // </div>
    <UserButton user={data?.user} session={data?.session} />
  );
}

export default ProfilePage;
