import { useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { Button } from '../elements/Button'

export function ExportDataButton(): JSX.Element {
  const [disabledState, setDisabledState] = useState<boolean>(false)

  const handleExportClick = async () => {
    setDisabledState(true)

    try {
      // Make a GET request to the /export endpoint
      const response = await fetch('/api/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch export data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      showErrorToast('Failed to export data')

      setDisabledState(false)
      return
    }

    showSuccessToast(
      'Started exporting data. You will receive an email shortly.'
    )
  }

  return (
    <Button
      type="submit"
      style={disabledState ? 'ctaGray' : 'ctaOmnivoreYellow'}
      css={{
        padding: '10px 50px',
      }}
      disabled={disabledState}
      onClick={() => {
        handleExportClick()
      }}
    >
      Export My Data
    </Button>
  )
}
