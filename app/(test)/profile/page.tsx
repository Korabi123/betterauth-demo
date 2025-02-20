// import { UserButton } from "@/components/auth/user-button";
"use client";

import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
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
        <Button onClick={() => authClient.signOut()}>
          Logout
        </Button>
      </>
    );
  }

  console.log(data?.user.name);

  return (
    // <div>
    //   <span>{data?.user.name}</span>
    // </div>
    <UserButton user={data?.user} />
  );
}

export default ProfilePage;
