const logger = (req, res, next) => {
  req.hello = "Hello World";
  console.log("Middleware started!");
  next();
};

module.exports = logger;
