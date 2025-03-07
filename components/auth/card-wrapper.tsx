"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "../ui/button";

export const CardWrapper = ({
  children,
  title,
  description,
  hasLogo = false,
  logoSrc,
  footerRef,
  param,
  ref
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  hasLogo?: boolean;
  logoSrc?: string;
  footerRef?: "login" | "register" | "registerWithRedirect" | "loginWithRedirect";
  param?: string;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  return (
    <Card ref={ref} className="md:w-[400px] w-full">
      <CardHeader className="text-center">
        {hasLogo && (
          <img
            src={logoSrc}
            className="rounded-full size-14 self-center mb-4"
            alt="Logo"
            width={100}
            height={100}
          />
        )}
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-8 shadow-sm rounded-b-2xl border-slate-300/50 border-b-[2px]">
        {children}
      </CardContent>
      <CardFooter className="flex justify-center border-t-slate-200/10 bg-gray-200/30 p-4 py-[6px] rounded-b-2xl">
        {footerRef === "login" && (
          <span className="text-muted-foreground/70 text-sm">
            Already have an account?{" "}
            <Button
              type="button"
              size={"sm"}
              variant={"link"}
              className="px-1 leading-4 text-[14px] font-[400px] text-blue-500 after:bg-blue-600 hover:text-blue-600"
              onClick={() => window.location.replace("/login")}
              effect={"hoverUnderline"}
            >
              Sign In
            </Button>
          </span>
        )}
        {footerRef === "register" && (
          <span className="text-muted-foreground/70 text-sm">
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              size={"sm"}
              variant={"link"}
              className="px-1 leading-4 text-[14px] font-[400px] text-blue-500 after:bg-blue-600 hover:text-blue-600"
              onClick={() => window.location.replace("/sign-up")}
              effect={"hoverUnderline"}
            >
              Sign Up
            </Button>
          </span>
        )}
        {footerRef === "registerWithRedirect" && (
          <span className="text-muted-foreground/70 text-sm">
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              size={"sm"}
              variant={"link"}
              className="px-1 leading-4 text-[14px] font-[400px] text-blue-500 after:bg-blue-600 hover:text-blue-600"
              onClick={() =>
                window.location.replace(
                  `/sign-up?redirect=${encodeURIComponent(param!)}`
                )
              }
              effect={"hoverUnderline"}
            >
              Sign Up
            </Button>
          </span>
        )}
        {footerRef === "loginWithRedirect" && (
          <span className="text-muted-foreground/70 text-sm">
            Already have an account?{" "}
            <Button
              type="button"
              size={"sm"}
              variant={"link"}
              className="px-1 leading-4 text-[14px] font-[400px] text-blue-500 after:bg-blue-600 hover:text-blue-600"
              onClick={() =>
                window.location.replace(
                  `/login?redirect=${encodeURIComponent(param!)}`
                )
              }
              effect={"hoverUnderline"}
            >
              Sign In
            </Button>
          </span>
        )}
      </CardFooter>
    </Card>
  );
};
