document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".number-circle")
  const selectedNumbersInput = document.getElementById("selectedNumbers")
  const form = document.getElementById("number-form")
  let selectedNumbers = []

  circles.forEach((circle) => {
    circle.addEventListener("click", () => {
      const number = parseInt(circle.getAttribute("data-number"))
      if (selectedNumbers.includes(number)) {
        selectedNumbers = selectedNumbers.filter((n) => n !== number)
        circle.classList.remove("selected")
      } else if (selectedNumbers.length < 15) {
        selectedNumbers.push(number)
        circle.classList.add("selected")
      }
      selectedNumbersInput.value = selectedNumbers.join(",")
      console.log(selectedNumbers)
    })
  })

  form.addEventListener("submit", (e) => {
    if (selectedNumbers.length < 6 || selectedNumbers.length > 15) {
      e.preventDefault()
      alert("Por favor, selecione entre 6 e 15 números.")
    }
  })
})
