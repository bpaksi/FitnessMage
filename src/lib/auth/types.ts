export type AuthMethod = 'session' | 'device-token'

export interface AuthResult {
  userId: string
  authMethod: AuthMethod
}
