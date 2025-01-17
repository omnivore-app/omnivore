/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/await-thenable */
import { env } from './env'

import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter'
import * as api from '@opentelemetry/api'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { NodeTracerProvider } from '@opentelemetry/node'
import { BatchSpanProcessor } from '@opentelemetry/tracing'
import { EventEmitter } from 'events'
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql'

const provider: NodeTracerProvider = new NodeTracerProvider()

// TODO(typotter): Remove this max even listener when fix for
// https://github.com/open-telemetry/opentelemetry-js-contrib/issues/258
// is available in the released package.
// This suppresses a warning raised by node.
EventEmitter.defaultMaxListeners = 25

let exporter
if (
  env.server.apiEnv === 'demo' ||
  env.server.apiEnv === 'qa' ||
  env.server.apiEnv === 'prod'
) {
  exporter = new TraceExporter() // No config required when running on GAE.
  console.info('Using gCloud for trace exports')
} else if (env.dev.isLocal && env.jaeger.host) {
  const jaeger_host = env.jaeger.host
  const options = {
    serviceName: 'omnivore-backend',
    tags: [],
    // Use http as UDP has max 65kb limit and our spans at times can exceed this limit
    endpoint: `http://${env.jaeger.host}:14268/api/traces`,
  }
  console.info('Using Jaeger on host ' + jaeger_host + ' for trace exports')
  exporter = new JaegerExporter(options)
} else {
  console.log(
    'Unknown environment / no JAEGER_HOST defined in apiEnv: ' +
      env.server.apiEnv +
      '; not exporting traces'
  )
}

if (exporter !== undefined) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  provider.addSpanProcessor(new BatchSpanProcessor(exporter))
  console.info('tracing initialized')
}

const graphQLInstrumentation = new GraphQLInstrumentation({})

graphQLInstrumentation.setTracerProvider(provider)
graphQLInstrumentation.enable()

api.trace.setGlobalTracerProvider(provider)

provider.register()

export const tracer = api.trace.getTracer('basic')

/**
 * Wraps fn with a span for cloud tracing
 * @param spanName
 * @param attributes
 * @param fn
 * @param parent If provided, will record traces as child of the parent.
 */
export async function traceAs<A>(
  {
    spanName,
    attributes = {},
  }: { spanName: string; attributes?: Record<string, any> },
  fn: () => A
): Promise<A> {
  const childSpan = async (): Promise<A> => {
    const span = tracer.startSpan(spanName, { attributes })
    const result = await api.context.with(
      api.trace.setSpan(api.context.active(), span),
      fn
    )
    span.end()

    return result
  }

  return childSpan()
}
