const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");

const app = express();
const host = "localhost";
const port = 3000;

// Static data for initial testing
let spiritLists = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false })); // RESEARCH WHAT THIS IS FOR

app.use(session({
  name: "launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
}));

app.use(flash());

const findSpirit = spirit => {
  return spiritLists.find(list => list.title.toLowerCase() === spirit);
}

const findRecipe = (spiritName, cocktailName) => {
  return findSpirit(spiritName).recipes.find(recipe => recipe.name.toLowerCase() === cocktailName);
};

const findSpiritIndex = spiritName => {
  return spiritLists.findIndex(spirit => spirit.title.toLowerCase() === spiritName);
};

const findRecipeIndex = (cocktailName, spirtiIndex) => {
  return spiritLists[spirtiIndex].recipes.findIndex(recipe => {
    return recipe.name.toLowerCase() === cocktailName
  });
}

app.get("/", (req, res) => {
  res.render("spirits", { spiritLists });
});

app.get("/spirits", (req, res) => {
  res.redirect("/");
});

app.get("/spirits/:spiritName", (req, res, next) => {
  let spiritName = req.params.spiritName;

  let spirit = findSpirit(spiritName);

  if (spirit === undefined) {
    next(new Error("Not found."));
  } else {
    res.render("spirit", {
      spirit: spirit,
      spiritName: spiritName,
    });
  }
});

app.get("/spirits/:spiritName/:cocktailName", (req, res, next) => {
  let spiritName = req.params.spiritName;
  let cocktailName = req.params.cocktailName;

  let cocktailRecipe = findRecipe(spiritName, cocktailName);

  if (cocktailRecipe === undefined) {
    next(new Error("Not found."));
  } else {
    res.render("recipe", {
      spiritName: spiritName,
      cocktailName: cocktailName,
      cocktailRecipe: cocktailRecipe,
    });
  }
});

app.get("/spirits/:spiritName/:cocktailName/editrating", (req, res, next) => {
  let spiritName = req.params.spiritName;
  let cocktailName = req.params.cocktailName;

  let cocktailRecipe = findSpirit(spiritName).recipes.find(recipe => recipe.name.toLowerCase() === cocktailName);

  if (cocktailRecipe === undefined) {
    next(new Error("Not found."));
  } else {
    console.log(spiritLists);
    res.render("editrating", {
      spiritName: spiritName,
      cocktailName: cocktailName,
      cocktailRecipe: cocktailRecipe,
    });
  }
});

app.post("/spirits/:spiritName/:cocktailName/editrating",
  [ // NEED TO FIX THE VALIDATION
    body("cocktailRating")
      .trim()
      .isNumeric()
      .withMessage("The rating is required.")
      .isNumeric()
      .withMessage("The max rating is 5"),
  ],
  (req, res, next) => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.render("editrating", {
        flash: req.flash(),
        cocktailRating: req.body.cocktailRating,
      });
    } else {
      let spiritName = req.params.spiritName;
      let cocktailName = req.params.cocktailName;

      let spirtiIndex = findSpiritIndex(spiritName);
      let recipeIndex = findRecipeIndex(cocktailName, spirtiIndex);

      spiritLists[spirtiIndex].recipes[recipeIndex].rating = req.body.cocktailRating;
      res.redirect(`/spirits/${spiritName}/${cocktailName}`)
    }
  }
);

// Error handler
app.use((err, req, res, _next) => {
  console.log(err); // Writes more extensive information to the console log
  res.status(404).send(err.message);
});

// Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});