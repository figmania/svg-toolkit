import { createController, createUIDelegate } from '@figmania/common'
import { ClipboardProvider, FigmaProvider, PluginUI } from '@figmania/ui'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const controller = createController(createUIDelegate())

createRoot(document.getElementById('root')!).render(
  <FigmaProvider controller={controller}>
    <ClipboardProvider>
      <PluginUI className='theme-container' theme='midnight' minSize={{ width: 300, height: 40 }}>
        <App />
      </PluginUI>
    </ClipboardProvider>
  </FigmaProvider>
)
