import { bufferDecodeUtf8, prettyPrint, svgEncode, SvgEncodeOptions, svgTransform, TreeNode, uiDownload } from '@figmania/common'
import { Button, Code, ICON, Navbar, Select, SelectOption, useClipboard, useConfig, useController, useNode, useNotify } from '@figmania/ui'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import styles from './App.module.scss'
import { Config, Schema } from './Schema'

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

export const App: FunctionComponent = () => {
  const [config, saveConfig] = useConfig<Config>()
  const [options, setOptions] = useState<SvgEncodeOptions>({ encoding: 'none', css: false })
  const [code, setCode] = useState<string>()
  const notify = useNotify()
  const messenger = useController<Schema>()
  const node = useNode()
  const clipboard = useClipboard()

  const formattedCode = useMemo(() => {
    if (!code) { return }
    return svgEncode(prettyPrint(code), options)
  }, [code, options])

  useEffect(() => {
    if (!node) { return }
    setCode(undefined)
    messenger.request('export', node).then(bufferDecodeUtf8).then((contents) => {
      setCode(svgTransform(contents, node))
    })
  }, [node])

  if (!node) { return <Navbar icon={ICON.SYMBOL_COMPONENT} title='No node selected' disabled /> }

  return (
    <>
      <Navbar icon={ICON.SYMBOL_COMPONENT} title={node.name}>
        <Select className={styles['preset-select']} placeholder="Export Preset" value={currentPreset} options={EXPORT_PRESET_SELECT_OPTIONS} onChange={(option) => {
          const { state: { css, encoding }, value } = option as ExportPresetOption
          currentPreset = value
          setOptions({ css, encoding })
        }} />
        <Button icon={ICON.UI_CLIPBOARD} onClick={() => {
          if (!formattedCode) { return }
          clipboard(formattedCode)
          notify('Code copied to clipboard')
        }} />
        <Button icon={ICON.UI_DOWNLOAD} onClick={() => {
          if (!formattedCode || !node) { return }
          if (options.encoding === 'none') {
            uiDownload(formattedCode, { type: 'image/svg+xml', filename: `${node.name}.svg` })
          } else if (options.css) {
            uiDownload(formattedCode, { type: 'text/css', filename: `${node.name}.css` })
          } else {
            uiDownload(formattedCode, { type: 'text/plain', filename: `${node.name}.txt` })
          }
        }} />
        <Button icon={config.preview ? ICON.CONTROL_SHOW : ICON.CONTROL_HIDE} selected={config.preview} onClick={() => {
          saveConfig({ preview: !config.preview })
        }} />
      </Navbar>
      {config.preview && (
        <Code className={styles['container']} value={formattedCode ?? 'Loading ...'} />
      )}
    </>
  )
}
