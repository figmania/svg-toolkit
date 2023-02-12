import { FigmaController, figmaExportAsync, figmaNodeById, nodeTree } from '@figmania/common'
import { ExportRequest, ExportResponse, NotifyRequest } from './types/messages'

class Controller extends FigmaController {
  constructor() {
    super({ width: 640, height: 320 })
    this.addRequestHandler<ExportRequest, ExportResponse>('export', this.handleExportRequest.bind(this))
    this.addRequestHandler<NotifyRequest, void>('notify', this.handleNotifyRequest.bind(this))
  }

  select([figmaNode]: ReadonlyArray<SceneNode>): void {
    this.request('select', { node: nodeTree(figmaNode) })
  }

  deselect() {
    this.request('select', {})
  }

  async handleExportRequest(request: ExportRequest): Promise<ExportResponse> {
    const figmaNode = figmaNodeById(request.node.id)
    const buffer = await figmaExportAsync(figmaNode)
    return { buffer }
  }

  async handleNotifyRequest({ message }: NotifyRequest): Promise<void> {
    figma.notify(message)
  }
}

new Controller()
