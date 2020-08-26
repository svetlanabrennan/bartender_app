class Recipe {
  constructor(name, ingridents, rating = "Not Rated") {
    this.name = name;
    this.ingridents = ingridents;
    this.rating = rating;
  }
}

module.exports = Recipe;