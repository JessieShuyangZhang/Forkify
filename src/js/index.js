// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipes';
import * as searchView from './views/searchViews';
import * as recipeView from './views/recipeViews';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 *  - Search object 
 *  - current recipe object 
 *  - shopping list object
 *  - liked recipes
 */
const state = {};

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1) get query from view
    const query = searchView.getInput();
    // const query = 'pizza'; //for testing
    console.log(query);

    if(query){
        // 2) new search object and add to state
        state.search = new Search(query);

        // 3) prepare UI for results 
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            // 4) search for recipes
            await state.search.getResults(); 

            // 5) render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(error){
            console.log(error);
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    // console.log(btn);
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        console.log(goToPage);
    }
});


/**
 * RECIPE CONTROLLER 
 */
const controlRecipe = async () => {
    //get ID from url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if(id){
        // prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        // highlight selected search
        if(state.search) searchView.highlightSelected(id);

        // create new recipe object
        state.recipe = new Recipe(id);

        try{
            // get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render the recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch(error) {
            alert('Error processing recipe!');
            console.log(error);
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));  //???




// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        state.recipe.updateServings('dec');
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
    }
});