import {serverError500} from "./routes/responses";

require("dotenv").config();
const connectDB = require("./config/db");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const notifier = require('./services/notifier');
const app = express();

// Connect Database (MongoDB)
connectDB();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// cors
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/user", require("./routes/api/user"));
app.use("/api/supercx", require("./routes/api/supercx"));
app.use("/api/supercx-contact", require("./routes/api/supercx-contact"));
app.use("/api/supercx", require("./routes/api/supercx"));
app.use("/api/salesforce", require("./routes/api/salesforce"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/upload-img", require("./routes/api/upload-img"));
app.use("/api/payment_acc", require("./routes/api/payment_acc"));
app.use("/api/beneficeary", require("./routes/api/beneficeary"));
app.use("/api/history", require("./routes/api/history"));
app.use("/api/currency_rates", require("./routes/api/currency_rates"));
app.use("/api/change_password", require("./routes/api/change_password"));
app.use("/api/update_user_data", require("./routes/api/update_user_data"));
app.use("/api/exchange", require("./routes/api/exchange"));
app.use("/api/top-currencies", require("./routes/api/top-currencies"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  notifier.push(err);
  return serverError500(res);
});

module.exports = app;
