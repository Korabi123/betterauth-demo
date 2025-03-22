import { User } from "@prisma/client";
import { PasswordSection } from "./password-section";
import { TwoFactorSection } from "./two-factor-section";
import { PasskeySection } from "./passkey-section";
import { ConnectionsSection } from "./connections-section";

export const SecuritySection = ({
  user,
}: {
  user: User;
}) => {
  return (
    <div className="flex md:flex-row flex-col md:gap-0 gap-8 py-3 w-full">
      <p className="text-sm font-medium pointer-events-none">Security</p>
      <div className="flex w-full md:items-end flex-col gap-10">
        <PasswordSection />
        <TwoFactorSection user={user} />
        <PasskeySection />
        <ConnectionsSection user={user} />
      </div>
    </div>
  );
}
