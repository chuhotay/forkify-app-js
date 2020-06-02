const DOM = element => document.querySelector(element);

export const elements = {
    searchForm: DOM('.search'),
    searchInput: DOM('.search__field'),
    searchResultList: DOM('.results__list'),
    searchRes: DOM('.results'),
    searchResPages: DOM('.results__pages'),
    recipe: DOM('.recipe'),
    shopping: DOM('.shopping__list'),
    likesMenu: DOM('.likes__field'),
    likesList: DOM('.likes__list')
};

export const elementStrings = {
    loader: 'loader'
};

export const renderLoader = parent => {
    const loader = `
        <div class="${elementStrings.loader}">
            <svg>
                <use href="img/icons.svg#icon-cw"></use>
            </svg>
        </div>
    `;

    parent.insertAdjacentHTML('afterbegin', loader);
};

export const clearLoader = () => {
    const loader = document.querySelector(`.${elementStrings.loader}`);
    if (loader) loader.parentElement.removeChild(loader);
};