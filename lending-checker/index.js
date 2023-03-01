import Fastify from "fastify";
import handler from './handle-request.js';

const fastify = Fastify({
  logger: true,
});

fastify.get("/", handler);

fastify.listen(process.env.PORT || 3211, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});
