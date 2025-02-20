/* eslint-disable @typescript-eslint/no-unused-vars */
// BetterAuth config file

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, token, url }, request) => {
      await resend.emails.send({
        to: user.email,
        from: 'no-reply@korabimeri.work.gd',
        subject: 'Reset your password',
        text: `Click here to reset your password: ${url}`,
      });
    }
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token, url }, request) => {
      await resend.emails.send({
        to: user.email,
        from: 'no-reply@korabimeri.work.gd',
        subject: 'Verify your email',
        text: `Click here to verify your email: ${url}`,
      });
    }
  },
});
