
import { toast as sonnerToast } from "sonner";

// Define the toast parameter type
type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Create a compatibility layer that maps ShadCN toast API to Sonner
const createToastFunction = () => {
  // Create a callable function that handles the object style and string style
  const toastFunction = (props: ToastProps | string) => {
    if (typeof props === 'string') {
      return sonnerToast(props);
    }
    
    const { title, description, variant } = props;
    const message = description || title || "";
    
    if (variant === "destructive") {
      return sonnerToast.error(message);
    }
    
    return sonnerToast(message);
  };
  
  // Add method properties for direct calls
  toastFunction.default = (message: string) => sonnerToast(message);
  toastFunction.error = (message: string) => sonnerToast.error(message);
  toastFunction.success = (message: string) => sonnerToast.success(message);
  toastFunction.warning = (message: string) => sonnerToast.warning(message);
  toastFunction.info = (message: string) => sonnerToast.info(message);
  toastFunction.custom = () => {
    console.warn("Custom toast is not supported in the Sonner integration");
    return { id: "dummy-id", dismiss: () => {} };
  };
  
  return toastFunction as typeof toastFunction & {
    default: (message: string) => string | number;
    error: (message: string) => string | number;
    success: (message: string) => string | number;
    warning: (message: string) => string | number;
    info: (message: string) => string | number;
    custom: () => { id: string; dismiss: () => void };
  };
};

// Export the toast function with all the methods
export const toast = createToastFunction();

// Provide a useToast hook that returns the same toast instance
export const useToast = () => ({
  toast,
  dismiss: () => {},
});
