export { 
  useFriendsDependencyTracker,
  useFriendsDependencyAnalytics,
  type DependencyMetrics,
  type DependencyTrackingOptions,
  type DependencyCall 
} from './use_friends_dependency_analytics'

export {
  useFriendsCore,
  useFriendsPerformance,
  friendsEventBus,
  type FriendsEvent,
  type FriendsEventListener,
  type UseFriendsOptions,
  type FriendsMetrics
} from './use_friends_core'

export {
  useFriendsAnalyticsDashboard,
  useFriendsHookAnalyzer,
  type PerformanceDashboardData
} from './use_friends_analytics_dashboard'

export {
  useFriendsNetwork,
  useFriendsProximity,
  type FriendsNetworkPeer,
  type FriendsNetworkMessage,
  type FriendsNetworkOptions,
  type FriendsNetworkState
} from './use_friends_network'

export { useWebVitalsTelemetry } from './use_web_vitals_telemetry'