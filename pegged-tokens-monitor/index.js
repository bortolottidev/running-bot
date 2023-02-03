import app from "./app.js";

const server = app({
  logger: true,
});

server.listen(process.env.PORT || 3000, "0.0.0.0", (error, address) => {
  if (error) {
    server.log.error(error);
    process.exit(1);
  }

  server.log.info(`Server listening on ${address}`);
});
