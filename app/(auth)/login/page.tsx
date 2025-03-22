import { LoginCard } from "@/components/auth/login-card";
import { headers } from "next/headers";

const LoginPage = async () => {
  const header = await headers();
  const ip = header.get("x-forwarded-for");

  console.log("ip: ", ip);

  return (
    <div className="h-[100vh] z-50 w-full flex flex-col items-center justify-center">
      <LoginCard ip={ip!} />
    </div>
  );
}

export default LoginPage;
