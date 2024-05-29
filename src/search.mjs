import { scrape1337x } from './providers/1337x.mjs';
import { magnetDLSearch } from './providers/magnetDL.mjs';

async function combinedSearch(query, categories) {
    console.log('Performing combined search with query: ', query);
    try {
        const promises = [];

        if (categories && categories.length > 0) {
            promises.push(scrape1337x(query, categories));
        } else {
            promises.push(scrape1337x(query, ['Movies', 'Games', 'Animes', 'TV']));
        }
        promises.push(magnetDLSearch(query));

        const results = await Promise.all(promises);

        return results.flat();
    } catch (error) {
        console.error(`Error during search: ${error}`);
        return [];
    }
}

export { combinedSearch };
