import { cn } from "@/lib/utils";
import { OTPInput, OTPInputProps, SlotProps } from "input-otp";

const Slot = (props: SlotProps) => {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground flex size-9 items-center justify-center rounded-md border font-semibold shadow-xs transition-all",
        {
          "border-blue-600/40 border-[1.6px] ring-blue-600/15 z-10 ring-[3px]":
            props.isActive,
        }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}

export const SplitOTP = (props: OTPInputProps) => {
  return (
    // @ts-expect-error Just a simple type error
    <OTPInput
      {...props}
      containerClassName="flex items-center gap-3 has-disabled:opacity-50"
      maxLength={6}
      render={({ slots }) => (
        <div className="flex gap-2">
          {slots.map((slot, index) => (
            <Slot key={index} {...slot} />
          ))}
        </div>
      )}
    />
  );
}
