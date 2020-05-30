import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';
import ip from 'ip';

// Log ip to the console
console.log(ip.address());

// Global state of the app
const state = {};

// SEARCH CONTROLLER
const handleSearch = async () => {
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
    handleSearch();
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
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            alert('Error processing recipe!');
        }
    }


}

['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

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
    }

});