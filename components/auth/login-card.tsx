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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, GithubIcon, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorCard } from "./error-card";
import { AFTER_LOGIN } from "@/routes";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { useSearchParams } from "next/navigation";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

const verifySchema = z.object({
  otp: z.string().min(6, {
    message: "Code must be 6 digits long",
  }),
});

export const LoginCard = ({
  showSocial = true,
  ip,
}: {
  showSocial?: boolean;
  ip?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailState, setEmailState] = useState("");
  const [isVerifyOtpBoxOpen, setIsVerifyOtpBoxOpen] = useState(false);
  const params = useSearchParams();
  const redirectParam = params.get("redirect");

  const router = useRouter();

  const toggleVisibility = () =>
    setIsPasswordVisible((prevState) => !prevState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setEmailState(form.getValues().email);
    console.log(emailState);

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async (ctx) => {
          if (ctx.data.twoFactorRedirect) {
            setError("");
            setIsVerifyOtpBoxOpen(true);
            setIsLoading(false);
          } else {
            setIsLoading(false);
            if (redirectParam) {
              router.push(new URL(redirectParam).pathname);
            } else {
              router.push(AFTER_LOGIN);
            }
          }
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  const onGithub = async () => {
    authClient.signIn.social(
      {
        provider: "github",
        callbackURL: redirectParam ? new URL(redirectParam).pathname : "/profile",
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  const onGoogle = async () => {
    authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirectParam ? new URL(redirectParam).pathname : "/profile",
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  const onVerifyOtpSubmit = async (data: z.infer<typeof verifySchema>) => {
    await authClient.twoFactor.verifyTotp(
      {
        code: data.otp,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
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
        },
      }
    );
  };

  const onPasskeyLogin = async () => {
    await authClient.signIn.passkey(
      {},
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
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
        },
      }
    );
  };

  return (
    <CardWrapper
      title="Sign In to Acme co"
      description="Welcome back! Please sign in to continue."
      footerRef={redirectParam ? "registerWithRedirect" : "register"}
      param={redirectParam!}
    >
      {!isVerifyOtpBoxOpen ? (
        <>
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
              className="space-y-8 flex flex-col"
            >
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
                            isPasswordVisible
                              ? "Hide password"
                              : "Show password"
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading && (
                  <Loader className="animate-spin text-muted-foreground size-4 mr-3" />
                )}
                Sign In
              </Button>
              <Button
                type="button"
                size={"sm"}
                variant={"ghost"}
                className="mt-2 text-sm self-center hover:bg-white text-blue-500 hover:text-blue-600 hover:underline focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-1 focus-visible:border-ring/20 transition-all"
                onClick={onPasskeyLogin}
              >
                Use passkey instead
              </Button>
            </form>
          </Form>
        </>
      ) : (
        <>
          {error && <ErrorCard size="sm" error={error} />}
          <Form {...verifyForm}>
            <form className="space-y-6 flex flex-col items-center justify-center">
              <FormField
                control={verifyForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP disabled={isLoading} maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSeparator className="mx-1 text-zinc-600" />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Enter the code in your authenticator app.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                size={"sm"}
                type="button"
                disabled={isLoading}
                className="mt-4 w-full"
                onClick={() => {
                  onVerifyOtpSubmit({ otp: verifyForm.getValues().otp });
                }}
              >
                {isLoading && (
                  <Loader className="mr-1 size-2 text-muted-foreground animate-spin" />
                )}
                Continue
              </Button>
            </form>
          </Form>
        </>
      )}
    </CardWrapper>
  );
};
