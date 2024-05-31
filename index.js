const express = require("express")
const exphbs = require("express-handlebars")
const session = require("express-session")
const FileStore = require("session-file-store")(session)
const flash = require("express-flash")

// dotenv config
require("dotenv").config()

// db conn
const conn = require("./db/conn")

// initialize express app
const app = express()

// Models
require("./models/User")
const Result = require("./models/Result")

// template engine
app.engine("handlebars", exphbs.engine())
app.set("view engine", "handlebars")

// body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// session middleware
app.use(
  session({
    name: "session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: (msg) => console.log(msg),
      path: require("path").join(require("os").tmpdir(), "sessions"),
    }),
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      httpOnly: true,
    },
  })
)

// flash messages
app.use(flash())

// set session to res
app.use((req, res, next) => {
  if (req.session.userid) res.locals.session = req.session
  next()
})

// public
app.use(express.static("public"))

// routes
app.get("/", (_, res) => {
  const numbers = Array.from({ length: 60 }, (_, i) => i + 1)
  res.render("home", { title: "Escolha de 6 à 15 números", numbers })
})

app.post("/submit", async (req, res) => {
  const selectedNumbers = req.body.selectedNumbers.split(",").map(Number)

  if (selectedNumbers.length < 6 || selectedNumbers.length > 15) {
    return res.send("Por favor, selecione entre 6 e 15 números.")
  }

  const results = await Result.findAll()
  const matchingResult = results.find((result) => {
    const resultNumbers = [
      result.numero1,
      result.numero2,
      result.numero3,
      result.numero4,
      result.numero5,
      result.numero6,
    ]
    return selectedNumbers.every((num) => resultNumbers.includes(num))
  })

  if (matchingResult) {
    req.flash("message", "Parabéns! Você acertou um concurso.")
    res.redirect("/")
  } else {
    req.flash("message", "Infelizmente, você não acertou nenhum concurso.")
    res.redirect("/")
  }
})

// listen
const PORT = process.env.PORT || 3000

conn
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is running on port", PORT)
    })
  })
  .catch((err) => console.log(err.message))
