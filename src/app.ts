import Express, {Application} from 'express';
import auth from './config/auth';
import { mongoDB } from './db'
import routes from './routes'


type SetupOptions = {
    isTest?: boolean;
    port?: number;
}

export default class App {
    private instance: Application;
    private defaultPort: number = auth.port;

    constructor(){
        this.instance = Express();
    }

    setup(options: SetupOptions): void {
        mongoDB.createConnection();
        const selectedPort = options.port ? options.port : this.defaultPort;
        this.instance.set("view engine", "ejs")
        this.instance.use(Express.json())
        this.instance.use(routes)

        if(options.isTest) return;

        this.instance.listen(4000, () => {
            console.log(`O SERVIDOR CONECTADO E RODANDO NA PORTA {${selectedPort}}`);
        });
    }

    getInstance(){
        return this.instance;
    }
}

