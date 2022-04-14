import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Toaster, ToastPosition } from 'react-hot-toast'
import { showErrorToast, showSuccessToast } from '../lib/toastHelpers'

export default {
  title: 'Components/Snackbar',
  component: Toaster,
  argTypes: {
    position: {
      description: 'The position of the snackbar',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-right',
        'bottom-center',
        'bottom-left',
      ],
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof Toaster>

const Template = ({ showToast, position }: { showToast: () => void; position?: ToastPosition }) => (
  <div>
      <Toaster position={position} />
      <div
        style={{
          height: '15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button onClick={showToast}>Show Toast</button>
      </div>
    </div>
)

export const SuccessSnackbar: ComponentStory<typeof Toaster> = (args: any) => {
  return (
    <Template {...args} showToast={() => showSuccessToast('Success Message')} />
  )
}

export const ErrorSnackbar: ComponentStory<typeof Toaster> = (args: any) => {
  return (
    <Template {...args} showToast={() => showErrorToast('Error Message!')} />
  )
}
