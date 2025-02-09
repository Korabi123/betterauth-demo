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
import { GithubIcon, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorCard } from "./error-card";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginCard = ({
  showSocial = true,
}: {
  showSocial?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    authClient.signIn.email({
      email: data.email,
      password: data.password,
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        setIsLoading(false);
        router.push("/success");
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
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        setIsLoading(false);
        router.push("/success");
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
    }, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        setIsLoading(false);
        router.push("/success");
      },
      onError: (ctx) => {
        setError(ctx.error.message);
        setIsLoading(false);
      }
    });
  };

  return (
    <CardWrapper
      title="Sign In to Acme co"
      description="Welcome back! Please sign in to continue."
      footerRef="register"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={isLoading}
                    placeholder="Your email"
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
                  <Input
                    type="password"
                    disabled={isLoading}
                    placeholder="********"
                    {...field}
                  />
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
        </form>
      </Form>
    </CardWrapper>
  );
};
