import { User, IUser } from '../models/User'
import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import auth from '../config/auth'
import crypto from 'crypto'
import { mailerConfig } from '../modules/mailer'
import { ERRORS } from '../constants/error'

const userController = {
  generateToken: function (params = {}) {
    return jwt.sign(params, auth.secret, {
      expiresIn: '1h',
    })
  },

  async register(req: Request, res: Response) {
    const { email } = req.body

    if (await User.findOne({ email })) {
      return res.status(400).send('Error: This user already exists')
    }

    const userCreate = await User.create(req.body) //cria o usuario direto do req

    return res.status(200).json({
      userCreate,
      token: userController.generateToken({
        id: userCreate.id,
        name: userCreate.name,
        password: userCreate.password,
      }),
    })
  },

  async listAll(req: Request, res: Response) {
    const listAll = await User.find().select('+password').select('+passwordReset')

    if (!listAll) 
        return res.status(404).send('Error: None found')
    
        return res.status(200).json(listAll)
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
      return res.status(404).send({error: 'user not found'})
    
    return  res.status(200).json({ userMail })
    // const passwordExpired = userMail.passwordExpired as unknown as Date;
    // console.log(new Date(passwordExpired).getTime() > Date.now() ? "Password expired! " : "Password accepted!");

    } catch (error) {
      return res.status(400).send({ error: 'a error occurred: ' + error })
    }
    
  },

  async listById(req: Request, res: Response) {
    const { id } = req.params
    const userId = await User.findById({ _id: id })
    if (!userId) return res.status(404).send('Error: None found')
     return res.status(200).send(userId)
  },

  async update(req: Request, res: Response) {
    const { name, email, password } = req.body
    const { id } = req.params
    
    try {
        User.findOne({ _id: id }).then( (user) => {
            if(!user)
              return res.status(404).send({error: 'user not found'})
        })
       let response = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            email,
            password: await bcrypt.hash(password, 10)
          },
        },
      )
    } catch (error) {
      return res.status(404).json({ error: 'not possible: ' + error })
    }
    return res.sendStatus(200)
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params
    await User.deleteOne({ _id: id })
    return res.sendStatus(200)
  },

  async authUser(req: Request, res: Response) {
    const { email, password } = req.body
    const findUser = await User.findOne({ email }).select('+password').select('+passwordReset').select('passwordExpired') //INCLUI O PASSWORD
  
    if (!findUser) {
      return res.status(400).send({ error: ERRORS.CONTROLLERS.USER_NOT_FOUND })
    }
    
    if (await bcrypt.compare(password, findUser.password)) {
      return res.status(200).json({
        findUser,
        token: userController.generateToken({
          id: findUser.id,
          name: findUser.name,
          password: findUser.password,
        }),
      })
    }
    if (findUser.passwordReset && findUser.passwordExpired){
      if (findUser.passwordExpired < Date.now()){
        return res.status(401).send({error: ERRORS.CONTROLLERS.AUTH_USER.PASSWORD_EXPIRED})
      }
      if (findUser.passwordReset !== password ){ 
        return res.status(401).send({error: ERRORS.CONTROLLERS.AUTH_USER.PASSWORD_INCORRECT})
      }

        return res.status(200).json({
          findUser,
          token: userController.generateToken({
            id: findUser.id,
            name: findUser.name,
            passwordReset: findUser.passwordReset
          }),
        })
    }
    return res.status(401).send({ error: 'email or passaword incorrect, please try again!' })
  },

  async forgetPassword(req: Request, res: Response) {
    const { email } = req.body
    try {
      const findUser = await User.findOne({ email }).select('+passwordExpired').select('+passwordReset')

      if (!findUser) return res.status(400).send({ error: 'user not found' })
      // const newHashPass = crypto.randomBytes(20).toString('hex').substring(0, 8)

      const newHashPass = crypto.randomBytes(20).toString('hex') 
      const passwordReset = crypto.createHash('sha256').update(newHashPass).digest('hex').slice(0, 8)
      const passwordExpired = Date.now() + 1000 * 60 * 20

      await User.findByIdAndUpdate(findUser.id, {
        $set: {
          passwordReset,
          passwordExpired,
          password: passwordReset,
          new: true
        },
      })
      
      const token = userController.generateToken({
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        passwordReset,
        passwordExpired
      })

      mailerConfig.mailer(token)

      return res.status(200).json({
        findUser,
        token: token,
      })
    } catch (error) {
      return res
        .status(400)
        .send({ error: 'error on forgot password, try again' })
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { password } = req.body
      const { id } = req.params
      const findUser = await User.findOne({ _id: id })
      
      if (!findUser) return res.status(400).send({ error: 'user not found' })
      if (req.method === 'POST') {
        const hash = await bcrypt.hash(password, 10)

        await User.findByIdAndUpdate(findUser.id, {
          $set: {
            password: hash
          },
        })
        return res.sendStatus(200)
      }
      return res.status(200).json({ status: true })
    } catch (error) {
      return res.status(400).send({ error: 'a error occurred: ' + error })
    }
  },
}

export default userController
