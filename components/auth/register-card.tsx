"use client";

import { FaGoogle } from "react-icons/fa";

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
    >
      {showSocial && (
        <>
          <div className="flex items-center gap-2">
            <Button
              disabled={isLoading}
              onClick={onGithub}
              variant={"outline"}
              className="w-full shadow-sm border-[1.5px]"
              type="button"
            >
              <span>
                <GithubIcon />
              </span>
              Github
            </Button>
            <Button
              disabled={isLoading}
              onClick={onGoogle}
              variant={"outline"}
              className="w-full shadow-sm border-[1.5px]"
              type="button"
            >
              <span>
                <FaGoogle />
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
      {error && <ErrorCard error={error} />}
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    {...field}
                  />
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
                  <Input
                    type="email"
                    disabled={isLoading}
                    {...field}
                  />
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
          <Button disabled={isLoading} className="w-full" type="submit">
            {isLoading && <Loader className="animate-spin text-muted-foreground size-4 mr-3" />}
            Sign Up
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
