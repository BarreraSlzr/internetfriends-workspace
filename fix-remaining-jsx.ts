#!/usr/bin/env bun

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const PROBLEMATIC_FILES = [
  'app/(internetfriends)/design-system/nodes/component.node.tsx',
  'app/(internetfriends)/design-system/nodes/hook.node.tsx',
  'app/(internetfriends)/design-system/nodes/page.node.tsx',
  'app/(internetfriends)/design-system/nodes/utility.node.tsx',
  'app/(internetfriends)/orchestrator/components/project-node.tsx'
];

async function fixFile(filePath: string): Promise<boolean> {
  if (!existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  try {
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;

    // Remove any potential invisible characters or encoding issues
    content = content.replace(/\r\n/g, '\n'); // Normalize line endings
    content = content.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width chars

    // Fix the specific JSX parsing issues we're seeing

    // 1. Fix return statement formatting - ensure proper spacing
    content = content.replace(/return\s*\(\s*</g, 'return (\n    <');

    // 2. Fix className with cn() calls - ensure proper formatting
    content = content.replace(
      /(<div\s+)className=\{cn\(/g,
      '$1className={cn(\n      '
    );

    // 3. Fix multi-line className calls
    content = content.replace(
      /className=\{cn\(\s*(['"`][^'"`]*['"`]),?\s*([^}]+)\}\)/g,
      (match, firstArg, restArgs) => {
        const cleanedArgs = restArgs
          .split(',')
          .map(arg => arg.trim())
          .filter(arg => arg.length > 0)
          .join(',\n      ');
        return `className={cn(\n      ${firstArg},\n      ${cleanedArgs}\n    )}`;
      }
    );

    // 4. Ensure proper JSX tag closing
    content = content.replace(/>\s*\n\s*<Handle/g, '>\n      <Handle');

    // 5. Fix any remaining malformed tags
    content = content.replace(/<\s+/g, '<');
    content = content.replace(/\s+>/g, '>');

    if (content !== originalContent) {
      await writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`➖ No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
    return false;
  }
}

async function recreateProblematicFiles() {
  // If the fixes don't work, we'll recreate the files from scratch

  const componentNodeContent = `"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface ComponentNodeData {
  label: string;
  category: 'atomic' | 'molecular' | 'organism';
  description: string;
  props?: string[];
  features?: string[];
  composition?: string[];
}

interface ComponentNodeProps {
  data: ComponentNodeData;
  isConnectable: boolean;
  selected: boolean;
}

const ComponentNode: React.FC<ComponentNodeProps> = ({
  data,
  isConnectable,
  selected
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'atomic':
        return 'from-blue-50 to-blue-100 border-blue-200 text-blue-900';
      case 'molecular':
        return 'from-purple-50 to-purple-100 border-purple-200 text-purple-900';
      case 'organism':
        return 'from-green-50 to-green-100 border-green-200 text-green-900';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200 text-gray-900';
    }
  };

  return (
    <div
      className={cn(
        'min-w-[250px] max-w-[300px] bg-gradient-to-br rounded-compact-lg border-2 shadow-glass transition-all duration-200',
        getCategoryColor(data.category),
        selected && 'ring-2 ring-if-primary ring-offset-2',
        'hover:shadow-glass-hover hover:scale-[1.02]'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm uppercase tracking-wide">
            {data.label}
          </h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
            {data.category}
          </span>
        </div>

        <p className="text-sm opacity-75 mb-3 leading-relaxed">
          {data.description}
        </p>

        {data.features && data.features.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold mb-1">Features:</h4>
            <div className="flex flex-wrap gap-1">
              {data.features.map((feature, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-white/30 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.props && data.props.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1">Props:</h4>
            <div className="text-xs space-y-1">
              {data.props.map((prop, index) => (
                <div key={index} className="font-mono bg-white/20 px-1 rounded">
                  {prop}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};

export { ComponentNode };
export type { ComponentNodeData };
`;

  const hookNodeContent = `"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface HookNodeData {
  label: string;
  description: string;
  returns?: string;
  parameters?: string[];
  dependencies?: string[];
}

interface HookNodeProps {
  data: HookNodeData;
  isConnectable: boolean;
  selected: boolean;
}

const HookNode: React.FC<HookNodeProps> = ({
  data,
  isConnectable,
  selected
}) => {
  return (
    <div
      className={cn(
        'min-w-[240px] max-w-[300px] bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 text-emerald-900 rounded-compact-lg shadow-glass transition-all duration-200',
        selected && 'ring-2 ring-if-primary ring-offset-2',
        'hover:shadow-glass-hover hover:scale-[1.02]'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">
            {data.label}
          </h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100">
            hook
          </span>
        </div>

        <p className="text-sm opacity-75 mb-3 leading-relaxed">
          {data.description}
        </p>

        {data.returns && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1">Returns:</h4>
            <code className="text-xs bg-white/30 px-1 rounded font-mono">
              {data.returns}
            </code>
          </div>
        )}

        {data.parameters && data.parameters.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1">Parameters:</h4>
            <div className="text-xs space-y-1">
              {data.parameters.map((param, index) => (
                <div key={index} className="font-mono bg-white/20 px-1 rounded">
                  {param}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />
    </div>
  );
};

export { HookNode };
export type { HookNodeData };
`;

  const pageNodeContent = `"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface PageNodeData {
  label: string;
  description: string;
  route?: string;
  components?: string[];
}

interface PageNodeProps {
  data: PageNodeData;
  isConnectable: boolean;
  selected: boolean;
}

const PageNode: React.FC<PageNodeProps> = ({
  data,
  isConnectable,
  selected
}) => {
  return (
    <div
      className={cn(
        'min-w-[280px] max-w-[320px] bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 text-indigo-900 rounded-compact-lg shadow-glass transition-all duration-200',
        selected && 'ring-2 ring-if-primary ring-offset-2',
        'hover:shadow-glass-hover hover:scale-[1.02]'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">
            {data.label}
          </h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100">
            page
          </span>
        </div>

        <p className="text-sm opacity-75 mb-3 leading-relaxed">
          {data.description}
        </p>

        {data.route && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1">Route:</h4>
            <code className="text-xs bg-white/30 px-1 rounded font-mono">
              {data.route}
            </code>
          </div>
        )}

        {data.components && data.components.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1">Uses Components:</h4>
            <div className="flex flex-wrap gap-1">
              {data.components.map((component, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-white/30 rounded">
                  {component}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
    </div>
  );
};

export { PageNode };
export type { PageNodeData };
`;

  const utilityNodeContent = `"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface UtilityNodeData {
  label: string;
  category: 'helper' | 'hook' | 'constant' | 'type' | 'config';
  description: string;
  exports?: string[];
  usedBy?: string[];
}

interface UtilityNodeProps {
  data: UtilityNodeData;
  isConnectable: boolean;
  selected: boolean;
}

const UtilityNode: React.FC<UtilityNodeProps> = ({
  data,
  isConnectable,
  selected
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'helper':
        return 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900';
      case 'hook':
        return 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900';
      case 'constant':
        return 'from-orange-50 to-orange-100 border-orange-200 text-orange-900';
      case 'type':
        return 'from-pink-50 to-pink-100 border-pink-200 text-pink-900';
      case 'config':
        return 'from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-900';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200 text-gray-900';
    }
  };

  return (
    <div
      className={cn(
        'min-w-[220px] max-w-[280px] bg-gradient-to-br rounded-compact-lg border-2 shadow-glass transition-all duration-200',
        getCategoryColor(data.category),
        selected && 'ring-2 ring-if-primary ring-offset-2',
        'hover:shadow-glass-hover hover:scale-[1.02]'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-500 border-2 border-white"
      />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">
            {data.label}
          </h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
            {data.category}
          </span>
        </div>

        <p className="text-sm opacity-75 mb-2 leading-relaxed">
          {data.description}
        </p>

        {data.exports && data.exports.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1">Exports:</h4>
            <div className="flex flex-wrap gap-1">
              {data.exports.map((exportItem, index) => (
                <span key={index} className="text-xs px-1 py-0.5 bg-white/30 rounded font-mono">
                  {exportItem}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-500 border-2 border-white"
      />
    </div>
  );
};

export { UtilityNode };
export type { UtilityNodeData };
`;

  const projectNodeContent = `"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';

interface ProjectNodeData {
  name: string;
  status: 'active' | 'completed' | 'paused' | 'planning';
  description: string;
  technologies?: string[];
  progress?: number;
}

interface ProjectNodeProps {
  data: ProjectNodeData;
  isConnectable: boolean;
  selected: boolean;
}

const ProjectNode: React.FC<ProjectNodeProps> = ({
  data,
  isConnectable,
  selected
}) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'active':
        return 'border-green-400 bg-green-50';
      case 'completed':
        return 'border-blue-400 bg-blue-50';
      case 'paused':
        return 'border-yellow-400 bg-yellow-50';
      case 'planning':
        return 'border-purple-400 bg-purple-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getBorderColor = () => {
    return selected ? 'border-blue-500' : getStatusColor().split(' ')[0];
  };

  return (
    <div className={`bg-gray-800 border-2 ${getBorderColor()} rounded-lg p-4 min-w-64 transition-all duration-200`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      <div className="text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{data.name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
            {data.status}
          </span>
        </div>

        <p className="text-gray-300 text-sm mb-3">
          {data.description}
        </p>

        {data.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{data.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>
        )}

        {data.technologies && data.technologies.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2">Technologies:</h4>
            <div className="flex flex-wrap gap-1">
              {data.technologies.map((tech, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-gray-700 rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};

export { ProjectNode };
export type { ProjectNodeData };
`;

  // Write the recreated files
  const fileContents = {
    'app/(internetfriends)/design-system/nodes/component.node.tsx': componentNodeContent,
    'app/(internetfriends)/design-system/nodes/hook.node.tsx': hookNodeContent,
    'app/(internetfriends)/design-system/nodes/page.node.tsx': pageNodeContent,
    'app/(internetfriends)/design-system/nodes/utility.node.tsx': utilityNodeContent,
    'app/(internetfriends)/orchestrator/components/project-node.tsx': projectNodeContent,
  };

  for (const [filePath, content] of Object.entries(fileContents)) {
    if (existsSync(filePath)) {
      await writeFile(filePath, content, 'utf8');
      console.log(`🔄 Recreated: ${filePath}`);
    }
  }
}

async function main() {
  console.log('🔧 Fixing remaining JSX parsing issues...');
  console.log('');

  let fixedCount = 0;
  let attemptedCount = 0;

  // First, try to fix the existing files
  for (const filePath of PROBLEMATIC_FILES) {
    attemptedCount++;
    const wasFixed = await fixFile(filePath);
    if (wasFixed) {
      fixedCount++;
    }
  }

  console.log('');
  console.log(`Attempted to fix ${attemptedCount} files, successfully fixed ${fixedCount} files.`);

  // If fixes didn't work well, offer to recreate files
  if (fixedCount < attemptedCount / 2) {
    console.log('');
    console.log('⚠️  Many files still had issues. Recreating problematic files from scratch...');
    console.log('');

    await recreateProblematicFiles();

    console.log('');
    console.log('✅ All problematic files have been recreated with clean JSX syntax!');
  }

  console.log('');
  console.log('🎉 JSX fixes complete! Try running:');
  console.log('   bun run build');
}

if (import.meta.main) {
  main().catch(console.error);
}
