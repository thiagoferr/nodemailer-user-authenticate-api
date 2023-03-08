import { User } from '../models/User'
import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { generateToken } from '../helpers/generatePassword'
import { ERRORS } from '../constants/error'

const userController = {
  async register(req: Request, res: Response) {
    try {
      const { email } = req.body

      if (await User.findOne({ email })) {
        return res
          .status(400)
          .send({ error: ERRORS.CONTROLLERS.USER.EMAIL_EXIST })
      }

      const userCreate = await User.create(req.body) //cria o usuario direto do req

      return res.status(200).json({
        userCreate,
        token: generateToken({
          id: userCreate.id,
          name: userCreate.name,
          password: userCreate.password,
        }),
      })
    } catch (error) {
      return res
        .status(404)
        .json({ error: ERRORS.CONTROLLERS.USER.ERROR + '=' + error })
    }
  },

  async listAll(req: Request, res: Response) {
    try {
      const listAll = await User.find()
        .select('+password')
        .select('+passwordReset')

      if (!listAll)
        return res
          .status(404)
          .send({ error: ERRORS.CONTROLLERS.USER.USER_NOT_FOUND })

      return res.status(200).json(listAll)
    } catch (error) {
      return res
        .status(404)
        .json({ error: ERRORS.CONTROLLERS.USER.ERROR + '=' + error })
    }
  },

  async listByMail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params
      if (!email.includes('@')) {
        return next()
      }
      // const userMail = await User.find({ email }) // retorna array vazio [] ao inves de null
      const userMail = await User.findOne({ email })

      if (!userMail)
        return res
          .status(404)
          .send({ error: ERRORS.CONTROLLERS.USER.USER_NOT_FOUND })

      return res.status(200).json({ userMail })
    } catch (error) {
      return res
        .status(400)
        .send({ error: ERRORS.CONTROLLERS.USER.ERROR + '=' + error })
    }
  },

  async listById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = await User.findById({ _id: id })
      if (!userId)
        return res
          .status(404)
          .send({ error: ERRORS.CONTROLLERS.USER.USER_NOT_FOUND })
      return res.status(200).send(userId)
    } catch (error) {
      return res
        .status(404)
        .json({ error: ERRORS.CONTROLLERS.USER.ERROR + '=' + error })
    }
  },

  async update(req: Request, res: Response) {
    const { name, email, password = 'asd' } = req.body
    const { id } = req.params

    try {
      User.findOne({ _id: id })
        .then((user) => {
          if (!user) {
            return res
              .status(404)
              .send({ error: ERRORS.CONTROLLERS.USER.USER_NOT_FOUND })
          }
          return user.id
        })
        .then(async (id) => {
          return User.findByIdAndUpdate(
            { _id: id },
            {
              $set: {
                name,
                email,
                password: await bcrypt.hash(password ?? null, 10),
              },
            },
          )
        })
        .then(() => {
          return res.sendStatus(200)
        })
    } catch (error) {
      return res
        .status(404)
        .json({ error: ERRORS.CONTROLLERS.USER.ERROR + '=' + error })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      await User.deleteOne({ _id: id })
      return res.sendStatus(200)
    } catch (error) {
      return res
        .status(404)
        .json({ error: ERRORS.CONTROLLERS.USER.ERROR + '=' + error })
    }
  },
}

export default userController
