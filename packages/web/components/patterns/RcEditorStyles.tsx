export const RcEditorStyles = (isDark: boolean, shadow: boolean) => {
  return {
    '.rc-md-editor .rc-md-navigation': {
      background: '$grayBg',
      borderBottom: '1px solid transparent',
    },
    '.rc-md-editor': {
      borderRadius: '5px',
      backgroundColor: isDark ? '#2A2A2A' : 'white',
      border: '1px solid transparent',
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
      fontFamily: '$inter',
      color: isDark ? '#EBEBEB' : 'black',
      backgroundColor: isDark ? '#2A2A2A' : 'white',
      resize: 'vertical',
      minHeight: '42px',
    },
    '.rc-md-editor .drop-wrap': {
      border: '1px solid transparent',
      backgroundColor: isDark ? '#2A2A2A' : 'white',
    },
  }
}

export const MDEditorSettings = {
  view: { menu: false, md: true, html: false },
  canView: {
    menu: false,
    md: true,
    html: true,
    both: false,
    fullScreen: false,
    hideMenu: false,
  },
  plugins: [
    'tab-insert',
    'header',
    'font-bold',
    'font-italic',
    'font-underline',
    'font-strikethrough',
    'list-unordered',
    'list-ordered',
    'block-quote',
    'link',
    'auto-resize',
    'save',
  ],
}
