"use client";

import React from "react";

export function ContactForm() {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Form</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          This contact form is temporarily disabled during build fixes. The form
          functionality will be restored once JSX parsing issues are resolved.
        </p>
      </div>
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p>In the meantime, you can reach us at:</p>
        <p>📧 Email: hello@internetfriends.dev</p>
        <p>🐦 Twitter: @internetfriends</p>
        <p>💼 LinkedIn: /company/internetfriends</p>
      </div>
    </div>
  );
}

export default ContactForm;
