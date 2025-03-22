"use client";

import axios from "axios";

import { FcGoogle } from "react-icons/fc";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import {
  ArrowRight,
  Ellipsis,
  Eye,
  EyeOff,
  Loader,
  PlusCircle,
  UserIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import { User } from "@prisma/client";
import { authClient } from "@/lib/auth-client";
import { UploadButton } from "../uploadthing";
import { useRouter } from "next/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Checkbox } from "../ui/checkbox";
import { ErrorCard } from "./error-card";
import QrCode from "react-qr-code";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { Badge } from "../ui/badge";

import { UAParser } from "ua-parser-js";
import { Account, Session } from "better-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa";
import { ProfileSection } from "../helpers/user-button/profile-section";
import { SecuritySection } from "../helpers/user-button/security/security-section";

export const UserButton = ({
  user,
  session,
}: {
  user: User;
  session: Session;
}) => {
  const [image, setImage] = useState<string | null | undefined>(user.image);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileBoxOpen, setIsProfileBoxOpen] = useState(false);
  const [isPasswordBoxOpen, setIsPasswordBoxOpen] = useState(false);
  const [isTwoFactorBoxOpen, setIsTwoFactorBoxOpen] = useState(false);
  const [isRemoveTwoFactorBoxOpen, setIsRemoveTwoFactorBoxOpen] =
    useState(false);
  const [connections, setConnections] = useState<Account[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isRenamePasskeyBoxOpen, setIsRenamePasskeyBoxOpen] = useState<string | boolean>(false);
  const [isDeletePasskeyBoxOpen, setIsDeletePasskeyBoxOpen] = useState<string | boolean>(false);
  const [isDeleteConnectionBoxOpen, setIsDeleteConnectionBoxOpen] =
    useState<"google" | "github" | "closed">("closed");
  const [twoFactorStage, setTwoFactorStage] = useState(1);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [totpUri, setTotpUri] = useState("");

  const twoFactorBoxBottomRef = useRef<HTMLDivElement>(null);

  const [parent] = useAutoAnimate();
  const [secondParent] = useAutoAnimate();
  const [thirdParent] = useAutoAnimate();

  const router = useRouter();
  const is2FAEnabled = user.twoFactorEnabled;

  const toggleVisibility = () =>
    setIsPasswordVisible((prevState) => !prevState);
  const toggleNewVisibility = () =>
    setIsNewPasswordVisible((prevState) => !prevState);

  console.log(sessions);

  useEffect(() => {
    const getConnections = async () => {
      await authClient
        .listAccounts()
        // @ts-expect-error Just a simple type error
        .then((res) => setConnections(res.data));
    };
    const getSessions = async () => {
      await authClient.multiSession.listDeviceSessions()
        // @ts-expect-error Just a simple type error
        .then((res) => setSessions(res.data));
    }
    getConnections();
    getSessions();
  }, []);

  if (!user) {
    return "Unauthorized";
  }

  return (
    <Dialog
      onOpenChange={() => {
        setIsProfileBoxOpen(false);
        setIsPasswordBoxOpen(false);
        setIsTwoFactorBoxOpen(false);
        setIsRemoveTwoFactorBoxOpen(false);
        setIsDeletePasskeyBoxOpen(false);
        setIsDeleteConnectionBoxOpen("closed");
        setError("");
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-1 focus-visible:border-ring/20">
          <Avatar>
            {/* @ts-expect-error Just a simple type error */}
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white">
              <UserIcon className="size-4" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="md:w-96 w-80 rounded-xl shadow-lg p-0">
          <DropdownMenuLabel className="p-3 px-6">
            <div className="flex items-center gap-4">
              <Avatar>
                {/* @ts-expect-error Just a simple type error */}
                <AvatarImage src={user?.image} />
                <AvatarFallback className="bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white">
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-[460]">{user.name}</p>
                <p className="text-xs font-[460]">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="p-0 m-0" />
          <DialogTrigger asChild>
            <DropdownMenuItem
              disabled={isLoading}
              className="py-4 group px-6 font-medium text-black/70 cursor-pointer"
            >
              <svg
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className="text-zinc-600 group-hover:text-zinc-800 transition-all w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.559 2.536A.667.667 0 0 1 7.212 2h1.574a.667.667 0 0 1 .653.536l.22 1.101c.466.178.9.429 1.287.744l1.065-.36a.667.667 0 0 1 .79.298l.787 1.362a.666.666 0 0 1-.136.834l-.845.742c.079.492.079.994 0 1.486l.845.742a.666.666 0 0 1 .137.833l-.787 1.363a.667.667 0 0 1-.791.298l-1.065-.36c-.386.315-.82.566-1.286.744l-.22 1.101a.666.666 0 0 1-.654.536H7.212a.666.666 0 0 1-.653-.536l-.22-1.101a4.664 4.664 0 0 1-1.287-.744l-1.065.36a.666.666 0 0 1-.79-.298L2.41 10.32a.667.667 0 0 1 .136-.834l.845-.743a4.7 4.7 0 0 1 0-1.485l-.845-.742a.667.667 0 0 1-.137-.833l.787-1.363a.667.667 0 0 1 .791-.298l1.065.36c.387-.315.821-.566 1.287-.744l.22-1.101ZM7.999 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                ></path>
              </svg>
              <span className="ml-2 p-0">Manage Account</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator className="p-0 m-0" />
          <DropdownMenuItem
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                authClient.multiSession.revoke(
                  {
                    sessionToken: session.token,
                  },
                  {
                    onRequest: () => {
                      setIsLoading(true);
                    },
                    onError: (ctx) => {
                      console.log(ctx.error.message);
                      setIsLoading(false);
                    },
                    onSuccess: () => {
                      setIsLoading(false);
                      window.location.reload();
                    },
                  }
                );
              }, 1000);
            }}
            onSelect={(e) => e.preventDefault()}
            disabled={isLoading}
            className="py-4 px-6 font-medium text-black/70 cursor-pointer"
          >
            <span ref={parent}>
              {!isLoading ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  className="text-zinc-600 group-hover:text-zinc-800 transition-all size-[18px]"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.6 2.604A2.045 2.045 0 0 1 4.052 2h3.417c.544 0 1.066.217 1.45.604.385.387.601.911.601 1.458v.69c0 .413-.334.75-.746.75a.748.748 0 0 1-.745-.75v-.69a.564.564 0 0 0-.56-.562H4.051a.558.558 0 0 0-.56.563v7.875a.564.564 0 0 0 .56.562h3.417a.558.558 0 0 0 .56-.563v-.671c0-.415.333-.75.745-.75s.746.335.746.75v.671c0 .548-.216 1.072-.6 1.459a2.045 2.045 0 0 1-1.45.604H4.05a2.045 2.045 0 0 1-1.45-.604A2.068 2.068 0 0 1 2 11.937V4.064c0-.548.216-1.072.6-1.459Zm8.386 3.116a.743.743 0 0 1 1.055 0l1.74 1.75a.753.753 0 0 1 0 1.06l-1.74 1.75a.743.743 0 0 1-1.055 0 .753.753 0 0 1 0-1.06l.467-.47H5.858A.748.748 0 0 1 5.112 8c0-.414.334-.75.746-.75h5.595l-.467-.47a.753.753 0 0 1 0-1.06Z"
                  ></path>
                </svg>
              ) : (
                <Loader className="mr-1 size-4 text-muted-foreground animate-spin" />
              )}
            </span>
            <span className="ml-2 p-0">Sign Out</span>
          </DropdownMenuItem>
          {sessions.length > 1 && (
            <>
              <DropdownMenuSeparator className="p-0 m-0" />
              {sessions.map((session) => {
                /* @ts-expect-error Just a simple type error */
                const activeSession = session.user.id === user.id;

                return (
                  <>
                    <DropdownMenuItem
                      className={cn(
                        "p-3 px-6 cursor-pointer",
                        activeSession && "hidden"
                      )}
                      onClick={async () => {
                        await authClient.multiSession.setActive(
                          {
                            // @ts-expect-error Just a simple type error
                            sessionToken: session.session.token,
                          },
                          {
                            onRequest: () => {
                              setIsLoading(true);
                            },
                            onSuccess: () => {
                              setIsLoading(false);
                              window.location.reload();
                            },
                          }
                        );
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          {/* @ts-expect-error Just a simple type error */}
                          <AvatarImage src={session.user.image} />
                          <AvatarFallback className="bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white">
                            <UserIcon className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-[460]">
                            {/* @ts-expect-error Just a simple type error */}
                            {session.user.name}
                          </p>
                          <p className="text-xs font-[460]">
                            {/* @ts-expect-error Just a simple type error */}
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </>
                );
              })}
            </>
          )}
          <DropdownMenuSeparator className="p-0 m-0" />
          <DropdownMenuItem
            className={cn("py-4 px-6 font-medium text-black/70 cursor-pointer")}
            onClick={() => {
              router.push("/login");
            }}
            disabled={isLoading}
          >
            <PlusCircle className="size-4 mr-2" />
            Add account
          </DropdownMenuItem>
          {sessions.length > 1 && (
            <>
              <DropdownMenuSeparator className="p-0 m-0" />
              <DropdownMenuItem
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    authClient.signOut(
                      {},
                      {
                        onSuccess: () => {
                          router.refresh();
                        },
                      }
                    );
                  }, 1000);
                }}
                onSelect={(e) => e.preventDefault()}
                disabled={isLoading}
                className="py-4 px-6 font-medium text-black/70 cursor-pointer"
              >
                <span ref={parent}>
                  {!isLoading ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      className="text-zinc-600 group-hover:text-zinc-800 transition-all size-[18px]"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.6 2.604A2.045 2.045 0 0 1 4.052 2h3.417c.544 0 1.066.217 1.45.604.385.387.601.911.601 1.458v.69c0 .413-.334.75-.746.75a.748.748 0 0 1-.745-.75v-.69a.564.564 0 0 0-.56-.562H4.051a.558.558 0 0 0-.56.563v7.875a.564.564 0 0 0 .56.562h3.417a.558.558 0 0 0 .56-.563v-.671c0-.415.333-.75.745-.75s.746.335.746.75v.671c0 .548-.216 1.072-.6 1.459a2.045 2.045 0 0 1-1.45.604H4.05a2.045 2.045 0 0 1-1.45-.604A2.068 2.068 0 0 1 2 11.937V4.064c0-.548.216-1.072.6-1.459Zm8.386 3.116a.743.743 0 0 1 1.055 0l1.74 1.75a.753.753 0 0 1 0 1.06l-1.74 1.75a.743.743 0 0 1-1.055 0 .753.753 0 0 1 0-1.06l.467-.47H5.858A.748.748 0 0 1 5.112 8c0-.414.334-.75.746-.75h5.595l-.467-.47a.753.753 0 0 1 0-1.06Z"
                      ></path>
                    </svg>
                  ) : (
                    <Loader className="mr-1 size-4 text-muted-foreground animate-spin" />
                  )}
                </span>
                <span className="ml-2 p-0">Sign Out of all Accounts</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="md:min-w-[850px] max-h-[650px] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle className="text-xl">Account Settings</DialogTitle>
          <DialogDescription className="text-sm">
            Manage your account settings.
          </DialogDescription>
        </DialogHeader>
        <Separator className="bg-border/50" />
        <div className="flex flex-col gap-3">
          <ProfileSection user={user} />
          <Separator className="h-[2px] bg-border/50" />
          <SecuritySection user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
