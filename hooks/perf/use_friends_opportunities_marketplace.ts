import { useCallback, useEffect, useState } from 'react'
import { useFriendsCore } from './use_friends_core'
import { useFriendsProfile, GLevelTier } from './use_friends_profile'

export interface FriendsOpportunity {
  id: string
  type: 'bandwidth_share' | 'tech_support' | 'collaboration' | 'mentorship' | 'content_creation' | 'event_hosting'
  title: string
  description: string
  category: OpportunityCategory
  
  // Creator
  creatorId: string
  creatorName: string
  creatorGLevel: GLevelTier
  createdAt: Date
  expiresAt?: Date
  
  // Requirements
  requirements: {
    minGLevel: number
    minGs?: number
    minReputation?: number
    skills?: string[]
    timeCommitment: string // "30 mins", "2 hours", "1 week"
    location?: 'remote' | 'local' | string
    equipment?: string[]
  }
  
  // Rewards
  rewards: {
    gAmount: number
    bonusMultiplier?: number // for higher G levels
    otherRewards?: string[]
    reputationBoost: number
    achievements?: string[]
  }
  
  // Capacity
  maxParticipants: number
  currentParticipants: OpportunityParticipant[]
  
  // Status
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Engagement
  viewCount: number
  applicationCount: number
  successRate: number // 0-100%
}

export interface OpportunityParticipant {
  userId: string
  username: string
  displayName: string
  gLevel: GLevelTier
  appliedAt: Date
  status: 'applied' | 'accepted' | 'rejected' | 'completed'
  application?: {
    message: string
    skills: string[]
    availability: string
    experience: string
  }
  rating?: number // 1-5 stars after completion
}

export interface FriendsPerk {
  id: string
  name: string
  description: string
  category: PerkCategory
  
  // Cost & Requirements
  gCost: number
  requiredLevel: number
  oneTime: boolean
  duration?: number // days if not one-time
  
  // Availability
  isAvailable: boolean
  limitedQuantity?: number
  remainingQuantity?: number
  
  // Benefits
  benefits: {
    bandwidthBonus?: number // percentage increase
    earningMultiplier?: number // G earning bonus
    prioritySupport?: boolean
    exclusiveFeatures?: string[]
    customization?: string[]
    networking?: string[]
  }
  
  // Visual
  icon: string
  color: string
  badge?: string
  
  // Popularity
  purchaseCount: number
  rating: number // 1-5 stars
  reviews: PerkReview[]
}

export interface PerkReview {
  userId: string
  username: string
  rating: number
  comment: string
  createdAt: Date
  helpful: number // upvotes
}

export interface PerkPurchase {
  id: string
  perkId: string
  userId: string
  purchasedAt: Date
  expiresAt?: Date
  isActive: boolean
  gSpent: number
}

export type OpportunityCategory = 
  | 'quick_help'
  | 'bandwidth_sharing'
  | 'tech_support'
  | 'content_creation'
  | 'community_building'
  | 'mentorship'
  | 'collaboration'
  | 'events'

export type PerkCategory = 
  | 'productivity'
  | 'networking'
  | 'customization'
  | 'premium_features'
  | 'exclusive_access'
  | 'earning_boost'

const OPPORTUNITY_TEMPLATES: Partial<FriendsOpportunity>[] = [
  {
    type: 'bandwidth_share',
    title: 'Share 500MB for study session',
    description: 'Help a student access online lectures by sharing bandwidth',
    category: 'quick_help',
    requirements: {
      minGLevel: 1,
      timeCommitment: '2 hours',
      location: 'remote'
    },
    rewards: {
      gAmount: 15,
      reputationBoost: 2
    },
    maxParticipants: 1,
    priority: 'medium'
  },
  {
    type: 'tech_support',
    title: 'Help debug React app',
    description: 'Assist developer with React component issues via screen share',
    category: 'tech_support',
    requirements: {
      minGLevel: 3,
      skills: ['React', 'JavaScript', 'Debugging'],
      timeCommitment: '1 hour',
      location: 'remote'
    },
    rewards: {
      gAmount: 50,
      bonusMultiplier: 1.2,
      reputationBoost: 5
    },
    maxParticipants: 1,
    priority: 'high'
  },
  {
    type: 'mentorship',
    title: 'Mentor new community member',
    description: 'Guide newcomer through first week of Friends Network',
    category: 'mentorship',
    requirements: {
      minGLevel: 4,
      minReputation: 80,
      timeCommitment: '1 week',
      location: 'remote'
    },
    rewards: {
      gAmount: 100,
      reputationBoost: 10,
      achievements: ['mentor_badge']
    },
    maxParticipants: 3,
    priority: 'medium'
  }
]

const AVAILABLE_PERKS: FriendsPerk[] = [
  {
    id: 'bandwidth_boost_24h',
    name: '24h Bandwidth Boost',
    description: '+50% earning rate on bandwidth sharing for 24 hours',
    category: 'earning_boost',
    gCost: 25,
    requiredLevel: 2,
    oneTime: false,
    duration: 1,
    isAvailable: true,
    benefits: {
      earningMultiplier: 1.5
    },
    icon: '⚡',
    color: '#22c55e',
    purchaseCount: 1240,
    rating: 4.8,
    reviews: []
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get priority customer support and faster response times',
    category: 'premium_features',
    gCost: 150,
    requiredLevel: 3,
    oneTime: false,
    duration: 30,
    isAvailable: true,
    benefits: {
      prioritySupport: true
    },
    icon: '🎯',
    color: '#3b82f6',
    purchaseCount: 856,
    rating: 4.9,
    reviews: []
  },
  {
    id: 'custom_avatar_frame',
    name: 'Custom Avatar Frame',
    description: 'Unlock custom avatar frames and special profile badges',
    category: 'customization',
    gCost: 75,
    requiredLevel: 3,
    oneTime: true,
    isAvailable: true,
    benefits: {
      customization: ['avatar_frames', 'profile_badges']
    },
    icon: '🖼️',
    color: '#8b5cf6',
    purchaseCount: 2100,
    rating: 4.6,
    reviews: []
  },
  {
    id: 'early_access',
    name: 'Beta Features Access',
    description: 'Get early access to new features and beta testing',
    category: 'exclusive_access',
    gCost: 200,
    requiredLevel: 4,
    oneTime: false,
    duration: 90,
    isAvailable: true,
    limitedQuantity: 500,
    remainingQuantity: 127,
    benefits: {
      exclusiveFeatures: ['beta_features', 'early_access']
    },
    icon: '🚀',
    color: '#f59e0b',
    purchaseCount: 373,
    rating: 4.7,
    reviews: []
  },
  {
    id: 'legend_networking',
    name: 'Legend Networking Circle',
    description: 'Access to exclusive Legend-level networking events and meetings',
    category: 'networking',
    gCost: 1000,
    requiredLevel: 6,
    oneTime: false,
    duration: 365,
    isAvailable: true,
    limitedQuantity: 50,
    remainingQuantity: 23,
    benefits: {
      networking: ['legend_events', 'executive_access', 'private_channels'],
      exclusiveFeatures: ['governance_voting']
    },
    icon: '👑',
    color: '#ef4444',
    purchaseCount: 27,
    rating: 5.0,
    reviews: []
  }
]

export const useFriendsOpportunitiesMarketplace = () => {
  const { emit, subscribe } = useFriendsCore('FriendsOpportunitiesMarketplace')
  const { profile } = useFriendsProfile()
  
  const [opportunities, setOpportunities] = useState<FriendsOpportunity[]>([])
  const [myApplications, setMyApplications] = useState<OpportunityParticipant[]>([])
  const [myCreatedOpportunities, setMyCreatedOpportunities] = useState<FriendsOpportunity[]>([])

  const getFilteredOpportunities = useCallback((filters: {
    category?: OpportunityCategory
    maxGLevel?: number
    minReward?: number
    timeCommitment?: string
    location?: string
  } = {}) => {
    if (!profile) return []
    
    return opportunities.filter(opp => {
      // Must meet minimum requirements
      if (opp.requirements.minGLevel > profile.gLevel.level) return false
      if (opp.requirements.minGs && opp.requirements.minGs > profile.stats.gBalance) return false
      if (opp.requirements.minReputation && opp.requirements.minReputation > profile.reputation.score) return false
      
      // Filter by user preferences
      if (filters.category && opp.category !== filters.category) return false
      if (filters.maxGLevel && opp.requirements.minGLevel > filters.maxGLevel) return false
      if (filters.minReward && opp.rewards.gAmount < filters.minReward) return false
      if (filters.timeCommitment && opp.requirements.timeCommitment !== filters.timeCommitment) return false
      if (filters.location && opp.requirements.location !== filters.location && opp.requirements.location !== 'remote') return false
      
      // Must be open and have space
      if (opp.status !== 'open') return false
      if (opp.currentParticipants.length >= opp.maxParticipants) return false
      
      // Can't apply to own opportunities
      if (opp.creatorId === profile.id) return false
      
      // Can't apply twice
      if (opp.currentParticipants.some(p => p.userId === profile.id)) return false
      
      return true
    }).sort((a, b) => {
      // Sort by potential reward (including level bonuses)
      const aReward = a.rewards.gAmount * (a.rewards.bonusMultiplier || 1) * profile.gLevel.bandwidthMultiplier
      const bReward = b.rewards.gAmount * (b.rewards.bonusMultiplier || 1) * profile.gLevel.bandwidthMultiplier
      return bReward - aReward
    })
  }, [opportunities, profile])

  const createOpportunity = useCallback(async (
    opportunityData: Omit<FriendsOpportunity, 'id' | 'creatorId' | 'creatorName' | 'creatorGLevel' | 'createdAt' | 'currentParticipants' | 'status' | 'viewCount' | 'applicationCount' | 'successRate'>
  ) => {
    if (!profile) throw new Error('Profile required')
    
    // Check if user can create opportunities (minimum level 2)
    if (profile.gLevel.level < 2) {
      throw new Error('Must be Friend level or higher to create opportunities')
    }
    
    // Check if user has enough G's to fund the opportunity
    const totalCost = opportunityData.rewards.gAmount * opportunityData.maxParticipants
    if (profile.stats.gBalance < totalCost) {
      throw new Error('Insufficient G balance to fund opportunity')
    }

    const opportunity: FriendsOpportunity = {
      ...opportunityData,
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId: profile.id,
      creatorName: profile.displayName,
      creatorGLevel: profile.gLevel,
      createdAt: new Date(),
      currentParticipants: [],
      status: 'open',
      viewCount: 0,
      applicationCount: 0,
      successRate: 100
    }

    setMyCreatedOpportunities(prev => [...prev, opportunity])
    setOpportunities(prev => [...prev, opportunity])
    
    emit('opportunity:created', opportunity)
    
    return opportunity
  }, [profile, emit])

  const applyToOpportunity = useCallback(async (
    opportunityId: string,
    application: {
      message: string
      skills: string[]
      availability: string
      experience: string
    }
  ) => {
    if (!profile) throw new Error('Profile required')
    
    const opportunity = opportunities.find(o => o.id === opportunityId)
    if (!opportunity) throw new Error('Opportunity not found')
    
    if (opportunity.currentParticipants.length >= opportunity.maxParticipants) {
      throw new Error('Opportunity is full')
    }

    const participant: OpportunityParticipant = {
      userId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      gLevel: profile.gLevel,
      appliedAt: new Date(),
      status: 'applied',
      application
    }

    setOpportunities(prev => 
      prev.map(o => o.id === opportunityId 
        ? { 
            ...o, 
            currentParticipants: [...o.currentParticipants, participant],
            applicationCount: o.applicationCount + 1
          }
        : o
      )
    )
    
    setMyApplications(prev => [...prev, participant])
    
    emit('opportunity:application:submitted', { opportunityId, participant })
    
    return participant
  }, [profile, opportunities, emit])

  const acceptApplication = useCallback(async (opportunityId: string, userId: string) => {
    if (!profile) return
    
    const opportunity = myCreatedOpportunities.find(o => o.id === opportunityId)
    if (!opportunity || opportunity.creatorId !== profile.id) return

    setOpportunities(prev => 
      prev.map(o => o.id === opportunityId 
        ? {
            ...o,
            currentParticipants: o.currentParticipants.map(p => 
              p.userId === userId ? { ...p, status: 'accepted' as const } : p
            )
          }
        : o
      )
    )
    
    emit('opportunity:application:accepted', { opportunityId, userId })
  }, [profile, myCreatedOpportunities, emit])

  const completeOpportunity = useCallback(async (opportunityId: string, participantRatings: { [userId: string]: number }) => {
    if (!profile) return
    
    const opportunity = opportunities.find(o => o.id === opportunityId)
    if (!opportunity) return

    // Award G's to participants
    const acceptedParticipants = opportunity.currentParticipants.filter(p => p.status === 'accepted')
    
    acceptedParticipants.forEach(participant => {
      const gReward = opportunity.rewards.gAmount * (opportunity.rewards.bonusMultiplier || 1)
      const rating = participantRatings[participant.userId] || 5
      
      emit('profile:gs:earned', {
        userId: participant.userId,
        amount: gReward,
        source: 'opportunity_completion',
        opportunityId,
        rating
      })
    })

    setOpportunities(prev => 
      prev.map(o => o.id === opportunityId 
        ? {
            ...o,
            status: 'completed' as const,
            currentParticipants: o.currentParticipants.map(p => ({
              ...p,
              status: 'completed' as const,
              rating: participantRatings[p.userId]
            }))
          }
        : o
      )
    )
    
    emit('opportunity:completed', { opportunityId, participantRatings })
  }, [profile, opportunities, emit])

  useEffect(() => {
    // Initialize with template opportunities
    const mockOpportunities: FriendsOpportunity[] = OPPORTUNITY_TEMPLATES.map((template, index) => ({
      id: `template_${index}`,
      creatorId: `creator_${index}`,
      creatorName: 'Community Member',
      creatorGLevel: { level: 3, name: 'Connector' } as GLevelTier,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      currentParticipants: [],
      status: 'open' as const,
      viewCount: Math.floor(Math.random() * 100),
      applicationCount: Math.floor(Math.random() * 20),
      successRate: 85 + Math.random() * 15,
      ...template
    } as FriendsOpportunity))

    setOpportunities(mockOpportunities)
  }, [])

  return {
    // Opportunities
    opportunities: getFilteredOpportunities(),
    myApplications,
    myCreatedOpportunities,
    
    // Actions
    createOpportunity,
    applyToOpportunity,
    acceptApplication,
    completeOpportunity,
    
    // Filtering
    getFilteredOpportunities
  }
}

export const useFriendsPerksMarketplace = () => {
  const { emit, subscribe } = useFriendsCore('FriendsPerksMarketplace')
  const { profile } = useFriendsProfile()
  
  const [availablePerks, setAvailablePerks] = useState<FriendsPerk[]>(AVAILABLE_PERKS)
  const [myPurchases, setMyPurchases] = useState<PerkPurchase[]>([])
  const [cart, setCart] = useState<string[]>([])

  const getAffordablePerks = useCallback(() => {
    if (!profile) return []
    
    return availablePerks.filter(perk => 
      perk.isAvailable &&
      perk.requiredLevel <= profile.gLevel.level &&
      perk.gCost <= profile.stats.gBalance &&
      (perk.remainingQuantity === undefined || perk.remainingQuantity > 0)
    ).sort((a, b) => {
      // Sort by value (rating/cost ratio)
      const aValue = a.rating / a.gCost
      const bValue = b.rating / b.gCost
      return bValue - aValue
    })
  }, [availablePerks, profile])

  const getRecommendedPerks = useCallback(() => {
    if (!profile) return []
    
    const affordable = getAffordablePerks()
    
    // Recommend based on user's level and activity
    return affordable.filter(perk => {
      if (profile.gLevel.level >= 4 && perk.category === 'earning_boost') return true
      if (profile.stats.communitiesCreated > 0 && perk.category === 'networking') return true
      if (profile.gLevel.level >= 3 && perk.category === 'premium_features') return true
      return false
    }).slice(0, 3)
  }, [getAffordablePerks, profile])

  const addToCart = useCallback((perkId: string) => {
    setCart(prev => prev.includes(perkId) ? prev : [...prev, perkId])
  }, [])

  const removeFromCart = useCallback((perkId: string) => {
    setCart(prev => prev.filter(id => id !== perkId))
  }, [])

  const purchasePerk = useCallback(async (perkId: string) => {
    if (!profile) throw new Error('Profile required')
    
    const perk = availablePerks.find(p => p.id === perkId)
    if (!perk) throw new Error('Perk not found')
    
    if (perk.gCost > profile.stats.gBalance) {
      throw new Error('Insufficient G balance')
    }
    
    if (perk.requiredLevel > profile.gLevel.level) {
      throw new Error('G level too low')
    }
    
    if (perk.remainingQuantity !== undefined && perk.remainingQuantity <= 0) {
      throw new Error('Perk sold out')
    }

    const purchase: PerkPurchase = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      perkId,
      userId: profile.id,
      purchasedAt: new Date(),
      expiresAt: perk.duration ? new Date(Date.now() + perk.duration * 24 * 60 * 60 * 1000) : undefined,
      isActive: true,
      gSpent: perk.gCost
    }

    setMyPurchases(prev => [...prev, purchase])
    
    // Update perk quantity
    if (perk.remainingQuantity !== undefined) {
      setAvailablePerks(prev => 
        prev.map(p => p.id === perkId 
          ? { ...p, remainingQuantity: p.remainingQuantity! - 1, purchaseCount: p.purchaseCount + 1 }
          : p
        )
      )
    }
    
    // Remove from cart
    removeFromCart(perkId)
    
    emit('perk:purchased', { purchase, perk })
    emit('profile:gs:spent', {
      userId: profile.id,
      amount: perk.gCost,
      source: 'perk_purchase',
      perkId
    })
    
    return purchase
  }, [profile, availablePerks, removeFromCart, emit])

  const purchaseCart = useCallback(async () => {
    if (!profile || cart.length === 0) return []
    
    const totalCost = cart.reduce((sum, perkId) => {
      const perk = availablePerks.find(p => p.id === perkId)
      return sum + (perk?.gCost || 0)
    }, 0)
    
    if (totalCost > profile.stats.gBalance) {
      throw new Error('Insufficient G balance for cart')
    }

    const purchases = await Promise.all(
      cart.map(perkId => purchasePerk(perkId))
    )
    
    setCart([])
    return purchases
  }, [profile, cart, availablePerks, purchasePerk])

  const ratePerk = useCallback(async (perkId: string, rating: number, comment: string) => {
    if (!profile) return
    
    const purchase = myPurchases.find(p => p.perkId === perkId)
    if (!purchase) return

    const review: PerkReview = {
      userId: profile.id,
      username: profile.username,
      rating,
      comment,
      createdAt: new Date(),
      helpful: 0
    }

    setAvailablePerks(prev => 
      prev.map(p => p.id === perkId 
        ? {
            ...p,
            reviews: [...p.reviews, review],
            rating: (p.rating * p.reviews.length + rating) / (p.reviews.length + 1)
          }
        : p
      )
    )
    
    emit('perk:reviewed', { perkId, review })
  }, [profile, myPurchases, emit])

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, perkId) => {
      const perk = availablePerks.find(p => p.id === perkId)
      return sum + (perk?.gCost || 0)
    }, 0)
  }, [cart, availablePerks])

  const getActivePerks = useCallback(() => {
    const now = new Date()
    return myPurchases.filter(purchase => 
      purchase.isActive && 
      (!purchase.expiresAt || purchase.expiresAt > now)
    )
  }, [myPurchases])

  return {
    // Perks
    availablePerks,
    affordablePerks: getAffordablePerks(),
    recommendedPerks: getRecommendedPerks(),
    
    // Purchases
    myPurchases,
    activePerks: getActivePerks(),
    
    // Shopping Cart
    cart,
    cartTotal: getCartTotal(),
    addToCart,
    removeFromCart,
    purchaseCart,
    
    // Actions
    purchasePerk,
    ratePerk
  }
}