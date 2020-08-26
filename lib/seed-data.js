const RecipeList = require("./recipelist");
const Recipe = require("./recipe");

let bourbonCocktails = new RecipeList("Bourbon");
bourbonCocktails.add(new Recipe("Manhattan", ["2oz bourbon", "1oz sweet vermouth", "2 dash Angostura bitters", "1 dash orange bitters", "brandied cherry garnish"]));

bourbonCocktails.add(new Recipe("Old Fashioned", ["2oz bourbon", "1 tsp water", "0.5 tsp sugar", "3 dashes Angostura bitters", "organe peel garnish"]));

bourbonCocktails.add(new Recipe("Whiskey Sour", ["2oz bourbon", ".75oz fresh lemon juice", "0.5oz simple syrup", "0.5oz egg white", "Angostura bitters garnish"]));

let ginCocktails = new RecipeList("Gin");

ginCocktails.add(new Recipe("Dry Martini", ["2.5oz gin", "0.5oz dry vermouth", "1 dash orange bitters", "lemon twist garnish"]));
ginCocktails.add(new Recipe("Gin & Tonic", ["2oz gin", "4oz tonic water", "2 lime wheels garnish"]));
ginCocktails.add(new Recipe("Gimlet", ["2.5oz gin", ".5oz fresh lime juice", "0.5oz simple syrup", "lime wheel garnish"]));

let vodkaCocktails = new RecipeList("Vodka");

vodkaCocktails.add(new Recipe("Dirty Martini", ["2.5oz gin", "0.5oz dry vermouth", "0.5oz olive brine", "2-4 olives garnish"]));
vodkaCocktails.add(new Recipe("Lemon Drop", ["2oz vodka", "0.5oz triple sec", "1oz simple syrup", "1oz fresh lemon juice", "sugar rim garnish"]));
vodkaCocktails.add(new Recipe("Cosmopolition", ["1.5oz citrus vodka", "1oz cointreau", "0.5oz fresh lime juice", "1 dash cranberry juice", "lime wheel garnish"]));

let spiritLists = [
  bourbonCocktails,
  ginCocktails,
  vodkaCocktails
];

module.exports = spiritLists;