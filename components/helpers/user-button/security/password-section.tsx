"use client";

import * as z from "zod";

import { ErrorCard } from "@/components/auth/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";

const newPasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
  revokeOtherSessions: z.boolean().default(true),
});

export const PasswordSection = () => {
  const [animate] = useAutoAnimate();
  const [isPasswordBoxOpen, setIsPasswordBoxOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toggleVisibility = () =>
    setIsPasswordVisible((prevState) => !prevState);
  const toggleNewVisibility = () =>
    setIsNewPasswordVisible((prevState) => !prevState);

  const passwordForm = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      revokeOtherSessions: true,
    },
  });

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

  return (
    <div className="flex md:w-[72%] flex-col gap-10">
      <div ref={animate}>
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
                        <FormLabel className="text-sm">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              autoCorrect="off"
                              autoComplete="off"
                              disabled={isLoading}
                              type={isNewPasswordVisible ? "text" : "password"}
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
                          <FormLabel>Sign out of all other devices</FormLabel>
                          <FormDescription className="text-zinc-500">
                            It is recommended to sign out of all other devices
                            which may have used your old password.
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
  );
}
