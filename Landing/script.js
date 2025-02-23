const landingPage = {
    allElements : (document.querySelectorAll('*')),
    colorModeButton: document.querySelector('#colorModeButton'),
    //toggle the color mode of the page when the color mode button is clicked
    changeColorMode: function() {
        //change the color mode of the page
        if (this.colorModeButton.classList.contains('lightMode')) {
            this.colorModeButton.style.right = '-13px';
        } else if (this.colorModeButton.classList.contains('darkMode')) {
            this.colorModeButton.style.right = '13px';
        };
        //toggle the color mode of all elements on the page
        this.allElements.forEach(element => {
            element.classList.toggle('lightMode');
            element.classList.toggle('darkMode');
        });
        //save the current color state of the page to browser cache
        const pageState = {
            colorMode: this.colorModeButton.classList[1],
            buttonPosition: this.colorModeButton.style.right,
        };
        localStorage.setItem("landingPageColorMode", JSON.stringify(pageState));
    },
    //load the color mode of the page from browser cache or set it to light mode if no color state is saved
    loadColorMode: function() {
        //load the saved color state of the page from browser cache
        if (localStorage.getItem("landingPageColorMode")) {
            const savedState = JSON.parse(localStorage.getItem("landingPageColorMode"));
            this.colorModeButton.style.right = savedState.buttonPosition;
            this.allElements.forEach(element => {
                element.classList.toggle(savedState.colorMode);
            });
        //if no color state is saved, set the color mode to light mode
        } else {
            this.allElements.forEach(elm => {
                elm.classList.toggle('lightMode');
            });
        };
    },
    //initialize the page by displaying projects and loading color mode from browser cache
    initializePage: function() {
        projectSpace.displayProjects();
        this.allElements = document.querySelectorAll('*');
        this.loadColorMode();
    }
};

const projectSpace = {
    projectArea : document.querySelector('#projectArea'),
    projectArray : [],
    //add a project to the project array
    addProject : function(project, projectDescription, highlights, properName) {
        this.projectArray.push({
            projectName : project,
            projectLocation : `..\\Projects\\${project}\\index.html`,
            imgLocation : `..\\Imgs\\Projects\\${project}.png`,
            projectDescription : projectDescription,
            githubLink : `https://github.com/bbarrington0099/Workshop/tree/main/Projects/${project}`,
            highlights : highlights,
            properName : properName
        })
    },
    //display all projects in the project array
    displayProjects : function() {
        this.projectArea.innerHTML = this.projectArray.map(project => {
            return (
            `<div id="${project.projectName}" class="project">
                <h2>${project.properName ? project.properName : project.projectName}</h2>
                <a href="${project.projectLocation}" target="_blank">
                    <img src="${project.imgLocation}" alt="${project.projectDescription}" class="projectImg">
                </a>
                <p class="projectHighlights">${project.highlights}</p>
                <a class="sourceLink" href="${project.githubLink}" target="_blank">Source Code</a>
            </div>`)
        }).join('');
    },
};

//list which projects to display and their descriptions
projectSpace.addProject('Bible', 'the KJV of The Holy Bible', 'My most recent project, focusing on using Classes when parsing data gathered with Fetch()', 'The Holy Bible (KJV)')
projectSpace.addProject('PrimeChecker', 'a tool for working with prime numbers', 'My first project, working with DOM manipulation and gathering user data', 'Prime Number Tool');
projectSpace.addProject('HiddenVillageCards', 'expandable cards that give information about the hidden villages in the Naruto Universe', 'An early project, emphasizing on working with dynamic CSS', 'Dynamic Naruto Cards');
projectSpace.addProject('RPG', 'a text-based RPG game', 'A Text Based RPG using Objects to change the DOM based on User Interaction', 'Dragon Repeller');
projectSpace.addProject('DrawingApp', 'a paint like drawing app', `A 'Paint' like drawing app to familiarize myself with the basics of Canvas<strong><span class="mobileDisclaimer"> Not currently supported on Mobile</span></strong>`, 'Drawing App');
projectSpace.addProject('MovieApp', 'a movie searching application', 'Utilizing Fetch() to list Movies in a searchable display', 'Movie Searchbase');
projectSpace.addProject('NotesApp', 'an app for keeping and editing notes', 'Learning to save and pull from Local Storage and utilizing live user input');
projectSpace.addProject('Pong', `a clone of the classic game, 'Pong'`, 'Importing Modules and using ClientRect() to create and move Objects<strong><span class="mobileDisclaimer"> Currently requires click on Mobile rather than drag</span></strong>');
projectSpace.addProject('Snake', `a clone of the classic game, 'Snake'`, 'Taking User Input to move an object on a grid and give feedback based on actions<strong><span class="mobileDisclaimer"> Not currently supported on Mobile</span></strong>');
projectSpace.addProject('PasswordGenerator', 'a random password generator with options', 'Reading selected options to output data within the desired parameters', 'Password Generator');
projectSpace.addProject('LiveUserFilter', 'a searchable user database', 'Pulling random users from a Database to create a filterable UI', 'User Searchbase');

/*
TO-DO:
    change lorem ipsum to introduction
*/