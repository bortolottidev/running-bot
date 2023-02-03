import fastifyEnv from "fastify-env";
import fastifyPlugin from "fastify-plugin";

const schema = {
  type: "object",
  required: ["MONGO_USER", "MONGO_PASSWORD", "MONGO_DATABASE", "COVALENT_API_KEY", "MY_ADDRESS_STARTS_WITH"],
  properties: {
    MONGO_DATABASE: {
      type: "string",
    },
    MONGO_PASSWORD: {
      type: "string",
    },
    MONGO_USER: {
      type: "string",
    },
    COVALENT_API_KEY: {
      type: "string",
    },
    MY_ADDRESS_STARTS_WITH: {
      type: "string",
    },
  },
};

const options = {
  dotenv: process.env.TEST_ENV_FILE 
    ? { path: `./${process.env.TEST_ENV_FILE}`, debug: true }
    : true,
  schema,
};

async function envLoader(fastify) {
  fastify.register(fastifyEnv, options);
  await fastify.after();
}

export default fastifyPlugin(envLoader);
