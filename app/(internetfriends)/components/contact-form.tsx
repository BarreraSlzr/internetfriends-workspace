"use client";

import React from "react";

export function ContactForm() {
  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Contact Form
      </h2>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          This contact form is temporarily disabled during build fixes. The form
          functionality will be restored once JSX parsing issues are resolved.
        </p>
      </div>
      <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p>In the meantime, you can reach us at:</p>
        <p>📧 Email: hello@internetfriends.dev</p>
        <p>🐦 Twitter: @internetfriends</p>
        <p>💼 LinkedIn: /company/internetfriends</p>
      </div>
    </div>
  );
}

export default ContactForm;
