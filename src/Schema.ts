import { CreateSchema } from '@figmania/common'

export interface Config {
  preview: boolean
}

export interface Node {
  id: string
  name: string
}

export type Schema = CreateSchema<{
  requests: {
    name: 'export'
    data: [SceneNode, Uint8Array]
  }
  events: {
    name: 'node:select'
    data: Node | undefined
  }
}>
