import jwt from 'jsonwebtoken'
import auth from '../config/auth'

export function generateToken (params = {}) {
    return jwt.sign(params, auth.secret, {
      expiresIn: '1h',
    })
  }