import axios from 'axios';

class Search {
    constructor(query) {
        this.query = query;
    }

    async getResult() {
        try {
            const result = await axios(`https://forkify-api.herokuapp.com/api/search/?q=${this.query}`);
            this.result = result.data.recipes;
        } catch (err) {
            console.log(err);
        }
    }

}

export default Search;



