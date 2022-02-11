import * as bcrypt from 'bcryptjs'

export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10)
}

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash)
}
