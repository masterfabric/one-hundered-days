import { toast } from "@/components/ui/toast-core";

// ToastHelper: Centralized notification utility for Finder Dev.
 
export class ToastHelper {
  
  /**
   * Displays a customizable notification toast.
   * @param message - The main headline of the notification.
   * @param options - Configuration object for the toast.
   * @param options.type - Visual style: 'success' | 'error' | 'warning' | 'info'.
   * @param options.description - Secondary detail text.
   * @param options.position - Screen alignment (e.g., 'top-right').
   * @param options.action - Optional button with label and callback.
   * @returns The unique ID of the toast.
   */
  static show(
    message: string, 
    options?: {
      type?: 'success' | 'error' | 'warning' | 'info',
      description?: string,
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center',
      action?: { label: string, onClick: () => void }
    }   
  ) {
    const { type = 'success', ...config } = options || {};
    
    return toast[type](message, {
      description: config.description,
      position: config.position,
      action: config.action,
    });
  }

  /**
   * Automatically handles the lifecycle of an asynchronous action.
   * Transforms the toast from loading -> success/error based on the promise outcome.
   * @param promise - The promise (API call) to track.
   * @param messages - The text to show for each state.
   */
 static promise<T>(
    promise: Promise<T>, 
    data: { 
      loading: string; 
      success: string; 
      error: string;
      description?: string; 
      action?: { label: string; onClick: () => void }; 
    }
  ) {
    return toast.promise(promise, {
      loading: data.loading,
      success: data.success,
      error: data.error,
      description: data.description, 
      action: data.action,          
    });
  }
  /**
   * Shows a persistent loading state. 
   * Manual dismiss required via ToastHelper.dismiss(id).
   */
  static loading(message: string) {
    return toast.loading(message);
  }

  /**
   * Dismisses a specific toast by ID or clears all active notifications.
   */
  static dismiss(id?: string | number) {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }

  /**
   * Specialized alert for form validation.
   * Positioned at 'bottom-center' with a longer duration.
   */
  static validation(message: string, description?: string) {
    return toast.warning(message, {
      description: description,
      position: 'bottom-center',
      duration: 5000,
    });
  }
}