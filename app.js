const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const store = require("connect-loki");


const app = express();
const host = "localhost";
const port = 3000;
const LokiStore = store(session);

// Static data for initial testing
let spiritLists = require("./lib/seed-data");

// clones object with no methods or prototype data
const clone = object => {
  return JSON.parse(JSON.stringify(object));
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Sets a cookie
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in milliseconds
    path: "/",
    secure: false,
  },
  name: "launch-school-contacts-manager-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
  store: new LokiStore({}),
}));

// Set up persistent session data
app.use((req, res, next) => {
  if (!("spiritLists" in req.session)) {
    req.session.spiritLists = clone(spiritLists);
  }

  next();
});

app.use(flash());

// Sorts the list of spirits alphabetically
const sortSpirits = (list) => {
  return list.slice().sort((spiritA, spiritB) => {
    if (spiritA.title.toLowerCase() < spiritB.title.toLowerCase()) {
      return -1;
    } else if (spiritA.title.toLowerCase() > spiritB.title.toLowerCase()) {
      return 1;
    } else {
      return 0;
    }
  });
};

// Sorts the cocktails list alphabetically
const sortCocktails = selectedSpirit => {
  return selectedSpirit.sort((cocktailA, cocktailB) => {
    if (cocktailA.name.toLowerCase() < cocktailB.name.toLowerCase()) {
      return -1;
    } else if (cocktailA.name.toLowerCase() < cocktailB.name.toLowerCase()) {
      return 1;
    } else {
      return 0;
    }
  });
}

// Locates the selected spirit in the spirit list
const findSpirit = (list, spirit) => {
  return list.find(list => list.title.toLowerCase() === spirit);
};

// Locates the cocktail receipe in the list in spirits
const findRecipe = (list, spiritName, cocktailName) => {
  return findSpirit(list, spiritName).recipes.find(recipe => recipe.name.toLowerCase() === cocktailName);
};

// Locates the index of the spirit in the spirit list
const findSpiritIndex = (list, spiritName) => {
  return list.findIndex(spirit => spirit.title.toLowerCase() === spiritName);
};

// Locates the index of the cocktail receipe in the spirit object
const findRecipeIndex = (list, cocktailName, spirtiIndex) => {
  return list[spirtiIndex].recipes.findIndex(recipe => {
    return recipe.name.toLowerCase() === cocktailName
  });
}

// Renders a list of sorted spirits
app.get("/", (req, res) => {
  req.session.spiritLists = sortSpirits(req.session.spiritLists);
  res.render("spirits", {
    spirits: req.session.spiritLists,
  });
});

// Redirects to list of sorted spirits
app.get("/spirits", (req, res) => {
  res.redirect("/");
});

// Renders a list of cocktails for the selected spirit
app.get("/spirits/:spiritName", (req, res, next) => {
  let spiritName = req.params.spiritName;
  let spirit = findSpirit(req.session.spiritLists, spiritName);
  spirit.recipes = sortCocktails(spirit.recipes);

  if (spirit === undefined) {
    next(new Error("Not found."));
  } else {
    res.render("spirit", {
      spirit: spirit,
      spiritName: spiritName,
    });
  }
});

// Renders the cocktail recipe and rating
app.get("/spirits/:spiritName/:cocktailName", (req, res, next) => {
  let spiritName = req.params.spiritName;
  let cocktailName = req.params.cocktailName;
  let cocktailRecipe = findRecipe(req.session.spiritLists, spiritName, cocktailName);

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

// Render the edit rating view
app.get("/spirits/:spiritName/:cocktailName/editrating", (req, res, next) => {
  let spiritName = req.params.spiritName;
  let cocktailName = req.params.cocktailName;
  let cocktailRecipe = findSpirit(req.session.spiritLists, spiritName).recipes.find(recipe => recipe.name.toLowerCase() === cocktailName);

  if (cocktailRecipe === undefined) {
    next(new Error("Not found."));
  } else {
    res.render("editrating", {
      spiritName: spiritName,
      cocktailName: cocktailName,
      cocktailRecipe: cocktailRecipe,
    });
  }
});

// Posts the rating to the server
app.post("/spirits/:spiritName/:cocktailName/editrating",
  [
    body("cocktailRating")
      .trim()
      .isInt({ min: 1, max: 5 })
      .withMessage("The number rating between 1-5 is required.")
  ],
  (req, res, next) => {
    let spiritName = req.params.spiritName;
    let cocktailName = req.params.cocktailName;

    let spirtiIndex = findSpiritIndex(req.session.spiritLists, spiritName);
    let recipeIndex = findRecipeIndex(req.session.spiritLists, cocktailName, spirtiIndex);
    let cocktailRecipe = findSpirit(req.session.spiritLists, spiritName).recipes.find(recipe => recipe.name.toLowerCase() === cocktailName);

    if (recipeIndex === -1) {
      next(new Error("Not found."));
    } else {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach(message => req.flash("error", message.msg));
        res.render("editrating", {
          cocktailName: cocktailName,
          cocktailRecipe: cocktailRecipe,
          cocktailRating: req.body.cocktailRating,
          spiritName: spiritName,
          flash: req.flash(),
        });
      } else {
        req.session.spiritLists[spirtiIndex].recipes[recipeIndex].rating = req.body.cocktailRating;
        req.flash("success", "The rating has been added.")
        res.redirect(`/spirits/${spiritName}/${cocktailName}`);
      }
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