import type { ImageSourcePropType } from 'react-native'

// Central asset registry.
// Replace null with local require(...) once you add files.
// Example:
// tabHome: require('../assets/branding/tab-home.png'),
export const APP_ASSETS: {
  tabHome: ImageSourcePropType | null
  tabCharacter: ImageSourcePropType | null
  tabProgress: ImageSourcePropType | null
  tabProfile: ImageSourcePropType | null
  linkedinLogo: ImageSourcePropType | null
  googleFitLogo: ImageSourcePropType | null
  classRevealAvatar: ImageSourcePropType | null
} = {
  tabHome: require('../assets/branding/home.png'),
  tabCharacter: require('../assets/branding/char.png'),
  tabProgress: require('../assets/branding/progress.png'),
  tabProfile: require('../assets/branding/profile.png'),
  linkedinLogo: require('../assets/branding/linkedin.png'),
  googleFitLogo: require('../assets/branding/fitness.png'),
  classRevealAvatar: require('../assets/branding/classreveal.png'),
}

