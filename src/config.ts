import { join } from "path"

type Config = {
  turnServerSecret: string
  ttl: number
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

if (!process.env.TURN_SERVER_SECRET) {
  throw new Error('invalid turn server secret')
}
if (!process.env.SERVICE_JWT_SECRET) {
  throw new Error('invalid service jwt secret')
}
const config: Config = {
  turnServerSecret: process.env.TURN_SERVER_SECRET,
  ttl: Number(process.env.TURN_SERVER_TTL || 750), // 12.5 minutes
  signalingAuthJwt: {
    config: {
      issuer: 'app-server',
      audience: 'signaling-server',
      subject: 'app-server',
      expiresIn: 60,  // 60 seconds
    },
    secret: process.env.SERVICE_JWT_SECRET,
  }
}

type ConfigEnv = {
  allowOrigin: string
  signalingApiOrigin: string
  protoPath: string
}

type STAGE = 'development' | 'production'

const configEnvs: { [K in STAGE]: ConfigEnv } = {
  development: {
    allowOrigin: 'https://streaming.localtest.me',
    signalingApiOrigin: 'http://streaming-signaling:8080',
    // signalingApiOrigin: 'streaming-signaling:50051',
    protoPath: join(process.cwd(), 'proto/signaling.proto')
  },
  production: {
    allowOrigin: 'https://streaming.jounetsism.biz',
    signalingApiOrigin: 'https://streaming-signaling.jounetsism.biz',
    protoPath: join(process.cwd(), 'proto/signaling.proto')
  }
}
const env = (process.env.NODE_ENV || 'development') as STAGE
const envList = ['development', 'production']
if (!envList.includes(env)) {
  throw new Error('invalid STAGE')
}
const configEnv = configEnvs[env]
const output = {
  ...config,
  ...configEnv,
  env
}

export default output
