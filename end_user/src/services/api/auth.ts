import { authentication } from './init'

/**
 * Authentication service for handling user authentication
 */
export class AuthService {
  /**
   * Login as anonymous user
   * This should be called before any API requests to get an anonymous token
   */
  async loginAsAnonymous(): Promise<void> {
    try {
      await authentication.loginAsAnonymous()
    } catch (error) {
      console.error('Failed to login as anonymous:', error)
      throw error
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await authentication.login(email, password)
    } catch (error) {
      console.error('Failed to login:', error)
      throw error
    }
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string): Promise<void> {
    try {
      await authentication.register(email, password)
    } catch (error) {
      console.error('Failed to register:', error)
      throw error
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await authentication.logout()
    } catch (error) {
      console.error('Failed to logout:', error)
      throw error
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return authentication.isAuthenticated()
  }

  /**
   * Get current user information
   */
  getCurrentUser() {
    return authentication.getCurrentUser()
  }
}

// Export a singleton instance
export const authService = new AuthService()

