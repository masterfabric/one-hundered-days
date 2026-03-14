"use client";

import { ToastHelper } from "@/lib/toastHelper";
import { useState } from "react";

export default function TestToastPage() {
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  const testSuccess = () => {
    ToastHelper.show("Success!", {
      type: "success",
      description: "This is a success message",
    });
  };

  const testError = () => {
    ToastHelper.show("Error occurred!", {
      type: "error",
      description: "This is an error message",
    });
  };

  const testWarning = () => {
    ToastHelper.show("Warning!", {
      type: "warning",
      description: "This is a warning message",
    });
  };

  const testInfo = () => {
    ToastHelper.show("Information", {
      type: "info",
      description: "This is an info message",
    });
  };

  const testLoading = () => {
    const id = ToastHelper.loading("Processing...");
    setLoadingId(id);
    setTimeout(() => {
      ToastHelper.dismiss(id);
      setLoadingId(null);
    }, 3000);
  };

  const testPromise = () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve("Success!") : reject("Failed!");
      }, 2000);
    });

    ToastHelper.promise(promise, {
      loading: "Processing request...",
      success: "Request completed successfully!",
      error: "Request failed. Please try again.",
      description: "This demonstrates promise-based toast",
    });
  };

  const testValidation = () => {
    ToastHelper.validation("Validation Error", "Please check your input fields");
  };

  const testWithAction = () => {
    ToastHelper.show("Action required", {
      type: "info",
      description: "Click the button to perform an action",
      action: {
        label: "Undo",
        onClick: () => {
          ToastHelper.show("Action undone!", { type: "success" });
        },
      },
    });
  };

  const testDifferentPositions = () => {
    const positions = [
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "top-center",
      "bottom-center",
    ] as const;

    positions.forEach((pos, index) => {
      setTimeout(() => {
        ToastHelper.show(`Position: ${pos}`, {
          type: "info",
          position: pos,
          description: `This toast appears at ${pos}`,
        });
      }, index * 500);
    });
  };

  const dismissAll = () => {
    ToastHelper.dismiss();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Toast Helper Test Page</h1>
        <p className="text-gray-600 mb-8">
          Test all ToastHelper methods to verify they work correctly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Toast Types */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Toast Types</h2>
            <div className="space-y-2">
              <button
                onClick={testSuccess}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Success Toast
              </button>
              <button
                onClick={testError}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Error Toast
              </button>
              <button
                onClick={testWarning}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Warning Toast
              </button>
              <button
                onClick={testInfo}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Info Toast
              </button>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Advanced Features</h2>
            <div className="space-y-2">
              <button
                onClick={testLoading}
                disabled={loadingId !== null}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Loading Toast
              </button>
              <button
                onClick={testPromise}
                className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Promise Toast
              </button>
              <button
                onClick={testValidation}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Validation Toast
              </button>
              <button
                onClick={testWithAction}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
              >
                Toast with Action
              </button>
            </div>
          </div>

          {/* Utility Functions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Utility Functions</h2>
            <div className="space-y-2">
              <button
                onClick={testDifferentPositions}
                className="w-full px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                Test All Positions
              </button>
              <button
                onClick={dismissAll}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Dismiss All Toasts
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="space-y-2">
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm text-gray-600">Toast Helper Status:</p>
                <p className="text-green-600 font-semibold">✓ Ready</p>
              </div>
              {loadingId && (
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Active Loading Toast ID:</p>
                  <p className="text-blue-600 font-mono text-sm">{loadingId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click each button to test different toast types</li>
            <li>Observe the toast notifications appearing on the screen</li>
            <li>Check that toasts appear in the correct position</li>
            <li>Test dismissing toasts by clicking the X button or swiping</li>
            <li>Verify that promise toasts transition from loading to success/error</li>
            <li>Check browser console for any errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
