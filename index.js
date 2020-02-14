const express = require("express");
const path = require("path");
const csrf = require("csurf");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const exphbs = require("express-handlebars");
const homeRoutes = require("./routes/home");
const cardRoutes = require("./routes/card");
const orderRoutes = require("./routes/orders");
const addRoutes = require("./routes/add");
const authRoutes = require("./routes/auth");
const coursesRoutes = require("./routes/courses");
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");
const keys = require("./keys");

const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require("./utils/hbs-helbers")
});

const store = new MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(csrf());
app.use(flash());

// Custom middleware

app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/card", cardRoutes);
app.use("/orders", orderRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();
