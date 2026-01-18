export class GetVideoResponse {
  videos: {
    roomId: string
    recordingId: string
    createdAt: Date
    hlsUrl: string
    thumbnailUrl: string
    size?: number
  }[]

  constructor(params: {
    videos: {
      roomId: string
      recordingId: string
      createdAt: Date
      hlsUrl: string
      thumbnailUrl: string
      size?: number
    }[]
  }) {
    this.videos = params.videos
  }
}
