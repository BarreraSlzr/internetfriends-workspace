import React from 'react';
import { ButtonAtomic } from '@/components/atomic/button/button.atomic';
import { GlassCardAtomic } from '@/components/atomic/glass-card/glass-card.atomic';

export default function ComponentDemoPage({
  searchParams,
}: {
  searchParams: { component?: string; preview?: string };
}) {
  const { component, preview } = searchParams;

  // Simple page that shows individual components for screenshots
  if (!component || preview !== 'true') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Component Demo Gallery</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Button Component Demo */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-medium mb-4">Button Atomic</h2>
              <div className="space-y-3">
                <ButtonAtomic variant="primary">Primary Button</ButtonAtomic>
                <ButtonAtomic variant="secondary">Glass Button</ButtonAtomic>
                <ButtonAtomic variant="outline">Outline Button</ButtonAtomic>
                <ButtonAtomic variant="ghost">Ghost Button</ButtonAtomic>
              </div>
            </div>

            {/* Glass Card Demo */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-medium mb-4">Glass Card Atomic</h2>
              <div className="space-y-3">
                <GlassCardAtomic variant="default">
                  Default Glass Card
                </GlassCardAtomic>
                <GlassCardAtomic variant="elevated">
                  Elevated Glass Card
                </GlassCardAtomic>
                <GlassCardAtomic variant="subtle">
                  Subtle Glass Card
                </GlassCardAtomic>
              </div>
            </div>

            {/* Navigation Demo Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-medium mb-4">Navigation Molecular</h2>
              <div className="text-gray-500 text-sm">
                Navigation component would be displayed here
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Individual component demo for screenshots
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full">
        {component === 'button-atomic' && (
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-center mb-6">Button Component</h2>
            <ButtonAtomic variant="primary" className="w-full">
              Primary Button
            </ButtonAtomic>
            <ButtonAtomic variant="secondary" className="w-full">
              Glass Button
            </ButtonAtomic>
            <ButtonAtomic variant="outline" className="w-full">
              Outline Button
            </ButtonAtomic>
          </div>
        )}

        {component === 'glass-card-atomic' && (
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-center mb-6">Glass Card Component</h2>
            <GlassCardAtomic variant="default">
              <div className="p-4">
                <h3 className="font-medium mb-2">Default Card</h3>
                <p className="text-sm text-gray-600">This is a default glass card with some content.</p>
              </div>
            </GlassCardAtomic>
            <GlassCardAtomic variant="elevated">
              <div className="p-4">
                <h3 className="font-medium mb-2">Elevated Card</h3>
                <p className="text-sm text-gray-600">This is an elevated glass card.</p>
              </div>
            </GlassCardAtomic>
          </div>
        )}

        {component === 'navigation-molecular' && (
          <div className="text-center">
            <h2 className="text-xl font-medium mb-6">Navigation Component</h2>
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 rounded">Home</div>
              <div className="p-2 bg-gray-50 rounded">About</div>
              <div className="p-2 bg-gray-50 rounded">Contact</div>
            </div>
          </div>
        )}

        {component === 'header-organism' && (
          <div className="text-center">
            <h2 className="text-xl font-medium mb-6">Header Component</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div className="font-medium">InternetFriends</div>
                <ButtonAtomic variant="primary" size="sm">
                  Menu
                </ButtonAtomic>
              </div>
            </div>
          </div>
        )}

        {!['button-atomic', 'glass-card-atomic', 'navigation-molecular', 'header-organism'].includes(component || '') && (
          <div className="text-center text-gray-500">
            Component &quot;{component}&quot; not found
          </div>
        )}
      </div>
    </div>
  );
}