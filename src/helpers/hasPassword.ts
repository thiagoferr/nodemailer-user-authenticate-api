import bcrypt from 'bcrypt'
export async function hasPassword(password: string) {
    if (password) {
      const hash = await bcrypt.hash(password, 10)
      return hash
    }
    return null
  }