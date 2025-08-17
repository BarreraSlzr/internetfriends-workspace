import { useCallback, useEffect, useState } from 'react'
import { useFriendsCore } from './use_friends_core'
import { useFriendsBandwidthEconomy } from './use_friends_bandwidth_economy'

export interface FriendsProfile {
  id: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  location?: {
    city: string
    country: string
    isPublic: boolean
  }
  joinedAt: Date
  lastActive: Date
  isOnline: boolean
  gLevel: GLevelTier
  reputation: {
    score: number // 0-100
    reviews: number
    avgRating: number // 1-5 stars
  }
  stats: {
    gBalance: number
    totalGsEarned: number
    bandwidthShared: number // MB
    connectionsHelped: number
    communitiesCreated: number
    communitiesJoined: number
  }
  preferences: {
    sharingEnabled: boolean
    discoverable: boolean
    notifications: {
      newRequests: boolean
      gEarned: boolean
      levelUp: boolean
      communityInvites: boolean
    }
  }
  achievements: Achievement[]
}

export interface GLevelTier {
  level: number
  name: string
  minGs: number
  maxGs: number
  color: string
  benefits: string[]
  communityCreateLimit: number
  communityJoinLimit: number
  bandwidthMultiplier: number // earning bonus
  specialPerks: string[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  gReward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface CommunityInvite {
  id: string
  communityId: string
  communityName: string
  inviterId: string
  inviterName: string
  message?: string
  createdAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}

const G_LEVEL_TIERS: GLevelTier[] = [
  {
    level: 1,
    name: 'Newbie',
    minGs: 0,
    maxGs: 99,
    color: '#64748b', // slate
    benefits: ['Basic profile', 'Join up to 3 communities'],
    communityCreateLimit: 0,
    communityJoinLimit: 3,
    bandwidthMultiplier: 1.0,
    specialPerks: []
  },
  {
    level: 2,
    name: 'Friend',
    minGs: 100,
    maxGs: 499,
    color: '#22c55e', // green
    benefits: ['Create 1 community', 'Join up to 5 communities', '+10% G earnings'],
    communityCreateLimit: 1,
    communityJoinLimit: 5,
    bandwidthMultiplier: 1.1,
    specialPerks: ['Early beta features']
  },
  {
    level: 3,
    name: 'Connector',
    minGs: 500,
    maxGs: 1499,
    color: '#3b82f6', // blue
    benefits: ['Create 3 communities', 'Join up to 10 communities', '+20% G earnings'],
    communityCreateLimit: 3,
    communityJoinLimit: 10,
    bandwidthMultiplier: 1.2,
    specialPerks: ['Priority support', 'Custom avatar frames']
  },
  {
    level: 4,
    name: 'Hub',
    minGs: 1500,
    maxGs: 4999,
    color: '#8b5cf6', // purple
    benefits: ['Create 5 communities', 'Join up to 20 communities', '+35% G earnings'],
    communityCreateLimit: 5,
    communityJoinLimit: 20,
    bandwidthMultiplier: 1.35,
    specialPerks: ['Analytics dashboard', 'Community moderation tools', 'Verified badge']
  },
  {
    level: 5,
    name: 'Network',
    minGs: 5000,
    maxGs: 14999,
    color: '#f59e0b', // amber
    benefits: ['Create 10 communities', 'Unlimited joins', '+50% G earnings'],
    communityCreateLimit: 10,
    communityJoinLimit: Infinity,
    bandwidthMultiplier: 1.5,
    specialPerks: ['Advanced analytics', 'API access', 'Custom themes', 'Partner program']
  },
  {
    level: 6,
    name: 'Legend',
    minGs: 15000,
    maxGs: Infinity,
    color: '#ef4444', // red
    benefits: ['Unlimited communities', 'Unlimited joins', '+75% G earnings'],
    communityCreateLimit: Infinity,
    communityJoinLimit: Infinity,
    bandwidthMultiplier: 1.75,
    specialPerks: ['Governance voting', 'Revenue sharing', 'Executive mentorship', 'Conference invites']
  }
]

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_g',
    name: 'First G',
    description: 'Earned your first G by sharing bandwidth',
    icon: '🪙',
    unlockedAt: new Date(),
    gReward: 5,
    rarity: 'common'
  },
  {
    id: 'hundred_club',
    name: 'Hundred Club',
    description: 'Accumulated 100 G\'s',
    icon: '💯',
    unlockedAt: new Date(),
    gReward: 25,
    rarity: 'common'
  },
  {
    id: 'bandwidth_hero',
    name: 'Bandwidth Hero',
    description: 'Shared over 1GB of bandwidth',
    icon: '🦸',
    unlockedAt: new Date(),
    gReward: 50,
    rarity: 'rare'
  },
  {
    id: 'community_builder',
    name: 'Community Builder',
    description: 'Created your first community',
    icon: '🏗️',
    unlockedAt: new Date(),
    gReward: 100,
    rarity: 'epic'
  },
  {
    id: 'network_legend',
    name: 'Network Legend',
    description: 'Reached Legend level (15,000+ G\'s)',
    icon: '👑',
    unlockedAt: new Date(),
    gReward: 500,
    rarity: 'legendary'
  }
]

export const useFriendsProfile = (userId?: string) => {
  const { emit, subscribe } = useFriendsCore('FriendsProfile')
  const { gBalance } = useFriendsBandwidthEconomy()
  
  const [profile, setProfile] = useState<FriendsProfile | null>(null)
  const [communityInvites, setCommunityInvites] = useState<CommunityInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const calculateGLevel = useCallback((gAmount: number): GLevelTier => {
    return G_LEVEL_TIERS.find(tier => 
      gAmount >= tier.minGs && gAmount <= tier.maxGs
    ) || G_LEVEL_TIERS[0]
  }, [])

  const getNextLevelRequirement = useCallback((currentGs: number): { nextLevel: GLevelTier; gsNeeded: number } | null => {
    const currentLevel = calculateGLevel(currentGs)
    const nextLevelIndex = G_LEVEL_TIERS.findIndex(tier => tier.level === currentLevel.level) + 1
    
    if (nextLevelIndex >= G_LEVEL_TIERS.length) return null
    
    const nextLevel = G_LEVEL_TIERS[nextLevelIndex]
    const gsNeeded = nextLevel.minGs - currentGs
    
    return { nextLevel, gsNeeded }
  }, [calculateGLevel])

  const updateProfile = useCallback(async (updates: Partial<FriendsProfile>) => {
    if (!profile) return
    
    const updatedProfile = { ...profile, ...updates }
    setProfile(updatedProfile)
    
    emit('profile:updated', { profileId: profile.id, updates })
    
    // Persist to storage
    localStorage.setItem('friends_profile', JSON.stringify(updatedProfile))
  }, [profile, emit])

  const checkLevelUp = useCallback((newGBalance: number) => {
    if (!profile) return
    
    const currentLevel = profile.gLevel
    const newLevel = calculateGLevel(newGBalance)
    
    if (newLevel.level > currentLevel.level) {
      // Level up!
      updateProfile({
        gLevel: newLevel,
        stats: {
          ...profile.stats,
          gBalance: newGBalance
        }
      })
      
      emit('profile:level_up', {
        profileId: profile.id,
        oldLevel: currentLevel,
        newLevel,
        gBalance: newGBalance
      })
      
      // Award level up achievement if reaching Legend
      if (newLevel.name === 'Legend') {
        unlockAchievement('network_legend')
      }
    }
  }, [profile, calculateGLevel, updateProfile, emit])

  const unlockAchievement = useCallback((achievementId: string) => {
    if (!profile) return
    
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return
    
    // Check if already unlocked
    if (profile.achievements.some(a => a.id === achievementId)) return
    
    const unlockedAchievement = {
      ...achievement,
      unlockedAt: new Date()
    }
    
    updateProfile({
      achievements: [...profile.achievements, unlockedAchievement],
      stats: {
        ...profile.stats,
        gBalance: profile.stats.gBalance + achievement.gReward
      }
    })
    
    emit('profile:achievement_unlocked', {
      profileId: profile.id,
      achievement: unlockedAchievement
    })
  }, [profile, updateProfile, emit])

  const acceptCommunityInvite = useCallback(async (inviteId: string) => {
    const invite = communityInvites.find(i => i.id === inviteId)
    if (!invite || invite.status !== 'pending') return
    
    setCommunityInvites(prev => 
      prev.map(i => i.id === inviteId ? { ...i, status: 'accepted' as const } : i)
    )
    
    if (profile) {
      updateProfile({
        stats: {
          ...profile.stats,
          communitiesJoined: profile.stats.communitiesJoined + 1
        }
      })
    }
    
    emit('community:invite:accepted', { inviteId, communityId: invite.communityId })
  }, [communityInvites, profile, updateProfile, emit])

  const declineCommunityInvite = useCallback(async (inviteId: string) => {
    setCommunityInvites(prev => 
      prev.map(i => i.id === inviteId ? { ...i, status: 'declined' as const } : i)
    )
    
    emit('community:invite:declined', { inviteId })
  }, [emit])

  const initializeProfile = useCallback(() => {
    // Check for existing profile in storage
    const stored = localStorage.getItem('friends_profile')
    if (stored) {
      try {
        const parsedProfile = JSON.parse(stored)
        setProfile(parsedProfile)
        setIsLoading(false)
        return
      } catch (error) {
        console.warn('Failed to parse stored profile:', error)
      }
    }
    
    // Create new profile
    const newProfile: FriendsProfile = {
      id: userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: `friend_${Math.random().toString(36).substr(2, 6)}`,
      displayName: 'New Friend',
      joinedAt: new Date(),
      lastActive: new Date(),
      isOnline: true,
      gLevel: G_LEVEL_TIERS[0], // Start as Newbie
      reputation: {
        score: 100,
        reviews: 0,
        avgRating: 5.0
      },
      stats: {
        gBalance: 0,
        totalGsEarned: 0,
        bandwidthShared: 0,
        connectionsHelped: 0,
        communitiesCreated: 0,
        communitiesJoined: 0
      },
      preferences: {
        sharingEnabled: true,
        discoverable: true,
        notifications: {
          newRequests: true,
          gEarned: true,
          levelUp: true,
          communityInvites: true
        }
      },
      achievements: []
    }
    
    setProfile(newProfile)
    localStorage.setItem('friends_profile', JSON.stringify(newProfile))
    setIsLoading(false)
  }, [userId])

  useEffect(() => {
    initializeProfile()
  }, [initializeProfile])

  useEffect(() => {
    // Sync G balance with bandwidth economy
    if (profile && gBalance && gBalance.balance !== profile.stats.gBalance) {
      checkLevelUp(gBalance.balance)
      updateProfile({
        stats: {
          ...profile.stats,
          gBalance: gBalance.balance,
          totalGsEarned: gBalance.earned
        }
      })
    }
  }, [gBalance, profile, checkLevelUp, updateProfile])

  useEffect(() => {
    // Subscribe to community invites
    const unsubscribeInvites = subscribe('community:invite:received', (event) => {
      const invite: CommunityInvite = event.data
      setCommunityInvites(prev => [...prev, invite])
    })

    return () => {
      unsubscribeInvites()
    }
  }, [subscribe])

  return {
    // Profile Data
    profile,
    isLoading,
    
    // G Level System
    gLevelTiers: G_LEVEL_TIERS,
    calculateGLevel,
    getNextLevelRequirement,
    
    // Profile Management
    updateProfile,
    checkLevelUp,
    
    // Achievements
    availableAchievements: ACHIEVEMENTS,
    unlockAchievement,
    
    // Community Invites
    communityInvites,
    acceptCommunityInvite,
    declineCommunityInvite,
    
    // Utilities
    initializeProfile
  }
}

export const useFriendsLeaderboard = () => {
  const { emit, subscribe } = useFriendsCore('FriendsLeaderboard')
  const [leaderboard, setLeaderboard] = useState<{
    topByGs: FriendsProfile[]
    topByBandwidth: FriendsProfile[]
    topByCommunities: FriendsProfile[]
    topByReputation: FriendsProfile[]
  }>({
    topByGs: [],
    topByBandwidth: [],
    topByCommunities: [],
    topByReputation: []
  })

  const fetchLeaderboard = useCallback(async (category: 'gs' | 'bandwidth' | 'communities' | 'reputation') => {
    emit('leaderboard:fetch', { category })
    
    // Mock data - in real implementation would fetch from API/P2P network
    const mockProfiles: FriendsProfile[] = [
      {
        id: 'alice',
        username: 'alice_the_connector',
        displayName: 'Alice',
        joinedAt: new Date('2024-01-15'),
        lastActive: new Date(),
        isOnline: true,
        gLevel: G_LEVEL_TIERS[4], // Network level
        reputation: { score: 98, reviews: 127, avgRating: 4.9 },
        stats: {
          gBalance: 8500,
          totalGsEarned: 12000,
          bandwidthShared: 5200,
          connectionsHelped: 89,
          communitiesCreated: 7,
          communitiesJoined: 15
        },
        preferences: {
          sharingEnabled: true,
          discoverable: true,
          notifications: {
            newRequests: true,
            gEarned: true,
            levelUp: true,
            communityInvites: true
          }
        },
        achievements: [ACHIEVEMENTS[0], ACHIEVEMENTS[1], ACHIEVEMENTS[2]]
      }
    ]
    
    setLeaderboard(prev => ({
      ...prev,
      [category === 'gs' ? 'topByGs' : 
       category === 'bandwidth' ? 'topByBandwidth' :
       category === 'communities' ? 'topByCommunities' : 'topByReputation']: mockProfiles
    }))
  }, [emit])

  return {
    leaderboard,
    fetchLeaderboard
  }
}