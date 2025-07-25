export interface Contact {
  id: string
  nom: string
  numeroComplet: string
  timestamp: string
  createdAt: Date
}

export interface Message {
  id: string
  nom: string
  email: string
  telephone: string
  sujet: string
  message: string
  timestamp: string
  read: boolean
  createdAt: Date
}

export interface AdminUser {
  username: string
  password: string
  lastLogin?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface Stats {
  totalContacts: number
  totalMessages: number
  newMessages: number
  readMessages: number
  todayContacts: number
  todayMessages: number
  readRate: number
}
