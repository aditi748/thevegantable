const recipeGrid = document.getElementById("recipeGrid");
const searchInput = document.getElementById("searchInput");
const recipeContainer = document.getElementById("recipeContainer");

let allRecipes = [];

// Fetch recipes.json
async function fetchRecipes() {
  try {
    const res = await fetch("data/recipes.json");
    if (!res.ok) throw new Error("Failed to load recipes");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    if (recipeContainer) {
      recipeContainer.innerHTML =
        "<p style='color:red;'>Failed to load recipes.</p>";
    }
    return [];
  }
}

// Navbar buttons handling
const navButtons = document.querySelectorAll(".nav-links button");

function setActiveNavbarButton(category) {
  navButtons.forEach((btn) => {
    if (btn.textContent.trim().toLowerCase() === category?.toLowerCase()) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Click event for navbar buttons
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.textContent.trim();
    setActiveNavbarButton(category);

    if (recipeGrid) {
      filterRecipes(category);
    } else {
      const urlCategory = encodeURIComponent(category);
      window.location.href = `index.html?category=${urlCategory}#recipes`;
    }
  });
});

// Create recipe cards
function createRecipeCards(recipes) {
  if (!recipeGrid) return;
  recipeGrid.innerHTML = "";

  if (recipes.length === 0) {
    recipeGrid.innerHTML = "<p style='color:red;'>No recipes found.</p>";
    return;
  }

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card home-style";
    card.dataset.category = recipe.category;
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" />
      <div class="card-content">
        <h3>${recipe.title}</h3>
        <span class="tag">${recipe.category}</span>
        <p class="meta">${recipe.description}</p>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `recipe.html?id=${recipe.id}`;
    });
    recipeGrid.appendChild(card);
  });
}

// Filter recipes by category
function filterRecipes(category) {
  const normalized = category.trim().toLowerCase();
  if (normalized === "all recipes") {
    createRecipeCards(allRecipes);
  } else {
    const filtered = allRecipes.filter(
      (r) => r.category && r.category.toLowerCase() === normalized
    );
    createRecipeCards(filtered);
  }

  // Scroll to recipe grid
  if (recipeGrid)
    document.getElementById("recipes").scrollIntoView({ behavior: "smooth" });
}

// Display single recipe on recipe.html
function displayRecipe(recipes) {
  if (!recipeContainer) return;

  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("id");
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    recipeContainer.innerHTML = "<p style='color:red;'>Recipe not found.</p>";
    document.title = "Recipe Not Found - The Vegan Table";
    return;
  }

  document.title = `${recipe.title} - The Vegan Table`;

  const ingredientsHTML = Object.entries(recipe.ingredients || {})
    .map(
      ([groupName, items]) => `
      <div class="ingredient-group">
        <h3 class="section-title">${groupName}</h3>
        <div class="ingredients">
          <ul>
            ${items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      </div>
    `
    )
    .join("");

  const instructionsHTML = recipe.instructions
    .map(
      (step, i) => `<li><span class="step-number">${i + 1}</span>${step}</li>`
    )
    .join("");

  recipeContainer.innerHTML = `
    <a class="back-link" href="index.html">&larr; Back to Recipes</a>

    <img class="recipe-image" src="${recipe.image}" alt="${recipe.title}" />

    <h1 class="recipe-title">${recipe.title}</h1>
    <p class="recipe-description">${recipe.description}</p>

    <div class="cooking-info">
      <div class="info-item">
        <span class="label">COOKING TIME</span>
        <span class="value">${recipe.cookingTime}</span>
      </div>
      <div class="info-item">
        <span class="label">DIFFICULTY</span>
        <span class="value">${recipe.difficulty}</span>
      </div>
      <div class="info-item">
        <span class="label">SERVINGS</span>
        <span class="value">${recipe.servings}</span>
      </div>
    </div>

    ${ingredientsHTML}

    <h3 class="section-title">Instructions</h3>
    <div class="instructions">
      <ol>${instructionsHTML}</ol>
    </div>

    ${recipe.tips ? `<div class="tips"><p>${recipe.tips}</p></div>` : ""}
  `;
}

// Display related recipes
function displayRelatedRecipes(recipes) {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("id");
  const relatedContainer = document.getElementById("relatedRecipes");
  if (!relatedContainer) return;

  const related = recipes.filter((r) => r.id !== recipeId);

  relatedContainer.innerHTML = "";

  related.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card home-style";
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" />
      <div class="card-overlay">
        <h3>${recipe.title}</h3>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `recipe.html?id=${recipe.id}`;
    });
    relatedContainer.appendChild(card);
  });
}

// Explore Recipes button
document.addEventListener("DOMContentLoaded", () => {
  const exploreBtn = document.querySelector(".hero-btn");
  const recipesSection = document.getElementById("recipes");

  if (exploreBtn && recipesSection) {
    exploreBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (recipeGrid) createRecipeCards(allRecipes);

      recipesSection.scrollIntoView({ behavior: "smooth" });
    });
  }
});

// DOMContentLoaded main
document.addEventListener("DOMContentLoaded", async () => {
  allRecipes = await fetchRecipes();

  if (recipeGrid) createRecipeCards(allRecipes);
  if (recipeContainer) {
    displayRecipe(allRecipes);
    displayRelatedRecipes(allRecipes);
  }

  // ✅ Set active navbar button based on URL category
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get("category");
  setActiveNavbarButton(categoryFromUrl);

  // Filter recipes if category present on homepage
  if (categoryFromUrl && recipeGrid) {
    filterRecipes(categoryFromUrl);
    setTimeout(() => {
      document.getElementById("recipes").scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const filtered = allRecipes.filter((r) =>
        r.title.toLowerCase().includes(e.target.value.toLowerCase())
      );
      createRecipeCards(filtered);
    });
  }
});
