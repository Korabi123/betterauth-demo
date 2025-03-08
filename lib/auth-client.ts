import { twoFactorClient } from "better-auth/plugins";
import { passkeyClient } from "better-auth/plugins/passkey";
import { multiSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  plugins: [
    twoFactorClient(),
    passkeyClient(),
    multiSessionClient(),
  ]
});
