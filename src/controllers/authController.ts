import { ERRORS } from '../constants/error'
import { NextFunction, Request, Response } from 'express'
import { User } from '../models/User'
import { generateToken } from '../helpers/generatePassword'
import bcrypt from 'bcrypt'

const authController = {
  async authUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const findUser = await User.findOne({ email })
        .select('+password')
        .select('+passwordReset')
        .select('passwordExpired') //INCLUI O PASSWORD

      if (!findUser) {
        return res
          .status(400)
          .send({ error: ERRORS.CONTROLLERS.USER.USER_NOT_FOUND })
      }

      if (await bcrypt.compare(password, findUser.password)) {
        return res.status(200).json({
          findUser,
          token: generateToken({
            id: findUser.id,
            name: findUser.name,
            password: findUser.password,
          }),
        })
      }
      if (findUser.passwordReset && findUser.passwordExpired) {
        if (findUser.passwordExpired < Date.now()) {
          return res
            .status(401)
            .send({ error: ERRORS.CONTROLLERS.AUTH_USER.PASSWORD_EXPIRED })
        }
        if (findUser.passwordReset !== password) {
          return res
            .status(401)
            .send({ error: ERRORS.CONTROLLERS.AUTH_USER.PASSWORD_INCORRECT })
        }

        return res.status(200).json({
          findUser,
          token: generateToken({
            id: findUser.id,
            name: findUser.name,
            passwordReset: findUser.passwordReset,
          }),
        })
      }
      return res
        .status(401)
        .send({ error: ERRORS.CONTROLLERS.AUTH_USER.EMAIL_OR_PASS_INCORRECT })
    } catch (error) {
      return res
        .status(404)
        .json({ error: ERRORS.CONTROLLERS.USER.ERROR + '=' + error })
    }
  },
}

export default authController
