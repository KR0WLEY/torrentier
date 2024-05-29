const { ipcRenderer, shell } = require('electron');
const loadingElement = document.querySelector('.loader');
const searchResultsDiv = document.getElementById('search-results');
const paginationControlsDiv = document.getElementById('pagination-controls');
const searchInput = document.getElementById('query');
const matchResults = { "Movie": "Movies", "Game": "Games" };
const RESULTS_PER_PAGE = 10;
let currentPage = 1;
let totalPages = 1;
let results = [];

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', function (event) {
        var checkbox = event.target;
        if (checkbox.matches('#cbx-all')) {
            var checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
            checkboxes.forEach((cb) => {
                if (cb !== checkbox) {
                    cb.disabled = checkbox.checked;
                    if (checkbox.checked) cb.checked = false;
                }
            });
        }
    });

    function selectedCheckboxes() {
        const markedCheckboxes = [];
        const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) markedCheckboxes.push(checkbox.value);
        });
        return markedCheckboxes;
    }

    function clearResultsAndPagination() {
        searchResultsDiv.innerHTML = '';
        paginationControlsDiv.innerHTML = '';
    }

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            loadingElement.style.display = 'block';
            clearResultsAndPagination();
            currentPage = 1;

            const query = String(searchInput.value).trim();
            if (query !== '') {
                const categories = selectedCheckboxes();
                ipcRenderer.send('perform-search', { query, categories });
            }
        }
    });

    ipcRenderer.on('update-search-results', (event, { searchResults, categories }) => {
        clearResultsAndPagination();

        console.log('Selected Categories:', categories);
        console.log('Search Results:', searchResults);

        if (categories && categories.length > 0 && !categories.includes('All')) {
            results = searchResults.filter(result => {
                return categories.some(category => {
                    const mappedCategory = matchResults[category] || category;
                    return (result.category === mappedCategory || result.type === category) || (result.category === category || result.type === mappedCategory);
                });
            });
        } else {
            results = searchResults;
        }

        results.sort((a, b) => (b.seeders || b.seeds || 0) - (a.seeders || a.seeds || 0));

        console.log('Filtered and Sorted Results:', results);

        if (results.length === 0) {
            loadingElement.style.display = 'none';
            searchResultsDiv.innerHTML = '<div class="no-results">No results found</div>';
        } else {
            totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
            loadingElement.style.display = 'none';
            displayResults(results);
            renderPaginationControls();
        }
    });

    function displayResults(results) {
        searchResultsDiv.innerHTML = '';

        const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
        const endIndex = Math.min(startIndex + RESULTS_PER_PAGE, results.length);

        for (let i = startIndex; i < endIndex; i++) {
            if (results[i]) {
                const result = results[i];

                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');

                const resultLink = document.createElement('a');
                resultLink.href = result.magnetURL || result.link;
                resultLink.textContent = `${i + 1}. ${result.title}`;
                resultLink.classList.add('result-link');

                resultLink.addEventListener('click', function (event) {
                    event.preventDefault();
                    shell.openExternal(result.magnetURL || result.link);
                });

                const seedersSpan = document.createElement('span');
                seedersSpan.textContent = ` | Seeders: ${result.seeders || result.seeds}`;
                seedersSpan.classList.add('result-seeders');

                const sizeSpan = document.createElement('span');
                sizeSpan.textContent = ` | SIZE: ${result.size}`;
                sizeSpan.classList.add('result-size');

                resultItem.appendChild(resultLink);
                resultItem.appendChild(seedersSpan);
                resultItem.appendChild(sizeSpan);

                searchResultsDiv.appendChild(resultItem);
            }
        }
    }

    function addButton(text, page, className = '') {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'page-button ' + className;
        button.addEventListener('click', () => {
            currentPage = page;
            displayResults(results);
            renderPaginationControls();
        });
        paginationControlsDiv.appendChild(button);
    }

    function renderPaginationControls() {
        paginationControlsDiv.innerHTML = '';

        if (totalPages <= 1) return;

        if (currentPage > 1) {
            addButton('Previous', currentPage - 1);
        }

        for (let i = 1; i <= totalPages; i++) {
            addButton(i, i, i === currentPage ? 'active' : '');
        }

        if (currentPage < totalPages) {
            addButton('Next', currentPage + 1);
        }
    }
});
