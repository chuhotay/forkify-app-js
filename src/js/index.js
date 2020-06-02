import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as shoppingListView from './views/shoppingListView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import ip from 'ip';

// Log ip to the console
console.log(ip.address());

// Global state of the app
const state = {
    likes: '',
    recipe: '',
    search: ''
};
window.state = state;

// SEARCH CONTROLLER
const controlSearch = async () => {
    // 1. Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        try {
            // 4. Search for recipes
            await state.search.getResult();

            // 5. Display results on UI
            clearLoader();
            searchView.renderResult(state.search.result);
        } catch (err) {
            alert('Something went wrong :(');
            clearLoader();
        }

    }
};

// Add event for search button
elements.searchForm.addEventListener('submit', e => {
    // Say don't reload page when click search button
    e.preventDefault();

    // Call handle search
    controlSearch();
});

// Add event for pagination button
elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        // Get value of attribution data-goto
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResult(state.search.result, goToPage);
    };
});

// RECIPE CONTROLLER
const controlRecipe = async () => {
    // Get id of each recipe from URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id));
        } catch (err) {
            alert('Error processing recipe!');
        }
    }
};

['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

// SHOPPING LIST CONTROLLER
const controlShoppingList = () => {
    // Create a new list if there in none yet
    if (!state.shoppingList) state.shoppingList = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.shoppingList.addItem(el.count, el.unit, el.ingredient);
        shoppingListView.renderItem(item);
    });
};

// Handle delete and update shopping list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.shoppingList.deleteItem(id);

        // Delete from UI
        shoppingListView.deleteItem(id);

        // Handle the count update    
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        state.shoppingList.updateCount(id, val);
    }

});

// TESTING
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

// LIKES CONTROLLER
const controlLikes = () => {
    if (!state.likes) state.likes = new Likes();
    const curID = state.recipe.id;

    // User has not yet liked current recipe
    if (!state.likes.isLiked(curID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            curID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // Toggle the like button
        likesView.toggleLikeButton(true);

        // Add like to the UI list
        likesView.renderLike(newLike);

    // User has liked current recipe    
    } else {
        // Remove like to the state
        state.likes.deleteLike(curID);

        // Toggle the like button
        likesView.toggleLikeButton(false);

        // Remove like to the UI list
        likesView.deleteLike(curID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlShoppingList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Likes controller
        controlLikes();
    }
});
