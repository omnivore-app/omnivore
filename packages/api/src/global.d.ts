import express = require('express')

declare module 'express' {
  // Inject additional properties on express.Request
  interface Request {
    params: {
      [key: string]: string
      [key: number]: string
    }
  }
}
