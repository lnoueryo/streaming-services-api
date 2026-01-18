export class Video {
  readonly recordingId: string
  readonly createdAt: Date
  readonly hlsUrl: string
  readonly thumbnailUrl: string
  readonly size?: number

  constructor(params: {
    recordingId: string
    createdAt: Date
    hlsUrl: string
    thumbnailUrl: string
    size?: number
  }) {
    this.recordingId = params.recordingId
    this.createdAt = params.createdAt
    this.hlsUrl = params.hlsUrl
    this.thumbnailUrl = params.thumbnailUrl
    this.size = params.size
  }
}
