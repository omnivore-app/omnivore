import { TermsAndConditions } from '../../components/templates/TermsAndConditions'
import { applyStoredTheme } from '../../lib/themeUpdater'

export default function Terms(): JSX.Element {
  applyStoredTheme(false) // false to skip server sync
  return <TermsAndConditions isAppEmbed />
}
