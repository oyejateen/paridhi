/**
 * Language Translation Utility
 * Uses Google Translate cookie-based approach for reliable language switching
 * Supports Indian languages only
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇮🇳' },
]

const LANGUAGE_STORAGE_KEY = 'paridhi:selectedLanguage'
const SCROLL_POSITION_KEY = 'paridhi:scrollPosition'

/**
 * Set Google Translate cookie to switch language
 * This is the most reliable method that actually works
 */
function setGoogleTranslateCookie(languageCode: string): void {
  if (languageCode === 'en') {
    // Remove the cookie to reset to English
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  } else {
    // Set cookie in format required by Google Translate
    document.cookie = `googtrans=/en/${languageCode}; path=/; expires=Fri, 31 Dec 2099 23:59:59 GMT;`
  }
  console.log(`✓ Set Google Translate cookie for language: ${languageCode}`)
}

/**
 * Get current language from cookie
 */
function getLanguageFromCookie(): string {
  if (typeof document === 'undefined') return 'en'
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'googtrans') {
      // Cookie format is: googtrans=/en/hi
      const lang = value.split('/')[2]
      return lang || 'en'
    }
  }
  return 'en'
}

/**
 * Save current scroll position before reload
 */
function saveScrollPosition(): void {
  if (typeof window !== 'undefined') {
    const scrollY = window.scrollY || window.pageYOffset || 0
    sessionStorage.setItem(SCROLL_POSITION_KEY, scrollY.toString())
    console.log(`💾 Saved scroll position: ${scrollY}`)
  }
}

/**
 * Restore scroll position after reload
 */
function restoreScrollPosition(): void {
  if (typeof window !== 'undefined') {
    const savedScroll = sessionStorage.getItem(SCROLL_POSITION_KEY)
    if (savedScroll) {
      const scrollY = parseInt(savedScroll, 10)
      window.scrollTo(0, scrollY)
      sessionStorage.removeItem(SCROLL_POSITION_KEY)
      console.log(`↩ Restored scroll position: ${scrollY}`)
    }
  }
}

/**
 * Perform a silent page reload with loading overlay
 */
function performSilentReload(): void {
  if (typeof window === 'undefined') return
  
  // Save current scroll position
  saveScrollPosition()
  
  // Create subtle loading overlay
  const overlay = document.createElement('div')
  overlay.id = 'language-reload-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease-out;
    pointer-events: none;
  `
  document.body.appendChild(overlay)
  
  // Fade in briefly then reload
  setTimeout(() => {
    overlay.style.opacity = '0.3'
  }, 50)
  
  setTimeout(() => {
    window.location.reload()
  }, 300)
}

/**
 * Try DOM-based translation methods first (no reload needed)
 */
async function tryDOMTranslation(languageCode: string): Promise<boolean> {
  try {
    // Find the combo element (language selector)
    const element = document.querySelector('.goog-te-combo') as HTMLSelectElement
    if (element && element.value !== undefined) {
      console.log('🔄 Using DOM-based translation method')
      element.value = languageCode
      element.dispatchEvent(new Event('change'))
      element.dispatchEvent(new Event('input'))
      element.dispatchEvent(new Event('blur'))
      
      // Give it a moment to apply
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Check if it actually worked
      if (getLanguageFromCookie() === languageCode || element.value === languageCode) {
        console.log(`✓ Language changed via DOM to ${languageCode}`)
        return true
      }
    }
  } catch (error) {
    console.warn('⚠ DOM-based translation failed:', error)
  }
  
  return false
}

/**
 * Change the website language using best available method
 * @param languageCode - Language code (e.g., 'hi', 'ta', 'en')
 */
export async function changeLanguage(languageCode: string): Promise<void> {
  try {
    // Validate language code
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === languageCode)) {
      console.warn(`⚠ Invalid language code: ${languageCode}`)
      return
    }

    // Store preference
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode)
    console.log(`💾 Saved language preference: ${languageCode}`)

    // Try DOM-based approach first (faster, no reload)
    const domSuccess = await tryDOMTranslation(languageCode)
    if (domSuccess) {
      return
    }

    // Fall back to cookie + reload (most reliable)
    console.log(`📄 Using cookie-based translation with page reload`)
    setGoogleTranslateCookie(languageCode)
    
    // Perform a subtle reload
    performSilentReload()
  } catch (error) {
    console.error('❌ Error changing language:', error)
  }
}

/**
 * Get the previously selected language from localStorage
 */
export function getStoredLanguage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LANGUAGE_STORAGE_KEY)
}

/**
 * Reset to English
 */
export async function resetLanguage(): Promise<void> {
  await changeLanguage('en')
  localStorage.removeItem(LANGUAGE_STORAGE_KEY)
}

/**
 * Initialize translation on page load
 * Restores previously selected language if available
 */
export async function initializeLanguagePreference(): Promise<void> {
  // Restore scroll position if reload just happened
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      restoreScrollPosition()
    })
  }

  const storedLanguage = getStoredLanguage()
  
  if (storedLanguage && storedLanguage !== 'en') {
    console.log(`🔄 Restoring language preference: ${storedLanguage}`)
    
    // Check if cookie is already set (we just reloaded)
    const cookieLanguage = getLanguageFromCookie()
    if (cookieLanguage === storedLanguage) {
      console.log(`✓ Language already applied via cookie: ${storedLanguage}`)
      return
    }
    
    // Wait a moment then set cookie and reload
    await new Promise((resolve) => setTimeout(resolve, 500))
    setGoogleTranslateCookie(storedLanguage)
    performSilentReload()
  } else {
    console.log('✓ Using default language (English)')
  }
}

/**
 * Check if Google Translate is available
 */
export function isGoogleTranslateAvailable(): boolean {
  return typeof window !== 'undefined' && (window as any).google?.translate !== null
}
