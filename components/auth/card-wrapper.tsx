"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export const CardWrapper = ({
  children,
  title,
  description,
  hasLogo = false,
  logoSrc,
  footerRef,
  param,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  hasLogo?: boolean;
  logoSrc?: string;
  footerRef?: "login" | "register" | "registerWithRedirect" | "loginWithRedirect";
  param?: string;
}) => {
  return (
    <Card className="md:w-[400px] w-full">
      <CardHeader className="text-center">
        {hasLogo && <Image src={logoSrc!} alt="Logo" width={100} height={100} />}
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-8 shadow-sm rounded-b-2xl border-slate-300/50 border-b-[2px]">{children}</CardContent>
      <CardFooter className="flex justify-center border-t-slate-200/10 bg-gray-200/30 p-4 rounded-b-2xl">
        {footerRef === "login" && (
          <span className="text-muted-foreground/70 text-sm">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-blue-500 hover:text-blue-600 hover:underline transition-all">
                Sign in
              </span>
            </Link>
          </span>
        )}
        {footerRef === "register" && (
          <span className="text-muted-foreground/70 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up">
              <span className="text-blue-500 hover:text-blue-600 hover:underline transition-all">
                Sign up
              </span>
            </Link>
          </span>
        )}
        {footerRef === "registerWithRedirect" && (
          <span className="text-muted-foreground/70 text-sm">
            Don&apos;t have an account?{" "}
            <Link href={`/sign-up?redirect=${encodeURIComponent(param!)}`}>
              <span className="text-blue-500 hover:text-blue-600 hover:underline transition-all">
                Sign up
              </span>
            </Link>
          </span>
        )}
        {footerRef === "loginWithRedirect" && (
          <span className="text-muted-foreground/70 text-sm">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(param!)}`}>
              <span className="text-blue-500 hover:text-blue-600 hover:underline transition-all">
                Sign in
              </span>
            </Link>
          </span>
        )}
      </CardFooter>
    </Card>
  );
};
