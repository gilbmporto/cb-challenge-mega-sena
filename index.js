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
const hbs = exphbs.create({
  helpers: {
    toDateString: (date) => {
      return new Date(date).toLocaleDateString("pt-BR")
    },
    or: () => {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean)
    },
    join: (array, separator) => {
      return array.join(separator)
    },
  },
})

app.engine("handlebars", hbs.engine)
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

app.get("/:slug", async (req, res) => {
  res.render("development")
})

// routes
app.get("/", (_, res) => {
  const numbers = Array.from({ length: 60 }, (_, i) => i + 1)
  res.render("home", { title: "Escolha de 6 à 15 números", numbers })
})

app.post("/submit", async (req, res) => {
  const selectedNumbers = req.body.selectedNumbers.split(",").map(Number)

  if (selectedNumbers.length < 6 || selectedNumbers.length > 15) {
    req.flash("message", "Por favor, selecione entre 6 e 15 números.")
    return res.redirect("/")
  }

  const results = await Result.findAll()
  const matchingResults = results
    .map((result) => {
      const resultNumbers = [
        result.numero1,
        result.numero2,
        result.numero3,
        result.numero4,
        result.numero5,
        result.numero6,
      ]

      // Contar o número de coincidências
      const matchCount = selectedNumbers.filter((num) =>
        resultNumbers.includes(num)
      ).length

      // Verificar se há pelo menos 4 coincidências
      if (matchCount >= 4) {
        return {
          concurso: result.concurso,
          data: result.data,
          matchCount: matchCount,
          resultNumbers: resultNumbers,
        }
      }
      return null
    })
    .filter((result) => result !== null)

  // Separar os resultados por número de acertos
  const matches4 = matchingResults.filter((result) => result.matchCount === 4)
  const matches5 = matchingResults.filter((result) => result.matchCount === 5)
  const matches6 = matchingResults.filter((result) => result.matchCount === 6)

  res.render("result", {
    title: "Resultados da Mega-Sena",
    matches4,
    matches5,
    matches6,
    selectedNumbers,
  })
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
