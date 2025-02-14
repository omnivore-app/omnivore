/* eslint-disable functional/no-class */

import { FloppyDisk } from '@phosphor-icons/react'
import { PluginComponent } from 'react-markdown-editor-lite'
import { Button } from '../elements/Button'

export default class MDEditorSavePlugin extends PluginComponent {
  static pluginName = 'save'

  static align = 'right'

  constructor(props: any) {
    super(props)
  }

  render() {
    return (
      <Button
        style="plainIcon"
        css={{
          alignItems: 'center',
          display: 'flex',
          height: '28px',
          justifyContent: 'center',
          lineHeight: '28px',
          minWidth: '24px',
        }}
        onClick={(event) => {
          document.dispatchEvent(new Event('saveMarkdownNote'))
          event.preventDefault()
        }}
      >
        <FloppyDisk size={18} weight="bold" color="#757575" />
      </Button>
    )
  }
}
