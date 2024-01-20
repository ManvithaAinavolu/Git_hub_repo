const userProfileContainer = document.getElementById('user-profile');
const container = document.getElementById('repositories-container');
const paginationContainer = document.getElementById('page-numbers');
const usernameInput = document.getElementById('username');

let currentPage = 1;
let totalRepositoryPages = 10; // Declare at the global level
const repositoriesPerPage = 10; // Adjust as needed

async function fetchUserData() {
    const username = usernameInput.value.trim();
    if (username === '') {
        alert('Please enter a GitHub username.');
        return;
    }

    try {
         displayLoader(true);

        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        const user = await userResponse.json();

        const repositoriesResponse = await fetch(`https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${repositoriesPerPage}`);
        const repositories = await repositoriesResponse.json();

         const linkHeader = repositoriesResponse.headers.get('Link');
        setTotalPages(linkHeader);

        displayUserProfile(user);
        displayRepositories(repositories);
        createPagination();  
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('An error occurred while fetching user data. Please try again.');
    } finally {
         displayLoader(false);
    }
}

function displayLoader(show) {
    const loader = document.getElementById('loader');
    if (show) {
        loader.style.display = 'block';
    } else {
        loader.style.display = 'none';
    }
}

function setTotalPages(linkHeader) {
    const lastMatch = linkHeader && linkHeader.match(/<([^>]+)>; rel="last"/);

    if (lastMatch) {
        const urlParams = new URLSearchParams(lastMatch[1]);
        totalRepositoryPages = parseInt(urlParams.get('page')) || 1;
    } else {
        totalRepositoryPages = 1;
    }
}

function displayUserProfile(user) {
    userProfileContainer.innerHTML = `
        <img src="${user.avatar_url}" alt="${user.login}" width="100%">
        <h2>${user.name || user.login}</h2>
        <h5>Bio: ${user.bio || 'Not specified'}</h5>

        <p>Location: ${user.location || 'Not specified'}</p>
        <p>Github URL: <a href="${user.html_url}" target="_blank">${user.html_url}</a></p>
    `;
}

function displayRepositories(repositories) {
    container.innerHTML = '';

    repositories.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo-card';
        card.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || 'No description available.'}</p>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
            <div class="tech-domains">Tech Domains: ${repo.language || 'Not specified'}</div>
        `;
        container.appendChild(card);
    });
}

async function loadPage(pageNumber) {
    currentPage = pageNumber;
    await fetchUserData();
    createPagination();  // Ensure createPagination is called after displaying repositories
}


function createPagination() {
    console.log('Creating pagination...');

    if (totalRepositoryPages > 1) {
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalRepositoryPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => loadPage(i));
            if (i === currentPage) {
                button.classList.add('active');
            }
            paginationContainer.appendChild(button);
        }

        console.log('Pagination created:', paginationContainer.innerHTML);
    } else {
        console.log('No pagination needed.');
    }
}


fetchUserData();

