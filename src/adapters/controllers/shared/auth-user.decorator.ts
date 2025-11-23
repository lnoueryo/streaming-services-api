import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { auth } from '../../../infrastructure/plugins/firebase-admin'
import { AuthUserRequest } from './auth.request'



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
      return new AuthUserRequest(decodedToken)
    } catch (error) {
      Logger.error(error)
      throw new UnauthorizedException('Invalid or expired token')
    }
  },
)
