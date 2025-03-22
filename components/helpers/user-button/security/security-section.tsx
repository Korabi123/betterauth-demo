import { PasswordSection } from "./password-section";

export const SecuritySection = () => {
  return (
    <div className="flex md:flex-row flex-col md:gap-0 gap-8 py-3 w-full">
      <p className="text-sm font-medium pointer-events-none">Security</p>
      <div className="flex w-full md:items-end flex-col gap-10">
        <PasswordSection />

        <div className="flex md:w-[72%] flex-col gap-10">
          <div ref={thirdParent}>
            {!isTwoFactorBoxOpen && !isRemoveTwoFactorBoxOpen ? (
              <div className="min-w-[350px]">
                <DropdownMenu>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Two-step verification</p>
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
                            <p className="text-sm text-destructive">Remove</p>
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
                      {twoFactorStage === 2 && "Add authenticator application"}
                      {twoFactorStage === 3 && "Add authenticator application"}
                      {twoFactorStage === 4 && "Add authenticator application"}
                    </CardTitle>
                    {twoFactorStage === 2 && (
                      <CardDescription className="text-xs">
                        Set up a new sign-in method in your authenticator app
                        and scan the following QR code to link it to your
                        account.
                      </CardDescription>
                    )}
                    {twoFactorStage === 10 && (
                      <CardDescription className="text-xs">
                        To remove two-factor authentication, enter your current
                        password.
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
                          Two-step verification is now enabled. When signing in,
                          you will need to enter a verification code from this
                          authenticator as an additional step.
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
          <div
            ref={thirdParent}
            className="flex md:flex-row flex-col md:gap-0 gap-8 justify-between"
          >
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
                              isRenamePasskeyBoxOpen !== passkey.id && "hidden"
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
                              isDeletePasskeyBoxOpen !== passkey.id && "hidden"
                            )}
                          >
                            <CardHeader className="w-full flex flex-col">
                              <CardTitle className="text-sm tracking-tight">
                                Delete Passkey
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Are you sure you want to delete this passkey?
                                <br />
                                This action cannot be undone.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Button
                                disabled={isLoading}
                                onClick={() => setIsDeletePasskeyBoxOpen(false)}
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
                                          toast.success("Successfully deleted");
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
                  passkeys.data?.length > 0 ? "-ml-3" : "md:ml-auto"
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
          <div
            ref={thirdParent}
            className="flex md:flex-row flex-col md:gap-0 gap-8 justify-between"
          >
            <p className="text-sm font-medium">Connected Accounts</p>
            <div
              ref={thirdParent}
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
                          {provider === "google" && <FcGoogle size={18} />}
                          {provider === "github" && <FaGithub size={18} />}
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
                            Are you sure you want to remove this connection?
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
      </div>
    </div>
  );
}
