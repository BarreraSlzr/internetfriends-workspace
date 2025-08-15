import { createPermix } from 'permix'

// User data type for permission context
export interface User {
  id: string
  email: string
  role: 'admin' | 'premium' | 'free'
  plan: string
  isActive: boolean
}

// Content/Service data types for permission checks
export interface Content {
  id: string
  title: string
  type: 'curriculum' | 'project' | 'tutorial' | 'premium-content'
  tier: 'free' | 'premium' | 'admin-only'
  authorId: string
}

export interface Service {
  id: string
  name: string
  type: 'analytics' | 'advanced-features' | 'support' | 'api-access'
  tier: 'free' | 'premium' | 'admin-only'
}

// Permission Schema Definition
export const permix = createPermix<{
  // Content permissions (curriculum, projects, tutorials)
  content: {
    dataType: Content
    action: 'view' | 'create' | 'edit' | 'delete' | 'publish'
  }
  
  // Service permissions (analytics, features, support)
  service: {
    dataType: Service
    action: 'access' | 'configure' | 'monitor' | 'admin'
  }
  
  // User management permissions
  user: {
    dataType: User
    action: 'view' | 'edit' | 'delete' | 'impersonate'
  }
  
  // System-level permissions
  system: {
    dataType: null
    action: 'admin-panel' | 'analytics-dashboard' | 'user-management' | 'billing'
  }
}>()

// Role-based permission setup function
export function setupUserPermissions(user: User | null) {
  if (!user) {
    // Anonymous user - very limited access
    permix.setup({
      content: {
        view: (content?: Content) => content ? content.tier === 'free' && content.type !== 'premium-content' : false,
        create: false,
        edit: false,
        delete: false,
        publish: false,
      },
      service: {
        access: false,
        configure: false,
        monitor: false,
        admin: false,
      },
      user: {
        view: false,
        edit: false,
        delete: false,
        impersonate: false,
      },
      system: {
        'admin-panel': false,
        'analytics-dashboard': false,
        'user-management': false,
        billing: false,
      },
    })
    return
  }

  // Setup permissions based on user role
  switch (user.role) {
    case 'admin':
      // Admin Template - full system access
      permix.setup({
        content: {
          view: true, // Can view all content
          create: true,
          edit: true,
          delete: true,
          publish: true,
        },
        service: {
          access: true, // Full service access
          configure: true,
          monitor: true,
          admin: true,
        },
        user: {
          view: true, // Can view all users
          edit: true,
          delete: true,
          impersonate: true, // Admin debugging capability
        },
        system: {
          'admin-panel': true,
          'analytics-dashboard': true,
          'user-management': true,
          billing: true,
        },
      })
      break
      
    case 'premium':
      // Premium User - enhanced access + profit-driven services
      permix.setup({
        content: {
          view: (content?: Content) => content ? ['free', 'premium'].includes(content.tier) : true,
          create: (content?: Content) => content ? content.authorId === user.id && content.type !== 'premium-content' : true,
          edit: (content?: Content) => content ? content.authorId === user.id : false,
          delete: (content?: Content) => content ? content.authorId === user.id : false,
          publish: false,
        },
        service: {
          access: (service?: Service) => service ? ['free', 'premium'].includes(service.tier) : true,
          configure: (service?: Service) => service ? service.type !== 'api-access' : false, // Limited configuration
          monitor: true, // Premium users can monitor their usage
          admin: false,
        },
        user: {
          view: (targetUser?: User) => targetUser ? targetUser.id === user.id : false, // Can view own profile
          edit: (targetUser?: User) => targetUser ? targetUser.id === user.id : false,  // Can edit own profile
          delete: false,
          impersonate: false,
        },
        system: {
          'admin-panel': false,
          'analytics-dashboard': true, // Premium users get analytics
          'user-management': false,
          billing: true, // Can access own billing
        },
      })
      break
      
    case 'free':
    default:
      // Free User - basic access
      permix.setup({
        content: {
          view: (content?: Content) => content ? content.tier === 'free' : false,
          create: false,
          edit: false,
          delete: false,
          publish: false,
        },
        service: {
          access: (service?: Service) => service ? service.tier === 'free' : false,
          configure: false,
          monitor: false,
          admin: false,
        },
        user: {
          view: false,
          edit: false,
          delete: false,
          impersonate: false,
        },
        system: {
          'admin-panel': false,
          'analytics-dashboard': false,
          'user-management': false,
          billing: false,
        },
      })
      break
  }
}