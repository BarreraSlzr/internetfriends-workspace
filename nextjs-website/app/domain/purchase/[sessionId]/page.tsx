'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// =================================================================
// DOMAIN PURCHASE FLOW PAGE
// =================================================================

interface PurchaseSession {
  session_id: string
  domain: string
  years: number
  user_id: string
  pricing: {
    usd_price: number
    gs_token_price: number
    conversion_rate: number
    platform_fee_gs: number
  }
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  expires_at: string
}

export default function DomainPurchasePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const [session, setSession] = useState<PurchaseSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Load purchase session
  useEffect(() => {
    if (sessionId) {
      loadPurchaseSession()
    }
  }, [sessionId])

  // Update countdown timer
  useEffect(() => {
    if (session && session.status === 'pending') {
      const timer = setInterval(() => {
        const remaining = Math.max(0, new Date(session.expires_at).getTime() - Date.now())
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          setError('Purchase session has expired')
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [session])

  const loadPurchaseSession = async () => {
    try {
      setIsLoading(true)
      
      // In production, this would fetch the actual session
      // For now, creating a mock session based on sessionId
      const mockSession: PurchaseSession = {
        session_id: sessionId,
        domain: 'example.com', // This would come from the actual session
        years: 1,
        user_id: 'user123',
        pricing: {
          usd_price: 12.99,
          gs_token_price: 520,
          conversion_rate: 40,
          platform_fee_gs: 52
        },
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      }
      
      setSession(mockSession)
      
    } catch (err) {
      setError('Failed to load purchase session')
      console.error('Load session error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPurchase = async () => {
    if (!session) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/domain/purchase', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: session.session_id,
          action: 'confirm'
        })
      })

      const result = await response.json()

      if (result.success) {
        // Purchase completed successfully
        setSession(prev => prev ? { ...prev, status: 'completed' } : null)
        
        // Show success message and redirect after delay
        setTimeout(() => {
          router.push(`/domain/manage/${session.domain}`)
        }, 3000)
        
      } else {
        setError(result.error || 'Purchase failed')
      }

    } catch (err) {
      setError('Network error occurred')
      console.error('Purchase confirmation error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelPurchase = async () => {
    if (!session) return

    setIsProcessing(true)

    try {
      const response = await fetch('/api/domain/purchase', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: session.session_id,
          action: 'cancel'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSession(prev => prev ? { ...prev, status: 'cancelled' } : null)
        
        setTimeout(() => {
          router.push('/domain')
        }, 2000)
        
      } else {
        setError(result.error || 'Cancellation failed')
      }

    } catch (err) {
      setError('Network error occurred')
      console.error('Purchase cancellation error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchase details...</p>
        </div>
      </div>
    )
  }

  if (!session || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Purchase Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Session not found'}</p>
          <Button onClick={() => router.push('/domain')} className="bg-blue-600 hover:bg-blue-700">
            Return to Domain Search
          </Button>
        </Card>
      </div>
    )
  }

  // Success state
  if (session.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <Card className="max-w-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Purchase Successful!</h2>
          <p className="text-gray-600 mb-6">
            Congratulations! You've successfully purchased <strong>{session.domain}</strong> with G's tokens.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✅ Domain will be active within 24 hours</li>
              <li>✅ DNS management available immediately</li>
              <li>✅ SSL certificate will be issued automatically</li>
              <li>✅ WHOIS privacy protection enabled</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push(`/domain/manage/${session.domain}`)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Manage Domain
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/domain')}
              className="w-full"
            >
              Search More Domains
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Cancelled state
  if (session.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Purchase Cancelled</h2>
          <p className="text-gray-600 mb-4">Your G's tokens have been refunded.</p>
          <Button onClick={() => router.push('/domain')} className="bg-blue-600 hover:bg-blue-700">
            Return to Domain Search
          </Button>
        </Card>
      </div>
    )
  }

  // Main purchase confirmation UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600">
            Confirm your domain purchase with G's tokens
          </p>
          
          {/* Timer */}
          {timeRemaining > 0 && (
            <div className="mt-4 text-sm text-orange-600">
              ⏰ Session expires in: <strong>{formatTimeRemaining(timeRemaining)}</strong>
            </div>
          )}
        </div>

        {/* Purchase Details */}
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Domain Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Domain Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Domain Name</label>
                <p className="text-lg font-bold text-blue-600">{session.domain}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Registration Period</label>
                <p className="text-lg font-medium">{session.years} year{session.years > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Included Features</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                <span>🔒 WHOIS Privacy Protection</span>
                <span>🛡️ Free SSL Certificate</span>
                <span>⚙️ DNS Management</span>
                <span>📧 Email Forwarding</span>
              </div>
            </div>
          </Card>

          {/* Pricing Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing Breakdown</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Domain Price (USD)</span>
                <span className="font-medium">${session.pricing.usd_price}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-medium">{session.pricing.conversion_rate} G's per USD</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Platform Fee (10%)</span>
                <span className="font-medium">{session.pricing.platform_fee_gs} G's</span>
              </div>
              
              <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4">
                <span className="text-lg font-bold text-blue-900">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  {session.pricing.gs_token_price} G's
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              💡 You're saving on transaction fees by paying with G's tokens!
            </div>
          </Card>

          {/* Action Buttons */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleConfirmPurchase}
                disabled={isProcessing || timeRemaining === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>🚀 Confirm Purchase ({session.pricing.gs_token_price} G's)</>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancelPurchase}
                disabled={isProcessing}
                className="flex-1 py-3 text-lg"
              >
                Cancel & Refund
              </Button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              🔒 Your G's tokens are safely held in escrow until purchase completion
            </div>
          </Card>

          {/* Terms */}
          <Card className="p-4 bg-gray-50">
            <p className="text-xs text-gray-600">
              By completing this purchase, you agree to our Terms of Service and the domain registration terms. 
              Domain registrations are generally non-refundable after completion. 
              Your G's tokens will be transferred upon successful domain registration.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}