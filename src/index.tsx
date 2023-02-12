import { bufferDecodeUtf8, svgEncode, SvgEncodeOptions, svgPrettify, svgTransform, TreeNode, uiDownload } from '@figmania/common'
import { Button, Code, Navbar, Select, SelectOption, Theme, UIComponent } from '@figmania/ui'
import { createRef } from 'react'
import * as ReactDOM from 'react-dom'
import { ExportRequest, ExportResponse, NotifyRequest, SelectRequest } from './types/messages'

export interface UiState extends SvgEncodeOptions {
  node?: TreeNode
  contents?: string
}

export interface ExportPresetOption extends SelectOption {
  value: string
  title: string
  state: SvgEncodeOptions
}

export const EXPORT_PRESET_SELECT_OPTIONS: ExportPresetOption[] = [
  { value: 'none-false', title: 'SVG', state: { encoding: 'none', css: false } },
  { value: 'plain-false', title: 'Data Uri (plain)', state: { encoding: 'plain', css: false } },
  { value: 'base64-false', title: 'Data Uri (base64)', state: { encoding: 'base64', css: false } },
  { value: 'plain-true', title: 'CSS (plain)', state: { encoding: 'plain', css: true } },
  { value: 'base64-true', title: 'CSS (base64)', state: { encoding: 'base64', css: true } }
]

let currentPreset = 'none-false'

class Ui extends UIComponent<{}, UiState> {
  state: UiState = { encoding: 'none', css: false }

  private textarea = createRef<HTMLTextAreaElement>()

  constructor(props: {}) {
    super(props)
    this.messenger.addRequestHandler('select', this.handleSelectRequest.bind(this))
    this.onClipboardClick = this.onClipboardClick.bind(this)
    this.onDownloadClick = this.onDownloadClick.bind(this)
    this.onPresetChange = this.onPresetChange.bind(this)
  }

  async handleSelectRequest({ node }: SelectRequest): Promise<void> {
    this.setState({ node })
    if (!node) { return }
    const { buffer } = await this.messenger.request<ExportRequest, ExportResponse>('export', { node })
    const contents = await bufferDecodeUtf8(buffer)
    this.setState({ contents })
  }

  async onClipboardClick() {
    if (!this.state.contents || !this.state.node || !this.textarea.current) { return }
    this.textarea.current.value = this.formattedCode
    this.textarea.current.select()
    document.execCommand('copy')
    this.messenger.request<NotifyRequest, void>('notify', { message: 'Code copied to clipboard' })
  }

  async onDownloadClick() {
    if (!this.state.contents || !this.state.node) { return }
    if (this.state.encoding === 'none') {
      uiDownload(this.formattedCode, { type: 'image/svg+xml', filename: `${this.state.node.name}.svg` })
    } else if (this.state.css) {
      uiDownload(this.formattedCode, { type: 'text/css', filename: `${this.state.node.name}.css` })
    } else {
      uiDownload(this.formattedCode, { type: 'text/plain', filename: `${this.state.node.name}.txt` })
    }
  }

  onPresetChange(option: SelectOption) {
    const { state: { css, encoding }, value } = option as ExportPresetOption
    currentPreset = value
    this.setState({ css, encoding })
  }

  render() {
    const { node } = this.state
    return (
      <Theme theme='dark'>
        {node ? (
          <>
            <Navbar icon='ui-instance' title={node.name}>
              <Select className="preset-select" placeholder="Export Preset" value={currentPreset} options={EXPORT_PRESET_SELECT_OPTIONS} onChange={this.onPresetChange}></Select>
              <Button icon='ui-clipboard' onClick={() => { this.onClipboardClick() }} />
              <Button icon='ui-download' onClick={() => { this.onDownloadClick() }} />
            </Navbar>
            <Code className='container' source={this.formattedCode} lang={this.language} />
          </>
        ) : (
          <Navbar icon='ui-info' title='No node selected' isDisabled={true} />
        )}
        <textarea ref={this.textarea} wrap="soft" readOnly={true}></textarea>
      </Theme>
    )
  }

  get language(): 'xml' | 'css' | 'html' {
    if (this.state.encoding === 'none') {
      return 'html'
    } else if (this.state.css) {
      return 'css'
    } else {
      return 'xml'
    }
  }

  get formattedCode(): string {
    const { contents, node, encoding, css } = this.state
    if (!contents || !node) { return '...' }
    let code = contents
    code = svgTransform(code, node, { replaceIds: true })
    code = svgPrettify(code, { maxChar: 0, indentSize: 2 })
    code = svgEncode(code, { encoding, css })
    return code
  }
}

ReactDOM.render(<Ui />, document.getElementById('ui'))
