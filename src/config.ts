import { join } from 'path'

type Config = {
  appSecret: string
  signalingAuthJwt: {
    config: {
      issuer: string
      audience: string
      subject: string
      expiresIn: number
    }
    secret: string
  }
}

if (!process.env.APP_SECRET) {
  throw new Error('invalid app secret')
}
const turnServerSecret = process.env.TURN_SERVER_SECRET
if (!turnServerSecret) {
  throw new Error('invalid turn server secret')
}

if (!process.env.SIGNALING_SERVER_SECRET) {
  throw new Error('invalid signaling server secret')
}
const config: Config = {
  appSecret: process.env.APP_SECRET,
  signalingAuthJwt: {
    config: {
      issuer: 'app-server',
      audience: 'signaling-server',
      subject: 'app-server',
      expiresIn: 60 // 60 seconds
    },
    secret: process.env.SIGNALING_SERVER_SECRET
  }
}

type ConfigEnv = {
  allowOrigin: string
  signalingApiOrigin: string
  mediaApiOrigin: string
  turnServer: {
    secret: string
    ttl: number
    urls: string[]
  }
  protoPath: {
    signaling: string
    media: string
    application: string
  }
}

type STAGE = 'development' | 'staging' | 'production'

const configEnvs: { [K in STAGE]: ConfigEnv } = {
  development: {
    allowOrigin: 'https://streaming.localtest.me',
    // signalingApiOrigin: 'http://streaming-signaling:8080',
    signalingApiOrigin: 'streaming-signaling:50051',
    mediaApiOrigin: 'streaming-media:50051',
    turnServer: {
      secret: turnServerSecret,
      ttl: Number(process.env.TURN_SERVER_TTL || 750),
      urls: []
    },
    protoPath: {
      signaling: join(process.cwd(), 'src/proto/signaling/signaling.proto'),
      media: join(process.cwd(), 'src/proto/media/media.proto'),
      application: join(
        process.cwd(),
        'src/proto/application/application.proto'
      )
    }
  },
  staging: {
    allowOrigin: 'https://streaming.staging.biz:8443',
    signalingApiOrigin: 'streaming-signaling-stg:50051',
    mediaApiOrigin: 'streaming-media-stg:50051',
    turnServer: {
      secret: turnServerSecret,
      ttl: Number(process.env.TURN_SERVER_TTL || 750),
      urls: [
        'turns:turn.staging.biz:8446?transport=tcp',
        'turns:turn.staging.biz:8445?transport=tcp',
        'turn:turn.staging.biz:8445?transport=udp'
      ]
    },
    protoPath: {
      signaling: join(process.cwd(), 'src/proto/signaling/signaling.proto'),
      media: join(process.cwd(), 'src/proto/media/media.proto'),
      application: join(
        process.cwd(),
        'src/proto/application/application.proto'
      )
    }
  },
  production: {
    allowOrigin: 'https://streaming.jounetsism.biz',
    signalingApiOrigin: 'streaming-signaling-prod:50051',
    mediaApiOrigin: 'streaming-media-prod:50051',
    turnServer: {
      secret: turnServerSecret,
      ttl: Number(process.env.TURN_SERVER_TTL || 750),
      urls: [
        'turns:turn.jounetsism.biz:5349?transport=tcp',
        'turn:turn.jounetsism.biz:3478?transport=udp',
        'turn:turn.jounetsism.biz:3478?transport=tcp'
      ]
    },
    protoPath: {
      signaling: join(process.cwd(), 'src/proto/signaling/signaling.proto'),
      media: join(process.cwd(), 'src/proto/media/media.proto'),
      application: join(
        process.cwd(),
        'src/proto/application/application.proto'
      )
    }
  }
}
const env = (process.env.APP_ENV || 'development') as STAGE
const envList = ['development', 'staging', 'production']
if (!envList.includes(env)) {
  throw new Error('invalid STAGE')
}
const configEnv = configEnvs[env]
const output = {
  ...config,
  ...configEnv,
  env
}

export { output as config }
