#!/usr/bin/env ts-node

import { hashPassword } from '../src/utils/auth'

async function main() {
  const password = process.argv[2]

  if (!password) {
    console.error('Usage: yarn hash-password <password>')
    process.exit(1)
  }

  try {
    const hash = await hashPassword(password)
    console.log(`Password: ${password}`)
    console.log(`Hash: ${hash}`)
  } catch (error) {
    console.error('Error generating hash:', error)
    process.exit(1)
  }
}

main()