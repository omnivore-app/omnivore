export const RcEditorStyles = (isDark: boolean, shadow: boolean) => {
  return {
    '.rc-md-editor .rc-md-navigation': {
      background: '$grayBg',
      borderBottom: '1px solid $thBorderSubtle',
    },
    '.rc-md-editor': {
      borderRadius: '5px',
      backgroundColor: isDark ? '#2A2A2A' : 'white',
      border: '1px solid $thBorderSubtle',
    },
    '.rc-md-navigation': {
      borderRadius: '5px',
      borderBottomLeftRadius: '0px',
      borderBottomRightRadius: '0px',
      background: 'var(--colors-grayBg)',
    },
    '.rc-md-editor .editor-container >.section': {
      borderRight: 'unset',
    },
    '.rc-md-editor .editor-container .sec-md .input': {
      padding: '10px',
      borderRadius: '5px',
      fontSize: '16px',
      color: isDark ? '#EBEBEB' : 'black',
      backgroundColor: isDark ? '#2A2A2A' : 'white',
    },
    '.rc-md-editor .drop-wrap': {
      border: '1px solid $thBorderSubtle',
      backgroundColor: isDark ? '#2A2A2A' : 'white',
    },
  }
}
