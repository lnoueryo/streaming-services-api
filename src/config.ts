type Config = {
  turnServerSecret: string
  ttl: number
}
if (!process.env.TURN_SERVER_SECRET) {
  throw new Error('invalid STAGE')
}
const config: Config = {
  turnServerSecret: process.env.TURN_SERVER_SECRET,
  ttl: Number(process.env.TURN_SERVER_TTL || 750), // 12.5 minutes
}
type ConfigEnv = {
  httpApiOrigin: string
  websocketApiOrigin: string
}
type STAGE = 'development' | 'production'

const configEnvs: { [K in STAGE]: ConfigEnv } = {
  development: {
    httpApiOrigin: 'http://localhost:3001',
    websocketApiOrigin: 'ws://localhost:3001',
  },
  production: {
    httpApiOrigin: 'https://pele-server.jounetsism.biz',
    websocketApiOrigin: 'wss://pele-server.jounetsism.biz',
  },
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
  env,
}
export default output
