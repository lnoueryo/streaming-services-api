import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException
} from '@nestjs/common'
import { auth } from '../../infrastructure/plugins/firebase-admin'
import { AuthUserRequest } from '../controllers/shared/auth.request'

export const AuthUser = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = await authByCookieSession(request)
    if (user) {
      return user
    }
    return await authByAuthorization(request)
  }
)

const authByCookieSession = async (req: any) => {
  const sessionCookie = req.cookies?.session

  if (!sessionCookie) {
    return null
  }

  try {
    const decodedSession = await auth.verifySessionCookie(sessionCookie, true)
    const user = new AuthUserRequest({
      id: decodedSession.uid,
      email: decodedSession.email,
      name: decodedSession.name,
      session: sessionCookie
    })
    req.user = user
    return user
  } catch (err) {
    Logger.warn(err)
    return null
  }
}

const authByAuthorization = async (req: any) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('No token provided')
  }

  const token = authHeader.split(' ')[1]

  try {
    const decodedToken = await auth.verifyIdToken(token, true)
    const user = new AuthUserRequest({
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      token
    })
    req.user = user
    return user
  } catch (error) {
    Logger.error(error)
    throw new UnauthorizedException('Invalid or expired token')
  }
}
