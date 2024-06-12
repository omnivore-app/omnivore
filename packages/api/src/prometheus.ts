import client, { Metric } from 'prom-client'

const registry = new client.Registry()

export const registerMetric = (metric: Metric) =>
  registry.registerMetric(metric)

export const getMetrics = async () => registry.metrics()
