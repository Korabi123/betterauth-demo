import { RegisterCard } from "@/components/auth/register-card";
import { Suspense } from "react";

const SignUpPage = () => {
  return (
    <div className="h-[100vh] z-50 w-full flex flex-col items-center justify-center">
      <Suspense>
        <RegisterCard />
      </Suspense>
    </div>
  );
}

export default SignUpPage;
