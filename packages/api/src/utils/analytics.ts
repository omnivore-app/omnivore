import Analytics = require('analytics-node')
import { env } from '../env'

export const analytics = new Analytics(env.segment.writeKey || 'test')
