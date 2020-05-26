import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

// Global state of the app
const state = {};

const handleSearch = async () => {
    // 1. Get query from view
    const query = searchView.getInput();
    console.log(query);

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        // 4. Search for recipes
        await state.search.getResult();

        // 5. Display results on UI
        clearLoader();
        searchView.renderResult(state.search.result);
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

