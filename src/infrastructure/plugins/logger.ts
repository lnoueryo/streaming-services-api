import { CallHandler, ExecutionContext, Logger } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

export class LoggingInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const res = context.switchToHttp().getResponse()
    const start = Date.now()
    res.on('finish', () => {
      const { method, originalUrl, user } = req
      const userId = user?.id ?? '-'
      const { statusCode } = res
      const ua = req.headers['user-agent'] || 'unknown'
      const ip = req.ip || req.connection.remoteAddress
      const ms = Date.now() - start
      const yellow = '\x1b[33m'
      const cyan = '\x1b[36m'
      const reset = '\x1b[0m'

      // ステータスコードで色分け
      const log = (message) => {
        if (statusCode >= 400) Logger.error(message)
        else if (statusCode >= 300) Logger.warn(message)
        else Logger.log(message)
      }

      // ---- ログ出力 ----
      log(
        `[${method}] ${statusCode} ${originalUrl}${reset} ${ua} ${cyan}${ip}${reset} User ${cyan}${userId}${reset} ${yellow}${ms}ms${reset}`
      )
    })

    return next.handle()
  }
}
