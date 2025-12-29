export const ISignalingService = Symbol('ISignalingService')

export type ISignalingService = {
  decideRequest(params: {
    id: string
    spaceId: string
    userId?: string | null
    email: string
    role: string
    status: string
  }): Promise<void>
}
