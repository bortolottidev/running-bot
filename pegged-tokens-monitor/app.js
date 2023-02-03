import { default as Fastify } from "fastify";
import dbConnector from "./db-connector.js";
import envLoader from "./envor.js";
import chainApi from './chain-api.js';
import routes from "./routes.js";

function build(opts = {}) {
  const fastify = Fastify(opts);

  fastify.register(envLoader);
  fastify.register(dbConnector);
  fastify.register(routes);
  fastify.register(chainApi);

  return fastify;
}

export default build;
