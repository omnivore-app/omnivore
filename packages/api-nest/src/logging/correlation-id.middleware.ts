import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

export interface RequestWithCorrelationId extends Request {
  correlationId: string
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: RequestWithCorrelationId, res: Response, next: NextFunction) {
    // Check for existing correlation ID in headers (from load balancer, API gateway, etc.)
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      randomUUID()

    // Store correlation ID in request object
    req.correlationId = correlationId

    // Add correlation ID to response headers for client debugging
    res.setHeader('x-correlation-id', correlationId)

    next()
  }
}
