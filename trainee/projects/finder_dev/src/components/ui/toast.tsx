"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "loading"
  duration?: number
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", onClose, ...props }, ref) => {
    const icons = {
      default: null,
      success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      error: <AlertCircle className="h-5 w-5 text-red-500" />,
      loading: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
    }

    const variantStyles = {
      default: "bg-[hsl(var(--popover))] border-[hsl(var(--border))]",
      success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      error: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
      loading: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center gap-3 rounded-lg border p-4 shadow-lg transition-all",
          variantStyles[variant]
        )}
        {...props}
      >
        {icons[variant] && <div className="flex-shrink-0">{icons[variant]}</div>}
        <div className="flex-1 space-y-1">
          {title && (
            <div className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              {description}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity hover:text-[hsl(var(--foreground))] group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

interface ToastContainerProps {
  toasts: ToastProps[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    console.log("ToastContainer render, toasts:", toasts);
  }, [toasts])

  if (!mounted) {
    return null;
  }
  
  const content = (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[9999] flex max-h-screen w-full flex-col gap-2 p-4 sm:bottom-auto sm:right-4 sm:top-4 sm:w-[420px]">
      {toasts.length > 0 && toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )

  return createPortal(content, document.body)
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const showToast = React.useCallback(
    (props: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).substring(7)
      const newToast: ToastProps = {
        ...props,
        id,
        duration: props.duration ?? 3000,
      }

      console.log("showToast called", { id, props, newToast });

      setToasts((prev) => {
        console.log("Setting toasts, prev:", prev, "new:", [...prev, newToast]);
        return [...prev, newToast];
      })

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => {
            const filtered = prev.filter((toast) => toast.id !== id);
            console.log("Auto-removing toast", id, "remaining:", filtered);
            return filtered;
          })
        }, newToast.duration)
      }

      return id
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    console.log("removeToast called", id);
    setToasts((prev) => {
      const filtered = prev.filter((toast) => toast.id !== id);
      console.log("Removing toast", id, "remaining:", filtered);
      return filtered;
    })
  }, [])

  React.useEffect(() => {
    console.log("Toasts state updated:", toasts);
  }, [toasts])

  return {
    toasts,
    showToast,
    removeToast,
  }
}
