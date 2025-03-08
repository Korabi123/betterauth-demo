import { debounce } from "lodash";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { type UseFormWatch, type FieldValues, type UseFormTrigger } from "react-hook-form";

interface AutoSubmitProps<T extends FieldValues> {
  trigger: UseFormTrigger<T>;
  watch: UseFormWatch<T>;
  onSubmit: () => void;
  onValidationFailed?: () => void;
  debounceTime?: number;
}

/**
  * Automatically submit data when it's changed
  */

export const useAutoSubmit = <T extends FieldValues>({
  trigger,
  watch,
  onSubmit,
  onValidationFailed,
  debounceTime = 300,
}: AutoSubmitProps<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedSubmit = useCallback(
    debounce((submitFn: () => void) => {
      submitFn();
    }, debounceTime),
    [],
  );

  useEffect(() => {
    const subscription = watch((_data, info) => {
      if (info?.type !== "change") return; // Detect only "change" events
      setIsSubmitting(true);
      trigger()
        .then((valid) => {
          if (valid) debouncedSubmit(onSubmit);
          else onValidationFailed?.();
        })
        .finally(() => setIsSubmitting(false));
    });

    return () => subscription.unsubscribe();
  }, [watch, onSubmit, onValidationFailed]);

  return { isSubmitting };
};
