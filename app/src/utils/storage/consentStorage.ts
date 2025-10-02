import { BaseStorage } from './baseStorage'

/**
 * Storage service for managing consent state
 */
export class ConsentStorage extends BaseStorage {
  protected readonly storageKey = 'aiutaObtainedConsentIds'

  /**
   * Gets obtained consent IDs from localStorage
   */
  static getObtainedConsentIds(): string[] {
    const instance = new this()
    return instance.safeRead<string[]>([])
  }

  /**
   * Sets obtained consent IDs in localStorage
   */
  static setObtainedConsentIds(consentIds: string[]): void {
    const instance = new this()
    instance.safeWrite(consentIds)
  }

  /**
   * Adds new consent IDs to existing ones
   */
  static addConsentIds(newConsentIds: string[]): void {
    const existingIds = this.getObtainedConsentIds()
    const uniqueIds = Array.from(new Set([...existingIds, ...newConsentIds]))
    this.setObtainedConsentIds(uniqueIds)
  }

  /**
   * Checks if a specific consent ID has been obtained
   */
  static hasConsent(consentId: string): boolean {
    const obtainedIds = this.getObtainedConsentIds()
    return obtainedIds.includes(consentId)
  }

  /**
   * Clears all consent data
   */
  static clearConsents(): void {
    const instance = new this()
    instance.safeRemove()
  }
}
