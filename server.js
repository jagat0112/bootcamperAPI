const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const error = require("./middleware/error");
const colors = require("colors");
const fileupload = require("express-fileupload");
const path = require("path");
const auth = require("./routes/auth");
const user = require("./routes/users");
const review = require("./routes/reviews");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

dotenv.config({ path: "./config/config.env" });
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(cors());

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use(morgan("dev"));
app.use(fileupload());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", user);
app.use("/api/v1/reviews", review);
app.use(error);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started at ${PORT}`.yellow.bold));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
