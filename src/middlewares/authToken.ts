import secret from '../config/auth'
import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { User } from '../models/User'

export const validateToken = {
  viaHeadersOrParams: function(headersToken: string , paramsToken: string): string | null  {
    if(headersToken){
      return headersToken
    }
    if(paramsToken){
      return paramsToken
    }
    return null
  },

  function(req: Request, res: Response, next: NextFunction) {
    let headersToken: string

    if (!req.params.token) {
      
        if (!req.headers.authorization) {
          return res.status(401).send({ error: 'No token provided!' })
        }
        const parts = req.headers.authorization.split(' ')

        if (!(parts.length === 2))
          return res.status(401).send({ error: 'Token invalid!' })

        const [scheme, token] = parts
        headersToken = token
        if (!/^Bearer$/.test(scheme))
          return res.status(401).send({ error: 'Is not a bearer token' })
        }
      const token = validateToken.viaHeadersOrParams(headersToken!, req.params.token) as string
      jwt.verify(token, secret.secret, (err: any, decoded: any) => {
        try {
          if (err)
            return res
              .status(401)
              .send({ error: 'This token expired or was not valid' })

          if (!decoded.id)
            return res.status(401).send({ error: 'No id available' })

          if (decoded.id !== req.params.id) {
            console.log('decoded.id ', decoded.id)
            console.log('req.params.id', req.params.id)

            return res
              .status(200)
              .send({ error: 'This Token has not belong to the specified ID' })
          }

          console.log('Authenticate!')
          return next()
        
      } catch (error: any) {
        return res.status(401).send({ ERROR: error.message })
      }
    })
  },
}



// else {
//   jwt.verify(mailToken, secret.secret, async (err: any, decoded: any) => {
//     const { id } = req.params

//     try {
//       const findUser = await User.findOne({ _id: id })
//         .select('+passwordExpired')
//         .select('+passwordReset')

//       if (!findUser) return res.sendStatus(401)

//       if (!decoded.id)
//         return res.status(401).send({ error: 'No ID available' })

//       if (decoded.id !== id || decoded.email !== findUser.email)
//         return res.status(200).send({
//           error: 'This Token has not belong to the specified payload',
//         })

//       if (!(findUser.passwordExpired > Date.now()))
//         return res.status(200).send({ error: 'Password has expired' })

//       console.log('Authenticate via params!')

//       return next()
//     } catch (error: any) {
//       return res.status(401).send({ error: error.message })
//     }
//   })
// }
