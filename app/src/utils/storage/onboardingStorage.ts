import { BaseStorage } from './baseStorage'

/**
 * Storage service for managing onboarding state
 */
export class OnboardingStorage extends BaseStorage {
  protected readonly storageKey = 'aiutaOnboardingCompleted'

  /**
   * Gets onboarding completion status from localStorage
   */
  static getOnboardingCompleted(): boolean {
    const instance = new this()
    return instance.safeRead<boolean>(false)
  }

  /**
   * Sets onboarding completion status in localStorage
   */
  static setOnboardingCompleted(completed: boolean): void {
    const instance = new this()
    instance.safeWrite(completed)
  }

  /**
   * Clears onboarding status (resets to not completed)
   */
  static clearOnboarding(): void {
    const instance = new this()
    instance.safeRemove()
  }
}
