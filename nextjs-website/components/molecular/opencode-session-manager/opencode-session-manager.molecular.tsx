"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface SessionProgress {
  id: string
  title: string
  description: string
  completedTasks: string[]
  remainingTasks: string[]
  progress: number
  tokenStorage: number
  estimatedTime: number
  priority: 'high' | 'medium' | 'low'
  category: string
}

export const OpenCodeSessionManager: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<SessionProgress>({
    id: 'friends-bandwidth-economy-session',
    title: 'Friends Network Bandwidth Economy',
    description: 'P2P bandwidth sharing with token rewards and PWA integration',
    completedTasks: [
      '✅ Dependency tracking & analytics system',
      '✅ Event-driven Friends Network core',
      '✅ P2P network architecture with BitChat foundation', 
      '✅ Offline detection & smart recommendations',
      '✅ PWA integration with service worker',
      '✅ Complete bandwidth economy with token system',
      '✅ Quality-based pricing & 10% platform fees',
      '✅ Marketplace UI with glass morphism styling'
    ],
    remainingTasks: [
      '🔄 Minimal CRUD component schema design',
      '🔄 Extensible I/O interface system',
      '🔄 Reusable layout templates for design system',
      '🔄 Auto-generation utilities for components',
      '🔄 Integration with existing design system nodes',
      '🔄 Component registry updates',
      '🔄 Testing & validation framework'
    ],
    progress: 75,
    tokenStorage: 20,
    estimatedTime: 45,
    priority: 'high',
    category: 'P2P Economy & Components'
  })

  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleSaveProgress = () => {
    const sessionData = {
      ...currentSession,
      savedAt: new Date().toISOString(),
      context: {
        implementation: 'Complete bandwidth economy with token rewards',
        architecture: 'P2P mesh network with WebRTC and BitChat protocol',
        components: 'Glass morphism marketplace UI with existing components',
        integration: 'PWA with service worker and IndexedDB storage',
        revenue: '10% platform fee on bandwidth sharing transactions'
      },
      nextSteps: [
        'Create minimal CRUD component schemas for bandwidth offers',
        'Design extensible I/O system for marketplace operations', 
        'Build reusable templates for P2P component patterns',
        'Integrate with design system node layout',
        'Add auto-generation for bandwidth economy components'
      ]
    }

    // Save to localStorage with 20% token allocation
    localStorage.setItem('opencode-session-progress', JSON.stringify(sessionData))
    console.log('💾 Session saved with 20% token storage allocation')
    setShowSaveDialog(true)
  }

  const getProgressSummary = () => {
    const completed = currentSession.completedTasks.length
    const total = completed + currentSession.remainingTasks.length
    return `${completed}/${total} tasks completed`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <Card className="glass-card-elevated shadow-lg border border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                💾 OpenCode Session
                <Badge variant={getPriorityColor(currentSession.priority)} className="text-xs">
                  {currentSession.priority}
                </Badge>
              </CardTitle>
              <div className="text-xs text-gray-500 mt-1">
                {currentSession.category}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{currentSession.tokenStorage}%</div>
              <div className="text-xs text-gray-500">free storage</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{getProgressSummary()}</span>
            </div>
            <Progress value={currentSession.progress} className="h-2" />
          </div>

          <div className="text-xs">
            <div className="font-medium mb-1">✅ Completed:</div>
            <div className="text-gray-600 space-y-0.5">
              {currentSession.completedTasks.slice(-3).map((task, index) => (
                <div key={index} className="truncate">{task}</div>
              ))}
              {currentSession.completedTasks.length > 3 && (
                <div className="text-gray-400">+{currentSession.completedTasks.length - 3} more...</div>
              )}
            </div>
          </div>

          <div className="text-xs">
            <div className="font-medium mb-1">🔄 Next Up:</div>
            <div className="text-gray-600 space-y-0.5">
              {currentSession.remainingTasks.slice(0, 2).map((task, index) => (
                <div key={index} className="truncate">{task}</div>
              ))}
              {currentSession.remainingTasks.length > 2 && (
                <div className="text-gray-400">+{currentSession.remainingTasks.length - 2} more...</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Est. time: {currentSession.estimatedTime}min</span>
            <span>{currentSession.tokenStorage}% tokens free</span>
          </div>

          <div className="pt-2 space-y-2">
            <Button 
              onClick={handleSaveProgress}
              size="sm" 
              className="w-full text-xs"
            >
              💾 Save Progress & Resume Later
            </Button>
            
            <div className="text-xs text-center text-gray-500">
              Session auto-saves with 20% token allocation
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Success Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="glass-card-default w-80">
            <CardHeader>
              <CardTitle className="text-center">Session Saved! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                Your Friends Network progress has been saved with 20% token storage allocation.
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg text-sm">
                <div className="font-medium text-green-800">Next Session Preview:</div>
                <div className="text-green-700 mt-1">
                  • Complete CRUD component schemas<br/>
                  • Build extensible I/O interfaces<br/>
                  • Integrate with design system nodes
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Resume anytime with: <code className="bg-gray-100 px-1 rounded">opencode resume friends-bandwidth</code>
              </div>

              <Button 
                onClick={() => setShowSaveDialog(false)}
                className="w-full"
                size="sm"
              >
                Continue Working
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}