import {connect} from 'mongoose'

export default class Connection {
    private db_connection_string: string;

    constructor(db_connection_string: string){
        this.db_connection_string = db_connection_string;
    }
    async createConnection(): Promise<void>{
        try {
            await connect(this.db_connection_string);
            console.log('BANCO DE DADOS CONECTADO E RODANDO NA PORTA {27017}')
        } catch (error) {
            console.log("ERRO: NÃO FOI POSSÍVEL ESTABELECER UMA CONEXÃO COM O BANCO DE DADOS ", error)
        }
    }
}
