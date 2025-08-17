import { useCallback, useEffect, useState } from 'react'
import { useFriendsCore } from './use_friends_core'
import { useFriendsProfile, GLevelTier } from './use_friends_profile'

export interface FriendsCommunity {
  id: string
  name: string
  description: string
  category: CommunityCategory
  creatorId: string
  creatorName: string
  createdAt: Date
  
  // Membership
  memberCount: number
  members: CommunityMember[]
  maxMembers?: number
  isPrivate: boolean
  inviteOnly: boolean
  
  // G Level Requirements
  minGLevel: number
  gRequirement: number // minimum G's to join
  
  // Community Features
  features: {
    bandwidthSharing: boolean
    privateChat: boolean
    fileSharing: boolean
    voiceChat: boolean
    videoChat: boolean
    events: boolean
    marketplace: boolean
  }
  
  // Stats
  stats: {
    totalBandwidthShared: number // MB
    totalGsGenerated: number
    activeMembers: number
    engagement: number // 0-100 score
  }
  
  // Settings
  settings: {
    autoAcceptBelow: number // G level
    welcomeMessage?: string
    rules: string[]
    tags: string[]
  }
}

export interface CommunityMember {
  userId: string
  username: string
  displayName: string
  avatar?: string
  gLevel: GLevelTier
  joinedAt: Date
  role: 'creator' | 'moderator' | 'member'
  isOnline: boolean
  
  // Contribution Stats
  contributions: {
    bandwidthShared: number // MB
    gsEarned: number
    gsShared: number
    helpfulRating: number // 0-5 stars
  }
}

export interface CommunityOpportunity {
  id: string
  communityId: string
  type: 'bandwidth_request' | 'collaboration' | 'event' | 'marketplace'
  title: string
  description: string
  creatorId: string
  
  // Requirements
  requirements: {
    minGLevel?: number
    minGs?: number
    skills?: string[]
    location?: string
    timeCommitment?: string
  }
  
  // Rewards
  rewards: {
    gAmount: number
    other?: string[]
  }
  
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  deadline?: Date
  maxParticipants?: number
  currentParticipants: string[] // user IDs
  
  createdAt: Date
  updatedAt: Date
}

export type CommunityCategory = 
  | 'general'
  | 'tech_support'
  | 'gaming'
  | 'study_group'
  | 'local_area'
  | 'professional'
  | 'creative'
  | 'wellness'
  | 'entertainment'

const COMMUNITY_CATEGORIES: { [key in CommunityCategory]: { 
  name: string
  description: string
  defaultFeatures: Partial<FriendsCommunity['features']>
} } = {
  general: {
    name: 'General',
    description: 'Open discussion and networking',
    defaultFeatures: { bandwidthSharing: true, privateChat: true }
  },
  tech_support: {
    name: 'Tech Support',
    description: 'Help with technical issues',
    defaultFeatures: { bandwidthSharing: true, fileSharing: true, voiceChat: true }
  },
  gaming: {
    name: 'Gaming',
    description: 'Gaming communities and tournaments',
    defaultFeatures: { bandwidthSharing: true, voiceChat: true, events: true }
  },
  study_group: {
    name: 'Study Group',
    description: 'Learning and education focused',
    defaultFeatures: { fileSharing: true, voiceChat: true, events: true }
  },
  local_area: {
    name: 'Local Area',
    description: 'Location-based communities',
    defaultFeatures: { bandwidthSharing: true, events: true, marketplace: true }
  },
  professional: {
    name: 'Professional',
    description: 'Career and business networking',
    defaultFeatures: { privateChat: true, videoChat: true, events: true }
  },
  creative: {
    name: 'Creative',
    description: 'Art, design, and creative projects',
    defaultFeatures: { fileSharing: true, marketplace: true, events: true }
  },
  wellness: {
    name: 'Wellness',
    description: 'Health and wellness support',
    defaultFeatures: { privateChat: true, events: true }
  },
  entertainment: {
    name: 'Entertainment',
    description: 'Movies, music, and entertainment',
    defaultFeatures: { voiceChat: true, events: true, marketplace: true }
  }
}

export const useFriendsCommunities = () => {
  const { emit, subscribe } = useFriendsCore('FriendsCommunities')
  const { profile } = useFriendsProfile()
  
  const [myCommunities, setMyCommunities] = useState<FriendsCommunity[]>([])
  const [discoverCommunities, setDiscoverCommunities] = useState<FriendsCommunity[]>([])
  const [communityOpportunities, setCommunityOpportunities] = useState<CommunityOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const canCreateCommunity = useCallback(() => {
    if (!profile) return false
    
    const currentlyCreated = myCommunities.filter(c => c.creatorId === profile.id).length
    return currentlyCreated < profile.gLevel.communityCreateLimit
  }, [profile, myCommunities])

  const canJoinCommunity = useCallback((community: FriendsCommunity) => {
    if (!profile) return false
    
    // Check G level requirement
    if (profile.gLevel.level < community.minGLevel) return false
    
    // Check G balance requirement
    if (profile.stats.gBalance < community.gRequirement) return false
    
    // Check join limit
    const currentlyJoined = myCommunities.length
    if (currentlyJoined >= profile.gLevel.communityJoinLimit) return false
    
    return true
  }, [profile, myCommunities])

  const createCommunity = useCallback(async (
    name: string,
    description: string,
    category: CommunityCategory,
    options: {
      isPrivate?: boolean
      inviteOnly?: boolean
      minGLevel?: number
      gRequirement?: number
      maxMembers?: number
      features?: Partial<FriendsCommunity['features']>
      rules?: string[]
      tags?: string[]
    } = {}
  ) => {
    if (!profile || !canCreateCommunity()) {
      throw new Error('Cannot create community: insufficient level or limit reached')
    }

    const {
      isPrivate = false,
      inviteOnly = false,
      minGLevel = 1,
      gRequirement = 0,
      maxMembers,
      features = {},
      rules = [],
      tags = []
    } = options

    const categoryInfo = COMMUNITY_CATEGORIES[category]
    const defaultFeatures = {
      bandwidthSharing: false,
      privateChat: false,
      fileSharing: false,
      voiceChat: false,
      videoChat: false,
      events: false,
      marketplace: false,
      ...categoryInfo.defaultFeatures,
      ...features
    }

    const community: FriendsCommunity = {
      id: `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      creatorId: profile.id,
      creatorName: profile.displayName,
      createdAt: new Date(),
      
      memberCount: 1,
      members: [{
        userId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar,
        gLevel: profile.gLevel,
        joinedAt: new Date(),
        role: 'creator',
        isOnline: profile.isOnline,
        contributions: {
          bandwidthShared: 0,
          gsEarned: 0,
          gsShared: 0,
          helpfulRating: 5.0
        }
      }],
      maxMembers,
      isPrivate,
      inviteOnly,
      
      minGLevel,
      gRequirement,
      
      features: defaultFeatures,
      
      stats: {
        totalBandwidthShared: 0,
        totalGsGenerated: 0,
        activeMembers: 1,
        engagement: 100
      },
      
      settings: {
        autoAcceptBelow: Math.max(minGLevel, 3), // Auto-accept Connector level and below
        rules,
        tags
      }
    }

    setMyCommunities(prev => [...prev, community])
    emit('community:created', community)
    
    return community
  }, [profile, canCreateCommunity, emit])

  const joinCommunity = useCallback(async (communityId: string, message?: string) => {
    if (!profile) throw new Error('Profile required to join community')
    
    const community = discoverCommunities.find(c => c.id === communityId)
    if (!community) throw new Error('Community not found')
    
    if (!canJoinCommunity(community)) {
      throw new Error('Cannot join community: requirements not met')
    }

    const member: CommunityMember = {
      userId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.avatar,
      gLevel: profile.gLevel,
      joinedAt: new Date(),
      role: 'member',
      isOnline: profile.isOnline,
      contributions: {
        bandwidthShared: 0,
        gsEarned: 0,
        gsShared: 0,
        helpfulRating: 5.0
      }
    }

    // Add to my communities
    const updatedCommunity = {
      ...community,
      memberCount: community.memberCount + 1,
      members: [...community.members, member]
    }

    setMyCommunities(prev => [...prev, updatedCommunity])
    setDiscoverCommunities(prev => prev.filter(c => c.id !== communityId))
    
    emit('community:joined', { communityId, userId: profile.id, message })
    
    return updatedCommunity
  }, [profile, discoverCommunities, canJoinCommunity, emit])

  const leaveCommunity = useCallback(async (communityId: string) => {
    if (!profile) return
    
    const community = myCommunities.find(c => c.id === communityId)
    if (!community) return
    
    // Cannot leave if you're the creator and there are other members
    if (community.creatorId === profile.id && community.memberCount > 1) {
      throw new Error('Transfer ownership before leaving community')
    }

    setMyCommunities(prev => prev.filter(c => c.id !== communityId))
    emit('community:left', { communityId, userId: profile.id })
  }, [profile, myCommunities, emit])

  const createOpportunity = useCallback(async (
    communityId: string,
    opportunity: Omit<CommunityOpportunity, 'id' | 'creatorId' | 'createdAt' | 'updatedAt' | 'currentParticipants'>
  ) => {
    if (!profile) throw new Error('Profile required')
    
    const community = myCommunities.find(c => c.id === communityId)
    if (!community) throw new Error('Community not found')
    
    // Check if user is member and has permission
    const member = community.members.find(m => m.userId === profile.id)
    if (!member || (member.role !== 'creator' && member.role !== 'moderator')) {
      throw new Error('Insufficient permissions')
    }

    const newOpportunity: CommunityOpportunity = {
      ...opportunity,
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      communityId,
      creatorId: profile.id,
      currentParticipants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setCommunityOpportunities(prev => [...prev, newOpportunity])
    emit('community:opportunity:created', newOpportunity)
    
    return newOpportunity
  }, [profile, myCommunities, emit])

  const joinOpportunity = useCallback(async (opportunityId: string) => {
    if (!profile) throw new Error('Profile required')
    
    const opportunity = communityOpportunities.find(o => o.id === opportunityId)
    if (!opportunity) throw new Error('Opportunity not found')
    
    // Check requirements
    if (opportunity.requirements.minGLevel && profile.gLevel.level < opportunity.requirements.minGLevel) {
      throw new Error('G level too low')
    }
    
    if (opportunity.requirements.minGs && profile.stats.gBalance < opportunity.requirements.minGs) {
      throw new Error('Insufficient G\'s')
    }
    
    // Check capacity
    if (opportunity.maxParticipants && opportunity.currentParticipants.length >= opportunity.maxParticipants) {
      throw new Error('Opportunity is full')
    }

    setCommunityOpportunities(prev => 
      prev.map(o => o.id === opportunityId 
        ? { ...o, currentParticipants: [...o.currentParticipants, profile.id] }
        : o
      )
    )
    
    emit('community:opportunity:joined', { opportunityId, userId: profile.id })
  }, [profile, communityOpportunities, emit])

  const discoverCommunitiesByCategory = useCallback(async (category?: CommunityCategory) => {
    emit('communities:discover', { category })
    
    // Mock discovery data
    const mockCommunities: FriendsCommunity[] = [
      {
        id: 'tech_hub_1',
        name: 'Tech Hub Central',
        description: 'A community for tech enthusiasts to share knowledge and bandwidth',
        category: 'tech_support',
        creatorId: 'alice',
        creatorName: 'Alice',
        createdAt: new Date('2024-08-10'),
        memberCount: 24,
        members: [],
        isPrivate: false,
        inviteOnly: false,
        minGLevel: 2,
        gRequirement: 100,
        features: {
          bandwidthSharing: true,
          privateChat: true,
          fileSharing: true,
          voiceChat: true,
          videoChat: false,
          events: true,
          marketplace: false
        },
        stats: {
          totalBandwidthShared: 1250,
          totalGsGenerated: 840,
          activeMembers: 18,
          engagement: 85
        },
        settings: {
          autoAcceptBelow: 3,
          welcomeMessage: 'Welcome to Tech Hub! Share your knowledge and earn G\'s.',
          rules: ['Be respectful', 'Help others when you can', 'No spam'],
          tags: ['tech', 'support', 'learning']
        }
      }
    ]
    
    setDiscoverCommunities(mockCommunities)
  }, [emit])

  useEffect(() => {
    // Initialize communities
    discoverCommunitiesByCategory()
    
    // Subscribe to community events
    const unsubscribeJoined = subscribe('community:member:joined', (event) => {
      const { communityId, member } = event.data
      setMyCommunities(prev => 
        prev.map(c => c.id === communityId 
          ? { 
              ...c, 
              memberCount: c.memberCount + 1,
              members: [...c.members, member]
            }
          : c
        )
      )
    })

    const unsubscribeOpportunity = subscribe('community:opportunity:available', (event) => {
      setCommunityOpportunities(prev => [...prev, event.data])
    })

    setIsLoading(false)

    return () => {
      unsubscribeJoined()
      unsubscribeOpportunity()
    }
  }, [subscribe, discoverCommunitiesByCategory])

  return {
    // Communities
    myCommunities,
    discoverCommunities,
    isLoading,
    
    // Community Management
    canCreateCommunity,
    canJoinCommunity,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    
    // Opportunities
    communityOpportunities,
    createOpportunity,
    joinOpportunity,
    
    // Discovery
    discoverCommunitiesByCategory,
    
    // Categories
    communityCategories: COMMUNITY_CATEGORIES
  }
}

export const useFriendsOpportunities = () => {
  const { emit, subscribe } = useFriendsCore('FriendsOpportunities')
  const { profile } = useFriendsProfile()
  
  const [globalOpportunities, setGlobalOpportunities] = useState<CommunityOpportunity[]>([])
  const [myParticipations, setMyParticipations] = useState<CommunityOpportunity[]>([])

  const getRecommendedOpportunities = useCallback(() => {
    if (!profile) return []
    
    return globalOpportunities.filter(opp => {
      // Filter by G level
      if (opp.requirements.minGLevel && profile.gLevel.level < opp.requirements.minGLevel) return false
      
      // Filter by G balance
      if (opp.requirements.minGs && profile.stats.gBalance < opp.requirements.minGs) return false
      
      // Filter out full opportunities
      if (opp.maxParticipants && opp.currentParticipants.length >= opp.maxParticipants) return false
      
      // Filter out already joined
      if (opp.currentParticipants.includes(profile.id)) return false
      
      return true
    }).sort((a, b) => {
      // Sort by G reward amount
      return b.rewards.gAmount - a.rewards.gAmount
    })
  }, [globalOpportunities, profile])

  const completeOpportunity = useCallback(async (opportunityId: string) => {
    if (!profile) return
    
    const opportunity = myParticipations.find(o => o.id === opportunityId)
    if (!opportunity) return
    
    // Award G's for completion
    emit('profile:gs:earned', {
      userId: profile.id,
      amount: opportunity.rewards.gAmount,
      source: 'opportunity_completion',
      opportunityId
    })
    
    // Mark as completed
    setMyParticipations(prev => 
      prev.map(o => o.id === opportunityId 
        ? { ...o, status: 'completed' as const }
        : o
      )
    )
    
    emit('community:opportunity:completed', { opportunityId, userId: profile.id })
  }, [profile, myParticipations, emit])

  return {
    globalOpportunities,
    myParticipations,
    getRecommendedOpportunities,
    completeOpportunity
  }
}