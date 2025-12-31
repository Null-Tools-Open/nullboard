const NULLPASS_URL = process.env.NULLPASS_URL || 'https://auth.nullpass.xyz'

export interface NullpassUser {
  id: string
  email: string
  displayName?: string
  avatar?: string | null
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
  serviceAccess?: NullpassServiceAccess[]
}

export interface NullpassServiceAccess {
  id: string
  userId: string
  service: 'DROP' | 'MAILS' | 'VAULT' | 'DB' | 'BOARD'
  tier: string
  isPremium: boolean
  connected?: boolean
  accessFlags?: Record<string, any>
  metadata?: Record<string, any>
  customStorageLimit?: number
  customApiKeyLimit?: number
  polarCustomerId?: string
  polarSubscriptionId?: string
  polarSubscriptionStatus?: string
}

export interface NullpassLoginResponse {
  user: {
    id: string
    email: string
    displayName?: string
    avatar?: string | null
    isBanned?: boolean
    isDisabled?: boolean
  }
  token: string
  services?: NullpassServiceAccess[]
  accountStatus?: {
    banned?: boolean
    disabled?: boolean
    banReason?: string
  }
}

export interface NullpassLoginError {
  error: string
  code?: 'ACCOUNT_BANNED' | 'ACCOUNT_DISABLED' | 'SERVICE_DISCONNECTED' | 'INVALID_CREDENTIALS' | 'UNKNOWN'
  accountStatus?: {
    banned?: boolean
    disabled?: boolean
  }
}

export interface NullpassRegisterResponse {
  user: {
    id: string
    email: string
    displayName?: string
    createdAt: string
  }
  token: string
}

export interface NullpassMeResponse {
  user: NullpassUser
}

class NullpassClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = NULLPASS_URL
  }

  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'User-Agent': 'nulldrop-server/1.0',
      ...additionalHeaders,
    }
  }

  async login(email: string, password: string): Promise<NullpassLoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }))
      throw new Error(error.error || 'Login failed')
    }

    return response.json()
  }

  async register(email: string, password: string, displayName?: string, clientIp?: string): Promise<NullpassRegisterResponse> {
    const headers = this.getHeaders()
    if (clientIp) {
      headers['X-Client-IP'] = clientIp
    }

    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        password,
        displayName: displayName || undefined,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Registration failed' }))
      throw new Error(error.error || 'Registration failed')
    }

    return response.json()
  }

  async getMe(token: string): Promise<NullpassMeResponse> {
    const url = `${this.baseUrl}/api/auth/me`

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')

      if (response.status === 401) {
        throw new Error('Unauthorized')
      }

      try {
        const error = JSON.parse(errorText)
        throw new Error(error.error || 'Failed to get user')
      } catch {
        throw new Error(errorText || 'Failed to get user')
      }
    }

    return response.json()
  }

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/password`, {
      method: 'POST',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Password change failed' }))
      throw new Error(error.error || 'Password change failed')
    }
  }

  async verifyPassword(email: string, password: string, verificationCode?: string): Promise<boolean> {
    try {
      const response = await this.loginWith2FA(email, password, verificationCode)
      return !!response.token
    } catch (error: any) {
      if (error.message.includes('Invalid credentials') || error.message.includes('Invalid 2FA')) {
        return false
      }
      throw error
    }
  }

  async updateProfile(token: string, data: { displayName?: string; avatar?: string | null }): Promise<NullpassMeResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      method: 'PATCH',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Profile update failed' }))
      throw new Error(error.error || 'Profile update failed')
    }

    return response.json()
  }

  async logout(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/sessions`, {
      method: 'DELETE',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    })

    if (!response.ok) {
      console.error('Logout failed:', await response.text().catch(() => 'Unknown error'))
    }
  }

  async toggle2FA(token: string, enable: boolean, verificationCode?: string, secret?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/auth/2fa`, {
      method: 'POST',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
      body: JSON.stringify({
        enable,
        verificationCode,
        secret,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '2FA operation failed' }))
      throw new Error(error.error || '2FA operation failed')
    }

    return response.json()
  }

  async loginWith2FA(email: string, password: string, verificationCode?: string, clientIp?: string): Promise<NullpassLoginResponse & { requires2FA?: boolean; pendingToken?: string }> {
    const headers = this.getHeaders()
    if (clientIp) {
      headers['X-Client-IP'] = clientIp
    }

    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        password,
        verificationCode,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' })) as NullpassLoginError

      const error = new Error(errorData.error || 'Login failed') as Error & {
        code?: string
        accountStatus?: { banned?: boolean; disabled?: boolean }
      }

      if (errorData.code) {
        error.code = errorData.code
      }
      if (errorData.accountStatus) {
        error.accountStatus = errorData.accountStatus
      }

      throw error
    }

    const data = await response.json()

    if (data.banned === true) {
      const error = new Error('Your account has been banned') as Error & { code?: string }
      error.code = 'ACCOUNT_BANNED'
      throw error
    }

    if (data.disabled === true) {
      const error = new Error('Your account is disabled') as Error & { code?: string }
      error.code = 'ACCOUNT_DISABLED'
      throw error
    }

    if (!data.requires2FA) {
      let boardService = data.services?.find((s: NullpassServiceAccess) => s.service === 'BOARD')

      if (!boardService) {
        try {
          const newService = await this.createService(data.token, 'BOARD')
          if (data.services) {
            data.services.push(newService)
          } else {
            data.services = [newService]
          }
          boardService = newService
        } catch (error) {
          console.error('Failed to auto-create BOARD service:', error)
        }
      }

      if (!boardService || boardService.connected === false) {
        const error = new Error('Null Board service is not connected') as Error & { code?: string }
        error.code = 'SERVICE_DISCONNECTED'
        throw error
      }
    }

    return data
  }

  async createService(token: string, service: 'DROP' | 'MAILS' | 'VAULT' | 'DB' | 'BOARD'): Promise<NullpassServiceAccess> {
    const response = await fetch(`${this.baseUrl}/api/services`, {
      method: 'POST',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
      body: JSON.stringify({ service }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create service' }))
      throw new Error(error.error || 'Failed to create service')
    }

    const data = await response.json()
    return data.entitlement
  }

  async getSubscription(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/subscription`, {
      method: 'GET',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get subscription' }))
      throw new Error(error.error || 'Failed to get subscription')
    }

    return response.json()
  }

  async cancelSubscription(token: string, subscriptionId: string): Promise<void> {
    if (!subscriptionId || !process.env.POLAR_ACCESS_TOKEN) {
      throw new Error('Subscription ID or Polar access token not available')
    }

    const response = await fetch(`https://api.polar.sh/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`Failed to cancel subscription: ${errorText}`)
    }
  }

  async getUserByUserId(userId: string, internalSecret?: string): Promise<NullpassUser | null> {
    const url = `${this.baseUrl}/api/auth/user/${userId}`

    const headers: Record<string, string> = {}
    if (internalSecret) {
      headers['X-Internal-Secret'] = internalSecret
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(headers),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(errorText || 'Failed to get user')
    }

    const data = await response.json()
    return data.user
  }

  async getAuditLogs(token: string, options?: { limit?: number; offset?: number; action?: string }): Promise<any> {
    const url = new URL(`${this.baseUrl}/api/audit`)
    if (options?.limit) url.searchParams.set('limit', options.limit.toString())
    if (options?.offset) url.searchParams.set('offset', options.offset.toString())
    if (options?.action) url.searchParams.set('action', options.action)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get audit logs' }))
      throw new Error(error.error || 'Failed to get audit logs')
    }

    return response.json()
  }

  async deleteAccount(token: string, password: string, verificationCode?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/delete-account`, {
      method: 'POST',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
      body: JSON.stringify({
        password,
        verificationCode,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete account' }))
      throw new Error(error.error || 'Failed to delete account')
    }
  }

  async getUsersStats(internalSecret?: string): Promise<{ totalUsers: number; premiumUsers: number; freeUsers: number }> {
    const headers: Record<string, string> = {}
    if (internalSecret) {
      headers['X-Internal-Secret'] = internalSecret
    }

    const response = await fetch(`${this.baseUrl}/api/admin/users/stats`, {
      method: 'GET',
      headers: this.getHeaders(headers),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get users stats' }))
      throw new Error(error.error || 'Failed to get users stats')
    }

    return response.json()
  }

  async getAllUsers(page: number = 1, limit: number = 50, internalSecret?: string): Promise<{
    users: Array<{
      id: string
      email: string
      displayName?: string | null
      avatar?: string | null
      createdAt: string
      updatedAt: string
      serviceAccess: {
        tier: string
        isPremium: boolean
        accessFlags: Record<string, any>
        metadata: Record<string, any>
        customStorageLimit: number | null
        customApiKeyLimit: number | null
      }
    }>
    pagination: {
      page: number
      limit: number
      totalCount: number
      totalPages: number
      hasMore: boolean
    }
  }> {
    const headers: Record<string, string> = {}
    if (internalSecret) {
      headers['X-Internal-Secret'] = internalSecret
    }

    const response = await fetch(`${this.baseUrl}/api/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(headers),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get users' }))
      throw new Error(error.error || 'Failed to get users')
    }

    return response.json()
  }

  async updateUserService(
    userId: string,
    service: 'DROP' | 'MAILS' | 'VAULT' | 'DB' | 'BOARD',
    updates: {
      tier?: string
      isPremium?: boolean
      accessFlags?: Record<string, any>
      metadata?: Record<string, any>
      customStorageLimit?: number
      customApiKeyLimit?: number
    },
    internalSecret?: string
  ): Promise<any> {
    const headers: Record<string, string> = {}
    if (internalSecret) {
      headers['X-Internal-Secret'] = internalSecret
    }

    const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: this.getHeaders(headers),
      body: JSON.stringify({
        service,
        ...updates,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update user service' }))
      throw new Error(error.error || 'Failed to update user service')
    }

    return response.json()
  }

  async setCustomDomain(token: string, domain: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/user/custom-domain`, {
      method: 'POST',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
      body: JSON.stringify({ domain }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to set custom domain' }))
      throw new Error(error.error || 'Failed to set custom domain')
    }

    return response.json()
  }

  async removeCustomDomain(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/user/custom-domain`, {
      method: 'DELETE',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove custom domain' }))
      throw new Error(error.error || 'Failed to remove custom domain')
    }

    return response.json()
  }

  async getCustomDomain(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/user/custom-domain`, {
      method: 'GET',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get custom domain' }))
      throw new Error(error.error || 'Failed to get custom domain')
    }

    return response.json()
  }

  async uploadAvatar(token: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(`${this.baseUrl}/api/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'User-Agent': 'nulldrop-server/1.0',
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload avatar' }))
      throw new Error(error.error || 'Failed to upload avatar')
    }

    return response.json()
  }

  async getAvatar(token: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/api/avatar`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'User-Agent': 'nulldrop-server/1.0',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get avatar')
    }

    return response
  }

  async deleteAvatar(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/avatar`, {
      method: 'DELETE',
      headers: this.getHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete avatar' }))
      throw new Error(error.error || 'Failed to delete avatar')
    }
  }

  mapToNulldropUser(nullpassUser: NullpassUser): any {
    const boardService = nullpassUser.serviceAccess?.find(s => s.service === 'BOARD')

    return {
      id: nullpassUser.id,
      email: nullpassUser.email,
      name: nullpassUser.displayName || undefined,
      avatar: nullpassUser.avatar ? '/api/user/avatar' : undefined,
      isPremium: boardService?.isPremium || false,
      isPremiumBoard: boardService?.isPremium || false,
      premiumTierBoard: boardService?.tier || 'free',
      twoFactorEnabled: nullpassUser.twoFactorEnabled,
      isNullBoardTeam: boardService?.accessFlags?.isNullBoardTeam || false,
      nullBoardTeamRole: boardService?.accessFlags?.nullBoardTeamRole || 'member',
      polarCustomerId: boardService?.polarCustomerId,
      polarSubscriptionId: boardService?.polarSubscriptionId,
      polarSubscriptionStatus: boardService?.polarSubscriptionStatus,
      userAcceptedCookies: boardService?.metadata?.userAcceptedCookies ?? undefined,
      userHideProfileInfo: boardService?.metadata?.userHideProfileInfo ?? undefined,
      cloudSyncEnabled: boardService?.metadata?.cloudSyncEnabled ?? undefined,
      animTurnedOff: boardService?.metadata?.animTurnedOff ?? undefined,
      debView: boardService?.metadata?.debView ?? undefined,
      debViewAlw: boardService?.metadata?.debViewAlw ?? undefined,
    }
  }
}

export const nullpassClient = new NullpassClient()