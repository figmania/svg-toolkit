import { TreeNode } from '@figmania/common'

export interface SelectRequest {
  node?: TreeNode
}

export interface ExportRequest {
  node: TreeNode
}

export interface ExportResponse {
  buffer: Uint8Array
}

export interface NotifyRequest {
  message: string
}
