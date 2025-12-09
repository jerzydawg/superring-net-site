/**
 * Keyword Module Loader
 * Loads keyword-specific variations + global shared variations
 * CRITICAL: Uses STATIC imports only for Vercel bundler compatibility
 */

import { validateKeyword, getKeywordConfig, getKeywordModuleFolder } from '../keyword-config';
import { getFormVariations } from './form-variations';
import { getTrustVariations } from './trust-variations';
import { getProgramVariations } from './program-variations';
import { getProviderVariations } from './provider-variations';
import { getSchemaVariations } from './schema-variations';

// STATIC IMPORTS - All keyword modules imported at top level
import * as freeGovPhone from '../keywords/free-government-phone/index';

/**
 * Load variation module for specific keyword + global variations
 * Throws error if keyword is invalid or disabled
 * @param keywordId - Keyword identifier (e.g., 'free-government-phone')
 * @returns Module containing keyword-specific + global variation functions
 */
export async function loadKeywordVariations(keywordId: string) {
  // Validate keyword exists and is enabled
  if (!validateKeyword(keywordId)) {
    const config = getKeywordConfig(keywordId);
    if (!config) {
      throw new Error(
        `Invalid keyword ID: "${keywordId}". ` +
        `Keyword not found in configuration. ` +
        `Available keywords must be selected from admin dropdown.`
      );
    }
    if (!config.enabled) {
      throw new Error(
        `Keyword "${keywordId}" is currently disabled. ` +
        `Complete variation modules must be built before enabling.`
      );
    }
  }

  // STATIC MODULE MAPPING - No dynamic imports
  let keywordModule;
  
  switch (keywordId) {
    case 'free-government-phone':
      keywordModule = freeGovPhone;
      break;
    default:
      throw new Error(
        `Keyword module not found for: ${keywordId}. ` +
        `Module must be imported statically in keyword-loader.ts`
      );
  }
  
  // Merge keyword-specific + global variations
  return {
    // Keyword-specific (H1, H2, H3, Meta, FAQ)
    ...keywordModule,
    
    // Global shared functions
    getFormVariations,
    getTrustVariations,
    getProgramVariations,
    getProviderVariations,
    getSchemaVariations,
  };
}

/**
 * Preload check - verify keyword module exists without loading it
 * Useful for validation during site creation
 */
export function canLoadKeyword(keywordId: string): boolean {
  try {
    return validateKeyword(keywordId);
  } catch {
    return false;
  }
}

/**
 * Get keyword label for display
 */
export function getKeywordLabel(keywordId: string): string {
  const config = getKeywordConfig(keywordId);
  return config?.label || keywordId;
}

/**
 * Get keyword module folder name
 */
export function getKeywordModule(keywordId: string): string {
  return getKeywordModuleFolder(keywordId);
}
