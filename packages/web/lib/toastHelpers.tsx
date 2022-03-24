import { toast, ToastOptions } from 'react-hot-toast'
import { CheckCircle, WarningCircle, X } from 'phosphor-react'
import { Box, HStack } from '../components/elements/LayoutPrimitives'
import { styled } from '@stitches/react'

const toastStyles = {
  minWidth: 265,
  height: 56,
  borderRadius: 4,
  boxShadow: '0px 2px 8px rgba(32, 31, 29, 0.33)',
  margin: 0,
  paddingLeft: 6,
  paddingRight: 6,
  paddingTop: 12,
  paddingBottom: 12,
}

const messageStyles = {
  fontSize: 16,
  fontWeight: 'bolder',
  color: 'white',
  flex: 1,
  marginLeft: 16,
}

const MessageContainer = styled(Box, messageStyles)
const FullWidthContainer = styled(HStack, {
  width: '100%',
})

type ToastType  = 'success' | 'error'

const showToast = (
  message: string,
  background: string,
  type: ToastType,
  options?: ToastOptions
) => {
  return toast(
    ({ id }) => (
      <FullWidthContainer alignment='center'>
        {type === 'success' ? <CheckCircle size={24} color='white' /> : <WarningCircle size={24} color='white' />}
        <MessageContainer>{message}</MessageContainer>
        <HStack distribution='end' css={{marginLeft: 16}}>
          <X size={16} style={{cursor: 'pointer'}} color='#CCEAC4' onClick={() => toast.dismiss(id)} />
        </HStack>
      </FullWidthContainer>
    ),
    {
    style: {
      ...toastStyles,
      background: background,
    },
    ...options,
  })
}

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return showToast(message, '#55B938', 'success', options)
}

export const showErrorToast = (message: string, options?: ToastOptions) => {
  return showToast(message, '#cc0000', 'error', options)
}
