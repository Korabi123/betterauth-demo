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

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name is required",
    })
    .max(25, {
      message: "Name must be less than 25 characters",
    }),
});

const newPasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
  revokeOtherSessions: z.boolean().default(true),
});

const twoFactorPasswordSchema = z.object({
  currentPassword: z.string().min(8),
});

const totpCodeSchema = z.object({
  otp: z.string().min(6, {
    message: "Code must be 6 digits long",
  }),
});

const removeTwoFactorSchema = z.object({
  currentPassword: z.string().min(8),
});

const renamePasskeySchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name is required",
    })
    .max(25, {
      message: "Name must be less than 25 characters",
    }),
});

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
  const passkeys = authClient.useListPasskeys();

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const passwordForm = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      revokeOtherSessions: true,
    },
  });

  const twoFactorForm = useForm<z.infer<typeof twoFactorPasswordSchema>>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: {
      currentPassword: "",
    },
  });

  const totpCodeForm = useForm<z.infer<typeof totpCodeSchema>>({
    resolver: zodResolver(totpCodeSchema),
    defaultValues: {
      otp: "",
    },
  });

  const removeTwoFactorForm = useForm<z.infer<typeof removeTwoFactorSchema>>({
    resolver: zodResolver(removeTwoFactorSchema),
    defaultValues: {
      currentPassword: "",
    },
  });

  const renamePasskeyForm = useForm<z.infer<typeof renamePasskeySchema>>({
    resolver: zodResolver(renamePasskeySchema),
    defaultValues: {
      name: "",
    },
  });

  if (!user) {
    return "Unauthorized";
  }

  const onProfileSubmit = async (data: z.infer<typeof formSchema>) => {
    await authClient.updateUser(
      {
        name: data.name,
        image,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          window.location.reload();
        },
        onError: (ctx) => {
          console.log(ctx.error.message);
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  const onPasswordSubmit = async (data: z.infer<typeof newPasswordSchema>) => {
    await authClient.changePassword(
      {
        newPassword: data.newPassword,
        currentPassword: data.oldPassword,
        revokeOtherSessions: data.revokeOtherSessions,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          setIsPasswordBoxOpen(false);
          passwordForm.reset();
        },
        onError: (ctx) => {
          console.log(ctx.error.message);
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  const onTwoFactorPasswordSubmit = async (
    data: z.infer<typeof twoFactorPasswordSchema>
  ) => {
    const { data: totpUri } = await authClient.twoFactor.enable(
      {
        password: data.currentPassword,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
          setIsLoading(false);
          setTwoFactorStage(2);
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );

    setTotpUri(totpUri?.totpURI!);
  };

  const onTotpCodeSubmit = async (data: z.infer<typeof totpCodeSchema>) => {
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
          setTwoFactorStage(4);
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  const onRemoveTwoFactorSubmit = async (
    data: z.infer<typeof removeTwoFactorSchema>
  ) => {
    await authClient.twoFactor.disable(
      {
        password: data.currentPassword,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
          setIsLoading(false);
          setIsRemoveTwoFactorBoxOpen(false);
          setTwoFactorStage(1);
          router.refresh();
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  const parsedAgent = UAParser(session?.userAgent?.toString());

  const onAddPasskey = async () => {
    await authClient.passkey.addPasskey({
      name: `${parsedAgent.os.name}, ${parsedAgent.browser.name}`,
    });
  };

  const onRenamePasskeySubmit = async (
    data: z.infer<typeof renamePasskeySchema>,
    id: string
  ) => {
    if (data.name.length < 2) {
      setError("Name is required");
    };

    await authClient.passkey.updatePasskey(
      {
        id,
        name: data.name,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          setIsRenamePasskeyBoxOpen(false);
          window.location.reload();
          setTimeout(() => {
            toast.success('Successfully renamed');
          }, 1000);
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

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
    <Dialog
      onOpenChange={() => {
        setIsProfileBoxOpen(false);
        setIsPasswordBoxOpen(false);
        setIsTwoFactorBoxOpen(false);
        setIsRemoveTwoFactorBoxOpen(false);
        setIsDeletePasskeyBoxOpen(false);
        setIsDeleteConnectionBoxOpen("closed");
        setError("");
        form.reset();
        passwordForm.reset();
        twoFactorForm.reset();
        totpCodeForm.reset();
        removeTwoFactorForm.reset();
        renamePasskeyForm.reset();
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
          <div className="flex md:flex-row flex-col md:gap-0 gap-8 py-3 justify-between items-start w-full">
            <p className="text-sm font-medium pointer-events-none">Profile</p>
            <div ref={parent} className="md:w-[65%] w-full">
              {!isProfileBoxOpen ? (
                <div className="flex items-center gap-4">
                  <Avatar>
                    {/* @ts-expect-error Just a simple type error */}
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white">
                      <UserIcon className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user.name}</p>
                  </div>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    className="ml-auto text-sm"
                    onClick={() => setIsProfileBoxOpen(true)}
                  >
                    Update profile
                  </Button>
                </div>
              ) : (
                <Card className="shadow-md">
                  <CardHeader className="w-full flex flex-row items-center justify-between">
                    <CardTitle className="text-sm tracking-tight">
                      Update profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-6">
                      {!image ? (
                        <Avatar className="size-12">
                          {/* @ts-expect-error Just a simple type error */}
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white">
                            <UserIcon className="size-5" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="size-12">
                          <AvatarImage src={image} />
                        </Avatar>
                      )}
                      <div className="space-x-2 flex items-center">
                        <UploadButton
                          className="ut-button:h-8 ut-button:w-20 ut-button:bg-transparent ut-button:border ut-button:text-black/60 hover:ut-button:bg-black/5 hover:ut-button:text-black ut-button:transition-all focus-visible:ut-button:ring-[4px] focus-visible:ut-button:ring-ring/20 ut-label:text-red-500 ut-allowed-content:hidden ut-button:text-xs"
                          endpoint="profilePic"
                          onClientUploadComplete={(res) => {
                            console.log("Files: ", res);
                            setImage(res[0].url);
                          }}
                          onUploadError={(error: Error) => {
                            console.log(error.message);
                          }}
                          disabled={isLoading}
                        />
                        <Button
                          disabled={isLoading}
                          size={"sm"}
                          variant={"ghost"}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/5 focus-visible:ring-destructive/30 focus-visible:border-2 focus-visible:border-destructive/15 transition-all"
                          onClick={() => {
                            setImage(null);
                            router.refresh();
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onProfileSubmit)}>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="John Doe"
                                  autoCorrect="off"
                                  autoComplete="off"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          size={"sm"}
                          variant={"ghost"}
                          type="button"
                          disabled={isLoading}
                          className="mt-4 mr-2"
                          onClick={() => setIsProfileBoxOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size={"sm"}
                          type="submit"
                          disabled={isLoading}
                          className="mt-4"
                        >
                          {isLoading && (
                            <Loader className="mr-1 size-2 text-muted-foreground animate-spin" />
                          )}
                          Save
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator className="h-[2px] bg-border/50" />

          <div className="flex md:flex-row flex-col md:gap-0 gap-8 py-3 w-full">
            <p className="text-sm font-medium pointer-events-none">Security</p>
            <div className="flex w-full md:items-end flex-col gap-10">
              <div className="flex md:w-[72%] flex-col gap-10">
                <div ref={secondParent}>
                  {!isPasswordBoxOpen ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm font-medium">••••••••••</p>
                      <Button
                        variant={"ghost"}
                        size={"sm"}
                        className="text-sm"
                        onClick={() => setIsPasswordBoxOpen(true)}
                      >
                        Update password
                      </Button>
                    </div>
                  ) : (
                    <Card className="shadow-md">
                      <CardHeader className="w-full flex flex-row items-center justify-between">
                        <CardTitle className="text-sm tracking-tight">
                          Update password
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {error && <ErrorCard size="sm" error={error} />}
                        <Form {...passwordForm}>
                          <form
                            className="space-y-6"
                            onSubmit={passwordForm.handleSubmit(
                              onPasswordSubmit
                            )}
                          >
                            <FormField
                              control={passwordForm.control}
                              name="oldPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">
                                    Current Password
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        autoCorrect="off"
                                        autoComplete="off"
                                        disabled={isLoading}
                                        type={
                                          isPasswordVisible
                                            ? "text"
                                            : "password"
                                        }
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
                                          <Eye
                                            size={16}
                                            strokeWidth={2}
                                            aria-hidden="true"
                                          />
                                        )}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">
                                    New Password
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        autoCorrect="off"
                                        autoComplete="off"
                                        disabled={isLoading}
                                        type={
                                          isNewPasswordVisible
                                            ? "text"
                                            : "password"
                                        }
                                        className="pe-9"
                                      />
                                      <button
                                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                                        type="button"
                                        onClick={toggleNewVisibility}
                                        aria-label={
                                          isNewPasswordVisible
                                            ? "Hide password"
                                            : "Show password"
                                        }
                                        aria-pressed={isNewPasswordVisible}
                                        aria-controls="password"
                                      >
                                        {isNewPasswordVisible ? (
                                          <EyeOff
                                            size={16}
                                            strokeWidth={2}
                                            aria-hidden="true"
                                          />
                                        ) : (
                                          <Eye
                                            size={16}
                                            strokeWidth={2}
                                            aria-hidden="true"
                                          />
                                        )}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="revokeOtherSessions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Sign out of all other devices
                                    </FormLabel>
                                    <FormDescription className="text-zinc-500">
                                      It is recommended to sign out of all other
                                      devices which may have used your old
                                      password.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <Button
                              size={"sm"}
                              variant={"ghost"}
                              type="button"
                              disabled={isLoading}
                              className="mt-4 mr-2"
                              onClick={() => {
                                setIsPasswordBoxOpen(false);
                                passwordForm.reset();
                                setError("");
                                setIsPasswordVisible(false);
                                setIsNewPasswordVisible(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size={"sm"}
                              type="submit"
                              disabled={isLoading}
                              className="mt-4"
                            >
                              {isLoading && (
                                <Loader className="mr-1 size-2 text-muted-foreground animate-spin" />
                              )}
                              Save
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="flex md:w-[72%] flex-col gap-10">
                <div ref={thirdParent}>
                  {!isTwoFactorBoxOpen && !isRemoveTwoFactorBoxOpen ? (
                    <div className="min-w-[350px]">
                      <DropdownMenu>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Two-step verification
                          </p>
                          {!is2FAEnabled ? (
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={"ghost"}
                                size={"sm"}
                                className="text-sm"
                              >
                                Add two-step verification
                              </Button>
                            </DropdownMenuTrigger>
                          ) : (
                            <div className="flex items-center gap-2 min-w-[50%]">
                              <svg
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                className="text-zinc-700 size-5"
                              >
                                <path d="M7 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4 2c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V4c0-1.105-.895-2-2-2H4Zm3 9a3.002 3.002 0 0 0 2.906-2.25H12a.75.75 0 0 0 0-1.5H9.906A3.002 3.002 0 0 0 4 8c0 .941.438 1.785 1.117 2.336A2.985 2.985 0 0 0 7 11Z"
                                ></path>
                              </svg>
                              <p className="text-xs text-zinc-600 mr-2">
                                Authenticator app
                              </p>
                              <Badge variant={"outline"}>Default</Badge>
                            </div>
                          )}
                          {is2FAEnabled && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant={"ghost"}
                                  size="icon"
                                  className="group"
                                >
                                  <Ellipsis className="h-4 w-4 text-zinc-400 group-hover:text-zinc-800 transition" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="center"
                                className="rounded-lg shadow-lg py-1 px-3 min-w-fit"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer p-0"
                                  onClick={() => {
                                    setIsRemoveTwoFactorBoxOpen(true);
                                    setTwoFactorStage(10);
                                  }}
                                >
                                  <p className="text-sm text-destructive">
                                    Remove
                                  </p>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          <DropdownMenuContent
                            align="center"
                            className="rounded-lg shadow-lg"
                            onClick={() => {
                              setIsTwoFactorBoxOpen(true);
                            }}
                          >
                            <DropdownMenuItem className="cursor-pointer">
                              <svg
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                className="text-zinc-700"
                              >
                                <path d="M7 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4 2c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V4c0-1.105-.895-2-2-2H4Zm3 9a3.002 3.002 0 0 0 2.906-2.25H12a.75.75 0 0 0 0-1.5H9.906A3.002 3.002 0 0 0 4 8c0 .941.438 1.785 1.117 2.336A2.985 2.985 0 0 0 7 11Z"
                                ></path>
                              </svg>
                              <p className="text-sm text-zinc-600">
                                Authenticator app
                              </p>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </div>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <>
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle className="text-sm tracking-tight">
                            {twoFactorStage === 1 &&
                              "First enter your current password"}
                            {twoFactorStage === 10 &&
                              "First enter your current password"}
                            {twoFactorStage === 2 &&
                              "Add authenticator application"}
                            {twoFactorStage === 3 &&
                              "Add authenticator application"}
                            {twoFactorStage === 4 &&
                              "Add authenticator application"}
                          </CardTitle>
                          {twoFactorStage === 2 && (
                            <CardDescription className="text-xs">
                              Set up a new sign-in method in your authenticator
                              app and scan the following QR code to link it to
                              your account.
                            </CardDescription>
                          )}
                          {twoFactorStage === 10 && (
                            <CardDescription className="text-xs">
                              To remove two-factor authentication, enter your
                              current password.
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          {twoFactorStage === 1 && (
                            <>
                              {error && <ErrorCard size="sm" error={error} />}
                              <Form {...twoFactorForm}>
                                <form
                                  className="space-y-6"
                                  onSubmit={twoFactorForm.handleSubmit(
                                    onTwoFactorPasswordSubmit
                                  )}
                                >
                                  <FormField
                                    control={twoFactorForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-sm">
                                          Current Password
                                        </FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              {...field}
                                              autoCorrect="off"
                                              autoComplete="off"
                                              disabled={isLoading}
                                              type={
                                                isPasswordVisible
                                                  ? "text"
                                                  : "password"
                                              }
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
                                                <Eye
                                                  size={16}
                                                  strokeWidth={2}
                                                  aria-hidden="true"
                                                />
                                              )}
                                            </button>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <Button
                                    size={"sm"}
                                    variant={"ghost"}
                                    type="button"
                                    disabled={isLoading}
                                    className="mt-4 mr-2"
                                    onClick={() => {
                                      setIsTwoFactorBoxOpen(false);
                                      setIsRemoveTwoFactorBoxOpen(false);
                                      twoFactorForm.reset();
                                      setError("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size={"sm"}
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-4"
                                  >
                                    {isLoading && (
                                      <Loader className="mr-1 size-2 text-muted-foreground animate-spin" />
                                    )}
                                    Save
                                  </Button>
                                </form>
                              </Form>
                            </>
                          )}
                          {twoFactorStage === 2 && (
                            <>
                              <div className="flex flex-col items-center justify-center">
                                <QrCode
                                  value={totpUri || ""}
                                  className="size-[170px]"
                                />
                              </div>
                              <Button
                                size={"sm"}
                                variant={"ghost"}
                                type="button"
                                disabled={isLoading}
                                className="mt-10 mr-2"
                                onClick={() => {
                                  setIsTwoFactorBoxOpen(false);
                                  twoFactorForm.reset();
                                  setError("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size={"sm"}
                                type="button"
                                disabled={isLoading}
                                className="mt-10"
                                onClick={() => {
                                  setTwoFactorStage(3);
                                }}
                              >
                                {isLoading && (
                                  <Loader className="mr-1 size-2 text-muted-foreground animate-spin" />
                                )}
                                Continue
                              </Button>
                            </>
                          )}
                          {twoFactorStage === 3 && (
                            <>
                              {error && <ErrorCard size="sm" error={error} />}
                              <Form {...totpCodeForm}>
                                <form
                                  className="space-y-6 flex flex-col items-center justify-center"
                                  onSubmit={totpCodeForm.handleSubmit(
                                    () => onTotpCodeSubmit
                                  )}
                                >
                                  <FormField
                                    control={totpCodeForm.control}
                                    name="otp"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <InputOTP
                                            disabled={isLoading}
                                            maxLength={6}
                                            {...field}
                                          >
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
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="self-start">
                                    <Button
                                      size={"sm"}
                                      variant={"ghost"}
                                      type="button"
                                      disabled={isLoading}
                                      className="mt-4 mr-2"
                                      onClick={() => {
                                        setIsTwoFactorBoxOpen(false);
                                        twoFactorForm.reset();
                                        totpCodeForm.reset();
                                        setTwoFactorStage(1);
                                        setError("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size={"sm"}
                                      type="button"
                                      disabled={isLoading}
                                      onClick={() => {
                                        onTotpCodeSubmit({
                                          otp: totpCodeForm.getValues().otp,
                                        });
                                      }}
                                      className="mt-4"
                                    >
                                      {isLoading && (
                                        <Loader className="mr-1 size-2 text-muted-foreground animate-spin" />
                                      )}
                                      Continue
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </>
                          )}
                          {twoFactorStage === 4 && (
                            <div className="flex flex-col">
                              <CardDescription className="text-xs">
                                Two-step verification is now enabled. When
                                signing in, you will need to enter a
                                verification code from this authenticator as an
                                additional step.
                              </CardDescription>
                              <Button
                                size={"sm"}
                                type="button"
                                disabled={isLoading}
                                className="mt-4 self-end"
                                onClick={() => {
                                  setIsTwoFactorBoxOpen(false);
                                  twoFactorForm.reset();
                                  totpCodeForm.reset();
                                  setError("");
                                }}
                              >
                                Finish
                              </Button>
                            </div>
                          )}
                          {twoFactorStage === 10 && (
                            <>
                              {error && <ErrorCard size="sm" error={error} />}
                              <Form {...removeTwoFactorForm}>
                                <form
                                  className="space-y-6"
                                  onSubmit={removeTwoFactorForm.handleSubmit(
                                    onRemoveTwoFactorSubmit
                                  )}
                                >
                                  <FormField
                                    control={removeTwoFactorForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-sm">
                                          Current Password
                                        </FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <Input
                                              {...field}
                                              autoCorrect="off"
                                              autoComplete="off"
                                              disabled={isLoading}
                                              type={
                                                isPasswordVisible
                                                  ? "text"
                                                  : "password"
                                              }
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
                                                <Eye
                                                  size={16}
                                                  strokeWidth={2}
                                                  aria-hidden="true"
                                                />
                                              )}
                                            </button>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <Button
                                    size={"sm"}
                                    variant={"ghost"}
                                    type="button"
                                    disabled={isLoading}
                                    className="mt-4 mr-2"
                                    onClick={() => {
                                      setIsTwoFactorBoxOpen(false);
                                      setIsRemoveTwoFactorBoxOpen(false);
                                      twoFactorForm.reset();
                                      setError("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size={"sm"}
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-4"
                                  >
                                    {isLoading && (
                                      <Loader className="mr-1 size-2 text-muted-foreground animate-spin" />
                                    )}
                                    Save
                                  </Button>
                                </form>
                              </Form>
                            </>
                          )}
                        </CardContent>
                      </Card>
                      <div ref={twoFactorBoxBottomRef} />
                    </>
                  )}
                </div>
              </div>

              <div className="flex md:w-[72%] flex-col gap-10">
                <div ref={thirdParent} className="flex md:flex-row flex-col md:gap-0 gap-8 justify-between">
                  <p className="text-sm font-medium">Passkeys</p>
                  <div
                    ref={thirdParent}
                    className="flex flex-col gap-6 items-end md:w-[350px] md:ml-0 ml-4"
                  >
                    {passkeys.data && (
                      <>
                        {passkeys.data.map((passkey, index) => {
                          let formattedDate;

                          const now = new Date();
                          const createdAt = new Date(passkey.createdAt);

                          const diffInMs = now.getTime() - createdAt.getTime();
                          const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

                          const hours = createdAt.getHours();
                          const minutes = createdAt.getMinutes();
                          const amPm = hours >= 12 ? "PM" : "AM";
                          const formattedHours = hours % 12 || 12;
                          const formattedMinutes = minutes
                            .toString()
                            .padStart(2, "0");

                          if (diffInDays < 1) {
                            formattedDate = `Today at ${formattedHours}:${formattedMinutes}${amPm}`;
                          } else if (diffInDays < 2) {
                            formattedDate = `Yesterday at ${formattedHours}:${formattedMinutes}${amPm}`;
                          } else {
                            const day = createdAt.getDate();
                            const month = createdAt.toLocaleString("default", {
                              month: "short",
                            });
                            formattedDate = `${day} ${month} at ${formattedHours}:${formattedMinutes}${amPm}`;
                          }

                          return (
                            <>
                              <div
                                key={index}
                                className="flex -mt-[1px] items-center justify-between self-start gap-4 w-full"
                              >
                                <div className="flex flex-col gap-2">
                                  <p className="text-sm font-medium">
                                    {passkey.name}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    Created: {formattedDate}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant={"ghost"}
                                      size="icon"
                                      className="group self-start -mt-2"
                                    >
                                      <Ellipsis className="h-4 w-4 text-zinc-400 group-hover:text-zinc-800 transition" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="center"
                                    className="rounded-lg shadow-lg p-0 min-w-fit"
                                  >
                                    <DropdownMenuItem
                                      className="cursor-pointer px-3 py-1 text-zinc-600 focus:text-zinc-800 transition-all"
                                      onClick={() => {
                                        setIsRenamePasskeyBoxOpen(passkey.id);
                                      }}
                                    >
                                      <p className="text-sm">Rename</p>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer px-3 py-1 text-destructive/80 focus:text-red-500 focus:bg-destructive/5"
                                      onClick={() =>
                                        setIsDeletePasskeyBoxOpen(passkey.id)
                                      }
                                    >
                                      <p className="text-sm">Remove</p>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {isRenamePasskeyBoxOpen !== false && (
                                <Card
                                  className={cn(
                                    "shadow-md w-full md:max-w-[350px]",
                                    isRenamePasskeyBoxOpen !== passkey.id &&
                                      "hidden"
                                  )}
                                >
                                  <CardHeader className="w-full flex flex-col">
                                    <CardTitle className="text-sm tracking-tight">
                                      Rename Passkey
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      You can change the passkey name to make it
                                      easier to find.
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <Form {...renamePasskeyForm}>
                                      <form className="space-y-6 flex flex-col">
                                        <FormField
                                          control={renamePasskeyForm.control}
                                          name="name"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-sm">
                                                Name
                                              </FormLabel>
                                              <FormControl>
                                                <Input
                                                  {...field}
                                                  placeholder="John Doe"
                                                  autoCorrect="off"
                                                  autoComplete="off"
                                                  disabled={isLoading}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <div className="flex items-center">
                                          <Button
                                            size={"sm"}
                                            variant={"ghost"}
                                            type="button"
                                            disabled={isLoading}
                                            className="mt-4 mr-2 text-xs"
                                            onClick={() => {
                                              setIsRenamePasskeyBoxOpen(false);
                                              setError("");
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            size={"sm"}
                                            type="button"
                                            disabled={isLoading}
                                            className="mt-4"
                                            onClick={() => {
                                              onRenamePasskeySubmit(
                                                renamePasskeyForm.getValues(),
                                                passkey.id
                                              );
                                            }}
                                          >
                                            {isLoading && (
                                              <Loader className="mr-1 size-2 text-muted-foreground animate-spin" />
                                            )}
                                            Save
                                          </Button>
                                        </div>
                                      </form>
                                    </Form>
                                  </CardContent>
                                </Card>
                              )}
                              {isDeletePasskeyBoxOpen !== false && (
                                <Card
                                  className={cn(
                                    "shadow-md w-full bg-muted-foreground/5 border-zinc-600/15 md:max-w-[350px]",
                                    isDeletePasskeyBoxOpen !== passkey.id &&
                                      "hidden"
                                  )}
                                >
                                  <CardHeader className="w-full flex flex-col">
                                    <CardTitle className="text-sm tracking-tight">
                                      Delete Passkey
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      Are you sure you want to delete this
                                      passkey?
                                      <br />
                                      This action cannot be undone.
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <Button
                                      disabled={isLoading}
                                      onClick={() =>
                                        setIsDeletePasskeyBoxOpen(false)
                                      }
                                      variant={"ghost"}
                                      size={"sm"}
                                      className="mt-4 mr-2"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      ref={thirdParent}
                                      onClick={() => {
                                        authClient.passkey.deletePasskey(
                                          {
                                            id: passkey.id,
                                          },
                                          {
                                            onRequest: () => {
                                              setIsLoading(true);
                                            },
                                            onSuccess: () => {
                                              setIsLoading(false);
                                              setIsDeletePasskeyBoxOpen(false);
                                              window.location.reload();
                                              setTimeout(() => {
                                                toast.success(
                                                  "Successfully deleted"
                                                );
                                              }, 1000);
                                            },
                                            onError: (ctx) => {
                                              setError(ctx.error.message);
                                              setIsLoading(false);
                                            },
                                          }
                                        );
                                      }}
                                      variant={"destructive"}
                                      disabled={isLoading}
                                      size={"sm"}
                                      className="mt-4 mr-2 shadow-inner"
                                    >
                                      {isLoading && (
                                        <Loader className="size-2 text-white animate-spin" />
                                      )}
                                      {!isLoading && "Delete"}
                                    </Button>
                                  </CardContent>
                                </Card>
                              )}
                            </>
                          );
                        })}
                      </>
                    )}
                    <Button
                      variant={"ghost"}
                      size="sm"
                      className={cn(
                        "text-sm self-start -mt-[4px]",
                        // @ts-expect-error Just a simple type error
                        passkeys.data?.length > 0 ? "-ml-3" : "ml-auto"
                      )}
                      effect={"expandIcon"}
                      icon={ArrowRight}
                      iconPlacement="right"
                      onClick={onAddPasskey}
                    >
                      Add passkey
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex md:w-[72%] flex-col gap-10">
                <div ref={thirdParent} className="flex md:flex-row flex-col md:gap-0 gap-8 justify-between">
                  <p className="text-sm font-medium">Connected Accounts</p>
                  <div
                    ref={thirdParent}
                    className="flex flex-col gap-1 md:items-end md:w-[350px] md:ml-0 ml-4"
                  >
                    {error && (
                      <ErrorCard
                        className="w-full -mt-2"
                        size="sm"
                        error={error}
                      />
                    )}
                    {connections.map((connection) => {
                      // @ts-expect-error Just a simple type error
                      const provider: string = connection.provider;
                      const formattedProvider =
                        provider.charAt(0).toUpperCase() + provider.slice(1);

                      return (
                        <div
                          key={connection.id}
                          ref={thirdParent}
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
                                {provider === "google" && (
                                  <FcGoogle size={18} />
                                )}
                                {provider === "github" && (
                                  <FaGithub size={18} />
                                )}
                                <p className="text-sm">{formattedProvider}</p>
                                <p className="text-sm text-zinc-500">•</p>
                                <p className="text-sm text-zinc-500/85">
                                  {user.email}
                                </p>
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
                                <Button
                                  variant={"ghost"}
                                  size="icon"
                                  className="group"
                                >
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
                                      provider === "github"
                                        ? "github"
                                        : "google"
                                    );
                                  }}
                                >
                                  <p className="text-sm text-destructive">
                                    Remove
                                  </p>
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
                                  Are you sure you want to remove this
                                  connection?
                                  <br />
                                  This action cannot be undone.
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Button
                                  disabled={isLoading}
                                  onClick={() =>
                                    setIsDeleteConnectionBoxOpen("closed")
                                  }
                                  variant={"ghost"}
                                  size={"sm"}
                                  className="mt-4 mr-2"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  ref={thirdParent}
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
                                  Are you sure you want to remove this
                                  connection?
                                  <br />
                                  This action cannot be undone.
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Button
                                  disabled={isLoading}
                                  onClick={() =>
                                    setIsDeleteConnectionBoxOpen("closed")
                                  }
                                  variant={"ghost"}
                                  size={"sm"}
                                  className="mt-4 mr-2"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  ref={thirdParent}
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
                            "text-sm self-start -mt-[4px]",
                            connections.length > 0 ? "-ml-3" : "ml-auto"
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
