"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import { FaGithub } from "react-icons/fa";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/lib/auth-client";

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
import { Eye, EyeOff, GithubIcon, Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorCard } from "./error-card";
import { AFTER_LOGIN, AFTER_REGISTER } from "@/routes";
import { FcGoogle } from "react-icons/fc";

const formSchema = z.object({
  name: z.string().min(4),
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterCard = ({
  showSocial = true,
}: {
  showSocial?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const params = useSearchParams();
  const redirectParam = params.get("redirect");

  const router = useRouter();

  const toggleVisibility = () => setIsPasswordVisible((prevState) => !prevState);

  const [animateRef] = useAutoAnimate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        setIsLoading(false);
        if (redirectParam) {
          router.push(new URL(redirectParam).pathname);
        } else {
          router.push(AFTER_LOGIN);
        }
      },
      onError: (ctx) => {
        setError(ctx.error.message);
        setIsLoading(false);
      }
    });
  };

  const onGithub = async () => {
    authClient.signIn.social({
      provider: "github",
      callbackURL: redirectParam ? new URL(redirectParam).pathname : "/profile"
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: (ctx) => {
        setError(ctx.error.message);
        setIsLoading(false);
      }
    });
  };

  const onGoogle = async () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: redirectParam ? new URL(redirectParam).pathname : "/profile"
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: (ctx) => {
        setIsLoading(false);
        setError(ctx.error.message);
      }
    });
  };

  return (
    <CardWrapper
      title="Sign up to Acme co"
      description="Welcome! Please sign up to continue."
      footerRef={redirectParam ? "loginWithRedirect" : "login"}
      param={redirectParam!}
      ref={animateRef}
    >
      {showSocial && (
        <>
          <div className="flex items-center gap-2">
            <Button
              disabled={isLoading}
              onClick={onGithub}
              variant={"outline"}
              className="w-full shadow-sm border-[1.5px] text-zinc-500 font-[450]"
              type="button"
              size="sm"
            >
              <span>
                <FaGithub className="text-black text-lg" />
              </span>
              Github
            </Button>
            <Button
              disabled={isLoading}
              onClick={onGoogle}
              variant={"outline"}
              className="w-full shadow-sm border-[1.5px] text-zinc-500 font-[450]"
              type="button"
              size="sm"
            >
              <span>
                <FcGoogle />
              </span>
              Google
            </Button>
          </div>
          <div className="relative my-4 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              or
            </span>
          </div>
        </>
      )}
      <div ref={animateRef}>{error && <ErrorCard error={error} />}</div>
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          ref={animateRef}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
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
                        <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
                      ) : (
                        <Eye size={16} strokeWidth={2} aria-hidden="true" />
                      )}
                    </button>
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
            {!isLoading && "Sign Up"}
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
        </form>
      </Form>
    </CardWrapper>
  );
};
