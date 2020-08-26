const Recipe = require("./recipe");

class RecipeList {
  constructor(title) {
    this.title = title;
    this.recipes = [];
  }

  add(recipe) {
    if (!(recipe instanceof Recipe)) {
      throw new Error("Can only add Recipe objects");
    }

    this.recipes.push(recipe);
  }
}

module.exports = RecipeList;