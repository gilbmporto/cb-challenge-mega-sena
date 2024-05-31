const xlsx = require("xlsx")
const path = require("path")
const sequelize = require("../db/conn")
const Result = require("../models/Result")

const readXlsxFile = (filePath) => {
  console.log(`Reading XLSX file from: ${filePath}`)
  const workbook = xlsx.readFile(filePath)
  console.log(`Workbook read successfully, Sheets: ${workbook.SheetNames}`)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // Redefinir o alcance da planilha manualmente
  const range = xlsx.utils.decode_range(sheet["!ref"])
  const numRows =
    Object.keys(sheet).filter((key) => key[0] !== "!").length / (range.e.c + 1)
  range.e.r = numRows - 1
  sheet["!ref"] = xlsx.utils.encode_range(range)

  // Inspecionar as primeiras linhas da planilha
  const sheetRange = xlsx.utils.decode_range(sheet["!ref"])
  const firstRows = []
  for (let rowNum = sheetRange.s.r; rowNum <= sheetRange.s.r + 5; rowNum++) {
    const row = []
    for (let colNum = sheetRange.s.c; colNum <= sheetRange.e.c; colNum++) {
      const cell = sheet[xlsx.utils.encode_cell({ r: rowNum, c: colNum })]
      row.push(cell ? cell.v : null)
    }
    firstRows.push(row)
  }
  console.log("First few rows from the sheet:", firstRows)

  console.log(sheetRange)

  // Ler os dados manualmente, ignorando a primeira linha (cabeçalho)
  const rows = []
  for (let rowNum = sheetRange.s.r + 1; rowNum <= sheetRange.e.r; rowNum++) {
    const row = {
      Concurso: sheet[xlsx.utils.encode_cell({ r: rowNum, c: 0 })]?.v,
      "Data do Sorteio": sheet[xlsx.utils.encode_cell({ r: rowNum, c: 1 })]?.v,
      Bola1: sheet[xlsx.utils.encode_cell({ r: rowNum, c: 2 })]?.v,
      Bola2: sheet[xlsx.utils.encode_cell({ r: rowNum, c: 3 })]?.v,
      Bola3: sheet[xlsx.utils.encode_cell({ r: rowNum, c: 4 })]?.v,
      Bola4: sheet[xlsx.utils.encode_cell({ r: rowNum, c: 5 })]?.v,
      Bola5: sheet[xlsx.utils.encode_cell({ r: rowNum, c: 6 })]?.v,
      Bola6: sheet[xlsx.utils.encode_cell({ r: rowNum, c: 7 })]?.v,
    }
    rows.push(row)
  }

  console.log(`Data converted to JSON: ${rows.length} rows`)
  return rows
}

const populateSqlTable = async () => {
  const filePath = path.join(__dirname, "Mega-Sena.xlsx")
  console.log(`File path: ${filePath}`)

  try {
    const data = readXlsxFile(filePath)

    console.log(`\nTotal rows read from XLSX: ${data.length}\n`)
    console.log(data.slice(0, 5)) // Log para imprimir as primeiras linhas lidas

    await sequelize.sync({ force: true })

    const results = data
      .map((row) => {
        if (!row["Concurso"] || !row["Data do Sorteio"]) {
          console.log("Skipping row due to missing Concurso or Data do Sorteio")
          return null
        }

        const dateParts = row["Data do Sorteio"].split("/")
        const formattedDate = new Date(
          `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        )

        return {
          concurso: row["Concurso"],
          data: formattedDate,
          numero1: row["Bola1"],
          numero2: row["Bola2"],
          numero3: row["Bola3"],
          numero4: row["Bola4"],
          numero5: row["Bola5"],
          numero6: row["Bola6"],
        }
      })
      .filter((result) => result !== null)

    console.log(`\nTotal rows to be inserted: ${results.length}`)

    await Result.bulkCreate(results)
    console.log("\nDados armazenados no banco de dados com sucesso.")
  } catch (error) {
    console.error("Error reading the file:", error)
  }
}

populateSqlTable()
