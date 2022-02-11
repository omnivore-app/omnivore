/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { rule, shield } from 'graphql-shield'

const isNotAuthenticated = rule({ cache: 'contextual' })(
  async (_parent, _args, ctx, _info) => {
    return ctx.claims?.uid === undefined
  }
)

const permissions = shield({
  Query: {
    // me: isAuthenticated,
    // article: and(isAuthenticated, isFullUser),
    // articles: and(isAuthenticated, isFullUser),
  },
  Mutation: {
    googleSignup: isNotAuthenticated,
  },
})

export default permissions
