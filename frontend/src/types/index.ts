export type UserRole = 'ADMIN' | 'USER'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  enabled: boolean
  createdAt: string
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  assignedTo?: User
  createdBy?: User
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  role: UserRole
  userId: number
  email: string
}

export interface AuthState {
  token: string | null
  user: {
    userId: number
    username: string
    role: UserRole
    email: string
  } | null
  isAuthenticated: boolean
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  assignedToId?: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  assignedToId?: number
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role: UserRole
}

export interface ApiError {
  status: number
  message: string
  timestamp: string
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Cần làm',
  IN_PROGRESS: 'Đang làm',
  DONE: 'Hoàn thành',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: 'default',
  IN_PROGRESS: 'processing',
  DONE: 'success',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'cyan',
  MEDIUM: 'orange',
  HIGH: 'red',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Quản trị viên',
  USER: 'Người dùng',
}

// ─── Msuite Account ───────────────────────────────────────────────────────────

export type MsuiteCountry = 'MVT' | 'NCM' | 'VTB' | 'VTC' | 'STL' | 'MYT' | 'VNM' | 'VTL' | 'VTP' | 'VTZ'

export const MSUITE_COUNTRIES: MsuiteCountry[] = [
  'MVT', 'NCM', 'VTB', 'VTC', 'STL', 'MYT', 'VNM', 'VTL', 'VTP', 'VTZ',
]

export interface MsuiteAccount {
  id: number
  country: MsuiteCountry
  keyRestore?: string
  domain: string
  account: string
  password: string
  createdAt: string
  updatedAt: string
}

export interface MsuiteAccountRequest {
  country: MsuiteCountry
  keyRestore?: string
  domain: string
  account: string
  password: string
}

// ─── Knowledge Note ───────────────────────────────────────────────────────────

export interface KnowledgeNote {
  id: number
  title: string
  content: string
  category?: string
  tags?: string
  createdBy?: { id: number; username: string }
  createdAt: string
  updatedAt: string
}

export interface KnowledgeNoteRequest {
  title: string
  content: string
  category?: string
  tags?: string
}
