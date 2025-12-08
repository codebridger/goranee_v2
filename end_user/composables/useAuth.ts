import { authentication } from '@modular-rest/client'

/**
 * Composable for authentication
 */
export const useAuth = () => {
  /**
   * Login as anonymous user
   * This should be called before any API requests to get an anonymous token
   */
  const loginAsAnonymous = async (): Promise<void> => {
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
  const login = async (email: string, password: string): Promise<void> => {
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
  const register = async (email: string, password: string): Promise<void> => {
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
  const logout = async (): Promise<void> => {
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
  const isAuthenticated = (): boolean => {
    return authentication.isAuthenticated()
  }

  /**
   * Get current user information
   */
  const getCurrentUser = () => {
    return authentication.getCurrentUser()
  }

  return {
    loginAsAnonymous,
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
  }
}


