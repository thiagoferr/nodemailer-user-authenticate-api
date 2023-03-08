import {Schema, model} from "mongoose";
import bcrypt from 'bcrypt'

interface IUser{
    name: string;
    email: string;
    password: string;
    passwordReset: string;
    passwordExpired: Number;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true,
        select: false //senha não aparece na listagem
    },
    passwordReset: {
        type: String,
        select: false
    },
    passwordExpired: { 
        type: Number, 
        select: false
    }
},
{
    timestamps: true
})

//ANTES DE SALVAR O USUÁRIO ('.PRE') ENCRIPTA A SENHA DO USUARIO
userSchema.pre('save', async function(next){
    if(!this.isModified('password'))
        return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

const User = model<IUser>('persons', userSchema)

export {User, IUser};