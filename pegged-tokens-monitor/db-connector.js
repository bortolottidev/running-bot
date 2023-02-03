import fastifyMongo from "fastify-mongodb";
import fastifyPlugin from "fastify-plugin";

async function dbConnector(fastify, options) {
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWORD;
  const database = process.env.MONGO_DATABASE;

  fastify.log.info(`Loggin in db ${database} with user ${user}..`);

  const uri = `mongodb+srv://${user}:${password}@pricecluster.bwit6.mongodb.net/${database}?retryWrites=true&w=majority`;
  fastify.register(fastifyMongo, {
    url: uri,
  });
}
export default fastifyPlugin(dbConnector);
