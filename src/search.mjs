import { scrape1337x } from './providers/1337x.mjs';
import { magnetDLSearch } from './providers/magnetDL.mjs';

async function combinedSearch(query, categories, pages = 1) {
    console.log('Performing combined search with query: ', query);
    try {
        const promises = [];

        promises.push(scrape1337x(query, pages));
        promises.push(magnetDLSearch(query, pages));

        const results = await Promise.all(promises);

        return results.flat();
    } catch (error) {
        console.error(`Error during search: ${error}`);
        return [];
    }
}

export { combinedSearch };
