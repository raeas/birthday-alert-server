function makePeopleArray() {
  return [
    {
      id: 1,
      first_name: "Martin",
      last_name: "Bryant",
      birthday: new Date("1975-09-25").toISOString()
    },
    {
      id: 2,
      first_name: "Jonathan",
      last_name: "Morris",
      birthday: new Date("1993-12-31").toISOString()
    },
    {
      id: 3,
      first_name: "Melissa",
      last_name: "Baker",
      birthday: new Date("2001-06-11").toISOString()
    },
    {
      id: 4,
      first_name: "Howard",
      last_name: "Phillips",
      birthday: new Date("1966-02-01").toISOString()
    }
  ]
}

module.exports = { makePeopleArray }