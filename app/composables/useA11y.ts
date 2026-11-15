// Accessibility settings and a shared "announcer".
// Settings are saved in localStorage and applied as classes on <html>.
// announce() updates a hidden live region (read by screen readers) and, when
// "Read aloud" is on, also speaks the text with the browser's built-in voice.

export interface A11ySettings {
  textSize: 0 | 1 | 2 // normal, large, larger
  highContrast: boolean
  reduceMotion: boolean
  readAloud: boolean
  treeText: boolean // show the text description under every tree diagram
}

const KEY = 'mainframe-a11y-v1'
const defaults = (): A11ySettings => ({ textSize: 0, highContrast: false, reduceMotion: false, readAloud: false, treeText: false })
let loaded = false

export function useA11y() {
  const settings = useState<A11ySettings>('mf-a11y', defaults)
  const live = useState('mf-live', () => ({ polite: '', assertive: '' }))

  if (import.meta.client && !loaded) {
    loaded = true
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) settings.value = { ...defaults(), ...JSON.parse(raw) }
      else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) settings.value.reduceMotion = true
    } catch { /* storage blocked: keep defaults */ }
    watch(settings, (v) => {
      try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ }
      if (!v.readAloud) stopSpeaking()
    }, { deep: true })
  }

  /** Tell screen-reader users (and "Read aloud" users) what just happened. */
  function announce(text: string, urgent = false) {
    if (!text) return
    const k = urgent ? 'assertive' : 'polite'
    // clear first so the same sentence twice is still announced
    live.value.polite = ''
    live.value.assertive = ''
    setTimeout(() => { live.value[k] = text }, 50)
    if (settings.value.readAloud) speak(text)
  }

  return { settings, live, announce, speak, stopSpeaking }
}

export function speak(text: string) {
  if (!import.meta.client || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text.replace(/←/g, ' becomes ').replace(/→/g, ', then '))
  u.lang = 'en-GB'
  u.rate = 0.95
  window.speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (import.meta.client && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}
