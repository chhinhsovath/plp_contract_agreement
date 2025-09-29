export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  COORDINATOR = 'COORDINATOR',
  OFFICER = 'OFFICER',
  VIEWER = 'VIEWER',
  PARTNER = 'PARTNER'
}

export interface RoleDefinition {
  name: string
  nameKhmer: string
  description: string
  descriptionKhmer: string
  permissions: string[]
  level: number // Higher number = more privileges
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  [UserRole.SUPER_ADMIN]: {
    name: 'Super Administrator',
    nameKhmer: 'អ្នកគ្រប់គ្រងកំពូល',
    description: 'Full system access with user management capabilities',
    descriptionKhmer: 'សិទ្ធិពេញលេញក្នុងប្រព័ន្ធ និងគ្រប់គ្រងអ្នកប្រើប្រាស់',
    level: 100,
    permissions: [
      'contracts.create',
      'contracts.read',
      'contracts.update',
      'contracts.delete',
      'contracts.approve',
      'contracts.sign_all',
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'users.manage_roles',
      'system.manage',
      'reports.view_all',
      'reports.export_all'
    ]
  },
  [UserRole.ADMIN]: {
    name: 'Administrator',
    nameKhmer: 'អ្នកគ្រប់គ្រង',
    description: 'Department head or Director level with full contract management',
    descriptionKhmer: 'ប្រធាននាយកដ្ឋាន ឬថ្នាក់ដឹកនាំ មានសិទ្ធិគ្រប់គ្រងកិច្ចព្រមព្រៀងពេញលេញ',
    level: 80,
    permissions: [
      'contracts.create',
      'contracts.read',
      'contracts.update',
      'contracts.delete',
      'contracts.approve',
      'contracts.sign_party_a',
      'users.read',
      'users.update_own',
      'reports.view_all',
      'reports.export_all'
    ]
  },
  [UserRole.MANAGER]: {
    name: 'Manager',
    nameKhmer: 'អ្នកគ្រប់គ្រង',
    description: 'Project Manager or Unit Manager with contract creation and management',
    descriptionKhmer: 'អ្នកគ្រប់គ្រងគម្រោង ឬអង្គភាព អាចបង្កើត និងគ្រប់គ្រងកិច្ចព្រមព្រៀង',
    level: 60,
    permissions: [
      'contracts.create',
      'contracts.read',
      'contracts.update',
      'contracts.sign_party_b',
      'users.read',
      'users.update_own',
      'reports.view_department',
      'reports.export_department'
    ]
  },
  [UserRole.COORDINATOR]: {
    name: 'Coordinator',
    nameKhmer: 'អ្នកសម្របសម្រួល',
    description: 'Regional or District Coordinator with contract creation rights',
    descriptionKhmer: 'អ្នកសម្របសម្រួលតំបន់ ឬស្រុក អាចបង្កើតកិច្ចព្រមព្រៀង',
    level: 40,
    permissions: [
      'contracts.create',
      'contracts.read',
      'contracts.update_own',
      'users.read',
      'users.update_own',
      'reports.view_own',
      'reports.export_own'
    ]
  },
  [UserRole.OFFICER]: {
    name: 'Officer',
    nameKhmer: 'មន្រ្តី',
    description: 'Field Officer or School Principal with limited contract rights',
    descriptionKhmer: 'មន្រ្តីតំបន់ ឬនាយកសាលា មានសិទ្ធិកំរិតលើកិច្ចព្រមព្រៀង',
    level: 20,
    permissions: [
      'contracts.read',
      'contracts.create_draft',
      'contracts.update_own_draft',
      'users.read_own',
      'users.update_own',
      'reports.view_own'
    ]
  },
  [UserRole.VIEWER]: {
    name: 'Viewer',
    nameKhmer: 'អ្នកមើល',
    description: 'Read-only access to contracts and reports',
    descriptionKhmer: 'មានសិទ្ធិតែមើលកិច្ចព្រមព្រៀង និងរបាយការណ៍',
    level: 10,
    permissions: [
      'contracts.read',
      'users.read_own',
      'users.update_own',
      'reports.view_public'
    ]
  },
  [UserRole.PARTNER]: {
    name: 'Partner',
    nameKhmer: 'ដៃគូ',
    description: 'External partner with access to contract forms only',
    descriptionKhmer: 'ដៃគូខាងក្រៅ អាចចូលប្រើទម្រង់កិច្ចព្រមព្រៀងតែប៉ុណ្ណោះ',
    level: 5,
    permissions: [
      'contracts.create_draft',
      'contracts.read_own',
      'contracts.update_own_draft',
      'users.read_own',
      'users.update_own'
    ]
  }
}

// Helper functions
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const role = ROLE_DEFINITIONS[userRole]
  if (!role) return false
  return role.permissions.includes(permission)
}

export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerLevel = ROLE_DEFINITIONS[managerRole]?.level || 0
  const targetLevel = ROLE_DEFINITIONS[targetRole]?.level || 0
  return managerLevel > targetLevel
}

export function getRoleByLevel(level: number): UserRole | null {
  const roles = Object.entries(ROLE_DEFINITIONS).find(
    ([_, def]) => def.level === level
  )
  return roles ? (roles[0] as UserRole) : null
}

export function getRoleLabel(role: UserRole, locale: 'en' | 'km' = 'km'): string {
  const roleDefinition = ROLE_DEFINITIONS[role]
  if (!roleDefinition) return role
  return locale === 'km' ? roleDefinition.nameKhmer : roleDefinition.name
}