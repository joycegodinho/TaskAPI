const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
// cors para request de origem cruzada
const cors = require('cors');
//dotEnv para lidar com as variáveis de ambiente
const dotEnv = require('dotenv');
const Dataloader = require('dataloader');

//módulos locais 
const resolvers = require('./resolvers');
const typeDefs = require('./typeDefs');
const { connection } = require('./database/util');
const { verifyUser } = require('./helper/context');
const loaders = require('./loaders');

//set envariament variables

//dotEnv.config vai procurar o arquivo .env no root
//vai pegar todas variáveis definidas e colocar em
//process.env.<aquela_variavel>
dotEnv.config();

const app = express();

//db connectivity

connection();

//cors
app.use(cors());

//body parser middleware 
app.use(express.json());

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: async({ req, connection }) => {
        const contexObj = {}
        if (req) {
            await verifyUser(req);
            contexObj.email= req.email;
            contexObj.loggedInUserId= req.loggedInUserId;
        }

        contexObj.loaders= {
            user: new Dataloader(keys => loaders.user.batchUsers(keys))
        };
        return contextObj;
        
    }, 
    formatError: (error) => {
        return {
            message: error.message
        };
    }
});

// apollo server middleware
apolloServer.applyMiddleware({ app, path: '/graphql' });

const PORT = process.env.PORT || 3000;

app.use('/', (req, res, next) => {
    res.send({ message: 'Hello' });
})

const httpServer = app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
    console.log(`Graphql Endpoint: ${apolloServer.graphqlPath}`);
});

apolloServer.installSubscriptionHandlers(httpServer);