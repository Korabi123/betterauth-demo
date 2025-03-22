"use client";

import * as z from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/components/uploadthing";
import { cn } from "@/lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { User } from "better-auth";
import { Loader, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";

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

export const ProfileSection = ({
  user,
  className,
}: {
  user: User;
  className?: string;
}) => {
  const [animate] = useAutoAnimate();
  const [isProfileBoxOpen, setIsProfileBoxOpen] = useState(false);
  const [image, setImage] = useState<string | null | undefined>(user.image);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
    },
  });

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

  return (
    <div className={cn("flex md:flex-row flex-col md:gap-0 gap-8 py-3 justify-between items-start w-full", className)}>
      <p className="text-sm font-medium pointer-events-none">Profile</p>
      <div ref={animate} className="md:w-[65%] w-full">
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
  );
}
