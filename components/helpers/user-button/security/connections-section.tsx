"use client";

import axios from "axios";
import { ErrorCard } from "@/components/auth/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { User } from "@prisma/client";
import { Account } from "better-auth";
import { ArrowRight, Ellipsis, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export const ConnectionsSection = ({
  user,
}: {
  user: User;
}) => {
  const [animate] = useAutoAnimate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Account[]>([]);
  const [isDeleteConnectionBoxOpen, setIsDeleteConnectionBoxOpen] = useState<"github" | "google" | "closed">("closed");

  useEffect(() => {
    const getConnections = async () => {
      await authClient
        .listAccounts({}, {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
          },
          onError: (ctx) => {
            alert(ctx.error.message);
            setIsLoading(false);
          }
        })
        // @ts-expect-error Just a simple type error
        .then((res) => setConnections(res.data));
    };
    getConnections();
  }, []);

  const onGithubDelete = async () => {
    setIsLoading(true);

    setTimeout(async () => {
      await axios
        .delete("/api/connections/delete/github")
        .catch((error) => {
          setError(error.response.data.message);
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoading(false);
          setIsDeleteConnectionBoxOpen("closed");
          window.location.reload();
        });
    }, 1000);
  }

  const onGoogleDelete = async () => {
    setIsLoading(true);

    setTimeout(async () => {
      await axios
        .delete("/api/connections/delete/google")
        .catch((error) => {
          setError(error.response.data.message);
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoading(false);
          setIsDeleteConnectionBoxOpen("closed");
          window.location.reload();
        });
    })
  }

  return (
    <div className="flex md:w-[72%] flex-col gap-10">
      <div
        ref={animate}
        className="flex md:flex-row flex-col md:gap-0 gap-8 justify-between"
      >
        <p className="text-sm font-medium">Connected Accounts</p>
        <div
          ref={animate}
          className="flex flex-col gap-1 md:items-end md:w-[350px] md:ml-0 ml-4"
        >
          {error && (
            <ErrorCard className="w-full -mt-2" size="sm" error={error} />
          )}
          {connections.map((connection) => {
            // @ts-expect-error Just a simple type error
            const provider: string = connection.provider;
            const formattedProvider =
              provider.charAt(0).toUpperCase() + provider.slice(1);

            return (
              <div
                key={connection.id}
                ref={animate}
                className="min-w-[350px] -mt-1"
              >
                <div className="flex items-center gap-4">
                  <div
                    key={connection.id}
                    className={cn(
                      "flex items-center justify-between -mt-2 gap-4",
                      provider === "credential" && "hidden"
                    )}
                  >
                    <div className={cn("flex items-center gap-2")}>
                      {provider === "google" && <FcGoogle size={18} />}
                      {provider === "github" && <FaGithub size={18} />}
                      <p className="text-sm">{formattedProvider}</p>
                      <p className="text-sm text-zinc-500">•</p>
                      <p className="text-sm text-zinc-500/85">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className={cn(
                        "inline-flex ml-auto",
                        provider === "credential" && "hidden"
                      )}
                    >
                      <Button variant={"ghost"} size="icon" className="group">
                        <Ellipsis className="h-4 w-4 text-zinc-400 group-hover:text-zinc-800 transition" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="min-w-fit py-0 px-0"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer px-3 py-1 text-zinc-600 focus:text-zinc-800 transition-all"
                        onClick={() => {
                          setIsDeleteConnectionBoxOpen(
                            provider === "github" ? "github" : "google"
                          );
                        }}
                      >
                        <p className="text-sm text-destructive">Remove</p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {isDeleteConnectionBoxOpen === "github" && (
                  <Card
                    className={cn(
                      "my-4 shadow-md w-full bg-muted-foreground/5 border-zinc-600/15 md:max-w-[350px]",
                      isDeleteConnectionBoxOpen === "github" &&
                        provider !== "github" &&
                        "hidden"
                    )}
                  >
                    <CardHeader className="w-full flex flex-col">
                      <CardTitle className="text-sm tracking-tight">
                        Remove Connection
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Are you sure you want to remove this connection?
                        <br />
                        This action cannot be undone.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        disabled={isLoading}
                        onClick={() => setIsDeleteConnectionBoxOpen("closed")}
                        variant={"ghost"}
                        size={"sm"}
                        className="mt-4 mr-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        ref={animate}
                        onClick={() => onGithubDelete()}
                        variant={"destructive"}
                        disabled={isLoading}
                        size={"sm"}
                        className="mt-4 mr-2"
                      >
                        {isLoading && (
                          <Loader className="size-2 text-white animate-spin" />
                        )}
                        {!isLoading && "Delete"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {isDeleteConnectionBoxOpen === "google" && (
                  <Card
                    className={cn(
                      "my-4 shadow-md w-full bg-muted-foreground/5 border-zinc-600/15 md:max-w-[350px]",
                      isDeleteConnectionBoxOpen === "google" &&
                        provider !== "google" &&
                        "hidden"
                    )}
                  >
                    <CardHeader className="w-full flex flex-col">
                      <CardTitle className="text-sm tracking-tight">
                        Remove Connection
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Are you sure you want to remove this connection?
                        <br />
                        This action cannot be undone.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        disabled={isLoading}
                        onClick={() => setIsDeleteConnectionBoxOpen("closed")}
                        variant={"ghost"}
                        size={"sm"}
                        className="mt-4 mr-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        ref={animate}
                        onClick={onGoogleDelete}
                        variant={"destructive"}
                        disabled={isLoading}
                        size={"sm"}
                        className="mt-4 mr-2"
                      >
                        {isLoading && (
                          <Loader className="size-2 text-white animate-spin" />
                        )}
                        {!isLoading && "Delete"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost"}
                size="sm"
                className={cn(
                  "text-sm self-start -mt-[7.5px]",
                  // @ts-expect-error Just a simple type error
                  passkeys.data?.length > 0 ? "-ml-3" : "md:ml-auto"
                )}
                effect={"expandIcon"}
                icon={ArrowRight}
                iconPlacement="right"
              >
                Add connection
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="rounded-lg shadow-lg min-w-[180px] py-[0.5px]"
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={async () => {
                  await authClient.linkSocial(
                    {
                      provider: "google",
                      callbackURL: "/profile",
                    },
                    {
                      onError: (ctx) => {
                        setError(ctx.error.message);
                      },
                    }
                  );
                }}
              >
                <FcGoogle size={18} />
                <p className="text-sm text-zinc-600">Google</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={async () => {
                  await authClient.linkSocial(
                    {
                      provider: "github",
                      callbackURL: "/profile",
                    },
                    {
                      onError: (ctx) => {
                        setError(ctx.error.message);
                      },
                    }
                  );
                }}
              >
                <FaGithub size={18} />
                <p className="text-sm text-zinc-600">Github</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
