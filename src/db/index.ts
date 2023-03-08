import Connection from "./Connection";

// const mongoDB = new Connection("mongodb://localhost:27017/register");
const mongoDB = new Connection("mongodb+srv://node-dev:thiago123@cluster-mongo-project.6huzxai.mongodb.net/?retryWrites=true&w=majority");
export {mongoDB}