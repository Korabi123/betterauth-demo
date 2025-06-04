"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CardWrapper } from "./card-wrapper";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { ErrorCard } from "./error-card";

import { useSearchParams } from "next/navigation";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const ResetPasswordCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const params = useSearchParams();
  const redirectParam = params.get("redirect");

  const token = params.get("token");

  const router = useRouter();

  const toggleVisibility = () =>
    setIsPasswordVisible((prevState) => !prevState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  if (!token) {
    redirect("/login");
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    authClient.resetPassword({
      newPassword: data.password,
      token,
    }, {
      onError: (ctx) => {
        setError(ctx.error.message);
        setIsLoading(false);
      },
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        toast.success("Password reset successfully.");
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
    });
  };

  const [animateRef] = useAutoAnimate();

  return (
    <CardWrapper
      title="Reset Password"
      description="Enter your new password below."
      footerRef={redirectParam ? "registerWithRedirect" : "register"}
      param={redirectParam!}
      ref={animateRef}
    >
      <div ref={animateRef}>{error && <ErrorCard error={error} />}</div>
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 flex flex-col"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div>
                    <div className="relative">
                      <Input
                        {...field}
                        autoCorrect="off"
                        autoComplete="off"
                        disabled={isLoading}
                        type={isPasswordVisible ? "text" : "password"}
                        className="pe-9"
                      />
                      <button
                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label={
                          isPasswordVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isPasswordVisible}
                        aria-controls="password"
                      >
                        {isPasswordVisible ? (
                          <EyeOff
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        ) : (
                          <Eye size={16} strokeWidth={2} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            effect={"ringHover"}
            size="sm"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 hover:ring-blue-600 shadow-inner"
            type="submit"
            ref={animateRef}
          >
            {isLoading && (
              <Loader className="text-center ml-3 animate-spin text-white size-4 mr-3" />
            )}
            {!isLoading && "Reset password"}
            {!isLoading && (
              <svg className="mt-2 text-white/50 -ml-1">
                <path
                  fill="currentColor"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="m7.25 5-3.5-2.25v4.5L7.25 5Z"
                ></path>
              </svg>
            )}
          </Button>
          <Button
            type="button"
            size={"sm"}
            variant={"link"}
            disabled={isLoading}
            className="mt-2 text-sm self-center text-blue-500 after:bg-blue-600 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-1 focus-visible:border-ring/20 transition-all"
            onClick={() => router.push("/login")}
            effect={"hoverUnderline"}
          >
            Back to login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
