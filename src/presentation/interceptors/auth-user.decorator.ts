import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { auth } from '../../infrastructure/plugins/firebase-admin'
import { AuthUserRequest } from '../controllers/shared/auth.request'



export const AuthUser = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided')
    }

    const token = authHeader.split(' ')[1]

    try {
      const decodedToken = await auth.verifyIdToken(token)
      const user = new AuthUserRequest({
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      })
      request.user = user
      return user
    } catch (error) {
      Logger.error(error)
      throw new UnauthorizedException('Invalid or expired token')
    }
  },
)
