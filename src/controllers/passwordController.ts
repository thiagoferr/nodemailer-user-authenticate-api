import { ERRORS } from '../constants/error'
import crypto from 'crypto'
import { mailerConfig } from '../modules/mailer'
import { NextFunction, Request, Response } from 'express'
import { User } from '../models/User'
import { generateToken } from '../helpers/generatePassword'
import bcrypt from 'bcrypt'

const passwordController = {
  async forgetPassword(req: Request, res: Response) {
    const { email } = req.body
    try {
      const findUser = await User.findOne({ email })
        .select('+passwordExpired')
        .select('+passwordReset')

      if (!findUser)
        return res
          .status(400)
          .send({ error: ERRORS.CONTROLLERS.USER.USER_NOT_FOUND })

      const newHashPass = crypto.randomBytes(20).toString('hex')
      const passwordReset = crypto
        .createHash('sha256')
        .update(newHashPass)
        .digest('hex')
        .slice(0, 8)
      const passwordExpired = Date.now() + 1000 * 60 * 20

      await User.findByIdAndUpdate(findUser.id, {
        $set: {
          passwordReset,
          passwordExpired,
          password: passwordReset,
          new: true,
        },
      })

      const token = generateToken({
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        passwordReset,
        passwordExpired,
      })

      mailerConfig.mailer(token)

      return res.status(200).json({
        findUser,
        token: token,
      })
    } catch (error) {
      return res
        .status(400)
        .send({ error: ERRORS.CONTROLLERS.RECOVER_PASSWORD.ERROR })
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { password } = req.body
      const { id } = req.params
      const findUser = await User.findOne({ _id: id })

      if (!findUser)
        return res
          .status(400)
          .send({ error: ERRORS.CONTROLLERS.USER.USER_NOT_FOUND })
      if (req.method === 'POST') {
        const hash = await bcrypt.hash(password, 10)

        await User.findByIdAndUpdate(findUser.id, {
          $set: {
            password: hash,
          },
        })
        return res.sendStatus(200)
      }
      return res.status(200).json({ status: true })
    } catch (error) {
      return res.status(400).send({
        error: ERRORS.CONTROLLERS.RECOVER_PASSWORD.ERROR + '=' + error,
      })
    }
  },
}

export default passwordController
