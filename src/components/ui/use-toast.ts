
import { toast as sonnerToast } from "sonner";

// Create a compatibility layer that maps ShadCN toast API to Sonner
export const toast = {
  // Map ShadCN toast API variants to Sonner functions
  default: (message: string) => sonnerToast(message),
  error: (message: string) => sonnerToast.error(message),
  success: (message: string) => sonnerToast.success(message),
  warning: (message: string) => sonnerToast.warning(message),
  info: (message: string) => sonnerToast.info(message),
  // Add a dummy method for any other toast calls to not break existing code
  custom: () => {
    console.warn("Custom toast is not supported in the Sonner integration");
    return { id: "dummy-id", dismiss: () => {} };
  }
};

// Provide a dummy useToast hook that returns the same toast instance
export const useToast = () => ({
  toast,
  dismiss: () => {},
});
