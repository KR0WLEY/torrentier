import axios from 'axios';
import cheerio from 'cheerio';
const categoryURLs = { 'Animes': `https://www.limetorrents.lol/search/anime/QUERY/SORTING/PAGE`, 'Games': `https://www.limetorrents.lol/search/games/QUERY/SORTING/PAGE`, 'Movies': `https://www.limetorrents.lol/search/movies/QUERY/SORTING/PAGE`, 'TV Shows': `https://www.limetorrents.lol/search/tv/QUERY/SORTING/PAGE`, 'NoCategory': `https://www.limetorrents.lol/search/all/QUERY/SORTING/PAGE` };
async function limeTorrents(category, query, sorting, numPages) {
    try {
        const torrents = [];
        for (let page = 1; page <= numPages; page++) {
            const categoryURL = categoryURLs[category];
            const url = categoryURL.replace('QUERY', encodeURIComponent(query)).replace('SORTING', sorting).replace('PAGE', page);
            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);
            $('table.table2 tbody tr').each((index, element) => {
                if(index === 0) return;
                const title = $(element).find('td:nth-child(1) a').text().trim();
                const link = `https://www.limetorrents.lol${$(element).find('td.tdleft .tt-name a').eq(1).attr('href')}`;
                const size = $(element).find('td:nth-child(3)').text().trim();
                const seeders = parseInt($(element).find('td.tdseed').text().trim());
                torrents.push({ title, link, size, seeders, category });
            });
        }
        return torrents;
    } catch (error) {
        console.error(`Error ${error}`);
        return [];
    }
}
export { limeTorrents }
