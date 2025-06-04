import { ResetPasswordCard } from "@/components/auth/reset-password";
import { Suspense } from "react";

const ResetPasswordPage = () => {
  return (
    <div className="h-[100vh] z-50 w-full flex flex-col items-center justify-center">
      <Suspense>
        <ResetPasswordCard />
      </Suspense>
    </div>
  );
}

export default ResetPasswordPage;
