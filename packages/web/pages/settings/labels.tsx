import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import { Box, VStack } from '../../components/elements/LayoutPrimitives'
import { Toaster } from 'react-hot-toast'
import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { createLabelMutation } from '../../lib/networking/mutations/createLabelMutation'
import { deleteLabelMutation } from '../../lib/networking/mutations/deleteLabelMutation'
import { useState } from 'react'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'

export default function LabelsPage(): JSX.Element {
  const { labels, revalidate, isValidating } = useGetLabelsQuery()
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [description, setDescription] = useState('')

  applyStoredTheme(false)

  async function createLabel(): Promise<void> {
    const res = await createLabelMutation(name, color, description)
    if (res) {
      if (res.createLabel.errorCodes && res.createLabel.errorCodes.length > 0) {
        showErrorToast(res.createLabel.errorCodes[0])
      } else {
        showSuccessToast('Label created')
        setName('')
        setColor('')
        setDescription('')
        revalidate()
      }
    } else {
      showErrorToast('Failed to create label')
    }
  }

  async function deleteLabel(id: string): Promise<void> {
    await deleteLabelMutation(id)
    revalidate()
  }

  return (
    <PrimaryLayout pageTestId="settings-labels-tag">
      <Toaster />
      <VStack css={{ mx: '42px' }}>
        <h2>Create a new label</h2>
        <form
          onSubmit={async (e): Promise<void> => {
            e.preventDefault()
            await createLabel()
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value)
            }}
          />
          <input
            type="text"
            name="color"
            placeholder="Color"
            required
            value={color}
            onChange={(event) => {
              setColor(event.target.value)
            }}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
            }}
          />
          <Button type="submit" disabled={isValidating}>
            Create
          </Button>
        </form>

        <h2>Labels</h2>
        {labels &&
          labels.map((label) => {
            return (
              <Box key={label.id}>
                <form
                  onSubmit={async (e): Promise<void> => {
                    e.preventDefault()
                    await deleteLabel(label.id)
                  }}
                >
                  <input type="text" value={label.name} disabled />
                  <input type="text" value={label.color} disabled />
                  <input type="text" value={label.description} disabled />
                  <Button type="submit" disabled={isValidating}>
                    Delete
                  </Button>
                </form>
              </Box>
            )
          })}
      </VStack>
    </PrimaryLayout>
  )
}
