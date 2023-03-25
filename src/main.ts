import { configPlugin, createController, createFigmaDelegate, figmaExportAsync, figmaNodeById, nodePlugin, notifyPlugin, resizePlugin } from '@figmania/common'
import { Config, Schema } from './Schema'

createController<Schema>(createFigmaDelegate(), async (controller) => {
  controller.addRequestHandler('export', (node) => figmaExportAsync(figmaNodeById(node.id)))
  const size = await resizePlugin(controller, { width: 640, height: 480 })
  figma.showUI(__html__, { visible: true, ...size })
  notifyPlugin(controller)
  nodePlugin(controller, (node) => node ? { id: node.id, name: node.name } : undefined)
  configPlugin<Config>(controller, { preview: true })
})
