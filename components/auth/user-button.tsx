"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { Eye, EyeOff, Loader, LogOut, Settings, UserIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { User } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { UploadButton } from "../uploadthing";
import { useRouter } from "next/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Checkbox } from "../ui/checkbox";
import { ErrorCard } from "./error-card";

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
})

export const UserButton = ({ user }: { user: User }) => {
  // const userState = authClient.useSession();

  const [image, setImage] = useState<string | null | undefined>(user.image);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileBoxOpen, setIsProfileBoxOpen] = useState(false);
  const [isPasswordBoxOpen, setIsPasswordBoxOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

  const [parent] = useAutoAnimate();
  const [secondParent] = useAutoAnimate();

  const router = useRouter();

  const toggleVisibility = () => setIsPasswordVisible((prevState) => !prevState);
  const toggleNewVisibility = () => setIsNewPasswordVisible((prevState) => !prevState);

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
    await authClient.changePassword({
      newPassword: data.newPassword,
      currentPassword: data.oldPassword,
      revokeOtherSessions: data.revokeOtherSessions,
    }, {
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
      }
    })
  };

  return (
    <Dialog
      onOpenChange={() => {
        setIsProfileBoxOpen(false);
        setIsPasswordBoxOpen(false);
        form.reset();
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
        <DropdownMenuContent className="md:w-96 w-80 rounded-xl shadow-lg p-3">
          <DropdownMenuLabel>
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
                <p className="text-xs font-medium">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem className="p-3.5 font-medium text-black/70 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span className="ml-2 p-0">Manage Account</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => authClient.signOut()}
            className="p-3.5 font-medium text-black/70 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2 p-0">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="md:min-w-[600px] max-h-[560px] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle className="text-xl">Account Settings</DialogTitle>
          <DialogDescription className="text-sm">
            Manage your account settings.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="flex flex-col gap-3">
          <div className="flex py-3 justify-between items-start w-full">
            <p className="text-sm font-medium pointer-events-none">Profile</p>
            <div ref={parent} className="w-[65%]">
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

          <Separator />

          <div className="flex py-3 justify-between items-start w-full">
            <p className="text-sm font-medium pointer-events-none">Security</p>
            <div className="flex w-[65%] flex-col gap-10">
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
                          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
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
                                        isPasswordVisible ? "text" : "password"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
