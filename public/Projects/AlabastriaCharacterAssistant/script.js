const app = {
   allElements: null,
   colorModeCheckbox: null,
   currentFilter: null,
   currentSelection: null,
   continentData: [],
   relationData: [],

   // Initialize the application
   async initializePage() {
      this.allElements = document.querySelectorAll('*');
      this.colorModeCheckbox = document.querySelector('#colorModeCheckbox');
      this.loadColorMode();
      await this.loadData();
      this.loadWorldDescription();
      this.showSection('welcome-section');
   },

   // Load data from JSON files
   async loadData() {
      try {
         const [continentResponse, relationResponse] = await Promise.all([
            fetch('json/continent_data.json'),
            fetch('json/relation_data.json')
         ]);

         this.continentData = await continentResponse.json();
         this.relationData = await relationResponse.json();
      } catch (error) {
         console.error('Error loading data:', error);
      }
   },

   // Load world description from continent data
   loadWorldDescription() {
      const worldData = this.continentData.find(item => item.world);
      if (worldData) {
         document.getElementById('world-description').textContent = worldData.description;
      }
   },

   // Color mode functionality
   changeColorMode() {
      this.allElements.forEach(element => {
         element.classList.toggle('lightMode');
         element.classList.toggle('darkMode');
      });

      const pageState = {
         colorMode: this.colorModeCheckbox.classList.contains('darkMode') ? 'darkMode' : 'lightMode',
         checked: this.colorModeCheckbox.checked,
      };
      localStorage.setItem("alabastriaColorMode", JSON.stringify(pageState));
   },

   loadColorMode() {
      if (localStorage.getItem("alabastriaColorMode")) {
         const savedState = JSON.parse(localStorage.getItem("alabastriaColorMode"));
         this.colorModeCheckbox.checked = savedState.checked;
         this.allElements.forEach(element => {
            element.classList.add(savedState.colorMode);
         });
      } else {
         this.allElements.forEach(elm => {
            elm.classList.add('lightMode');
         });
      }
   },

   // Navigation
   showSection(sectionId) {
      document.querySelectorAll('.section').forEach(section => {
         section.classList.remove('active');
      });
      document.getElementById(sectionId).classList.add('active');

      // Scroll to top when showing a new section
      window.scrollTo({
         top: 0,
         behavior: 'smooth'
      });
   },

   setFilter(filterType) {
      this.currentFilter = filterType;
      this.showSelectionSection();
   },

   goBack() {
      if (document.getElementById('details-section').classList.contains('active')) {
         this.showSelectionSection();
      } else {
         this.currentFilter = null;
         this.currentSelection = null;
         this.showSection('welcome-section');
      }
   },

   // Selection section
   showSelectionSection() {
      const title = document.getElementById('selection-title');
      const grid = document.getElementById('selection-grid');

      title.textContent = `Choose a ${this.currentFilter.charAt(0).toUpperCase() + this.currentFilter.slice(1)}`;
      grid.innerHTML = '';

      if (this.currentFilter === 'continent') {
         this.renderContinents(grid);
      } else if (this.currentFilter === 'race') {
         this.renderRaces(grid);
      } else if (this.currentFilter === 'class') {
         this.renderClasses(grid);
      }

      this.showSection('selection-section');
   },

   renderContinents(container) {
      // Filter out the world entry and render continents
      const continents = this.continentData.filter(item => item.continent);

      continents.forEach(continent => {
         const card = document.createElement('div');
         card.className = 'selection-card continent-card';
         // Store the full continent name for lookup
         card.onclick = () => this.selectItem(continent.continent);

         card.innerHTML = `
                <img src="continent_images/${continent.continent.split(" ")[0]}.png" 
                     alt="${continent.continent}" 
                     class="continent-image"
                     onerror="this.style.display='none'">
                <h3>${continent.continent}</h3>
                <p>${continent.description}</p>
            `;

         container.appendChild(card);
      });
   },

   renderRaces(container) {
      const races = new Set();

      this.relationData.forEach(classData => {
         classData.subclasses.forEach(subclass => {
            subclass.races.forEach(race => {
               races.add(race.name);
            });
         });
      });

      Array.from(races).sort().forEach(raceName => {
         const card = document.createElement('div');
         card.className = 'selection-card';
         card.onclick = () => this.selectItem(raceName);

         card.innerHTML = `
                <h3>${raceName}</h3>
                <p>A versatile race found across the lands of Alabastria</p>
            `;

         container.appendChild(card);
      });
   },

   renderClasses(container) {
      this.relationData.forEach(classData => {
         const card = document.createElement('div');
         card.className = 'selection-card';
         card.onclick = () => this.selectItem(classData.class);

         card.innerHTML = `
                <h3>${classData.class}</h3>
                <p>${classData.suitability_reason}</p>
            `;

         container.appendChild(card);
      });
   },

   // Details section
   selectItem(itemName) {
      this.currentSelection = itemName;
      this.showDetailsSection();
   },

   showDetailsSection() {
      const title = document.getElementById('details-title');
      const info = document.getElementById('details-info');
      const relationships = document.getElementById('relationships-table');

      title.textContent = this.currentSelection;

      if (this.currentFilter === 'continent') {
         this.renderContinentDetails(info, relationships);
      } else if (this.currentFilter === 'race') {
         this.renderRaceDetails(info, relationships);
      } else if (this.currentFilter === 'class') {
         this.renderClassDetails(info, relationships);
      }

      this.showSection('details-section');
   },

   renderContinentDetails(infoContainer, relationshipsContainer) {
      // Find continent data using full name
      const continent = this.continentData.find(c => c.continent === this.currentSelection);

      infoContainer.innerHTML = `
            <h3>About ${this.currentSelection}</h3>
            <p>${continent.description}</p>
            <img src="continent_images/${this.currentSelection.split(" ")[0]}.png" 
                 alt="${this.currentSelection}" 
                 style="width: 100%; max-width: 300px; border-radius: 8px; margin-top: 1rem; border: 2px solid var(--mountain-brown);"
                 onerror="this.style.display='none'">
        `;

      // Find races and classes associated with this continent
      const raceRelations = new Map();
      const classRelations = new Map();

      this.relationData.forEach(classData => {
         classData.subclasses.forEach(subclass => {
            // Check prominent continents - compare with full name or short name
            const prominentContinent = subclass.prominent_continents?.find(pc =>
               pc.continent === this.currentSelection ||
               pc.continent.split(" ")[0] === this.currentSelection.split(" ")[0]
            );
            if (prominentContinent) {
               if (!classRelations.has(classData.class)) {
                  classRelations.set(classData.class, []);
               }
               classRelations.get(classData.class).push({
                  subclass: subclass.subclass,
                  reason: prominentContinent.reason
               });
            }

            // Check races in this continent - compare with full name or short name
            subclass.races.forEach(race => {
               if (race.continent === this.currentSelection ||
                  race.continent.split(" ")[0] === this.currentSelection.split(" ")[0]) {
                  if (!raceRelations.has(race.name)) {
                     raceRelations.set(race.name, []);
                  }
                  raceRelations.get(race.name).push({
                     class: classData.class,
                     subclass: subclass.subclass,
                     reason: race.continent_reason,
                     subclassReason: race.subclass_reason
                  });
               }
            });
         });
      });

      relationshipsContainer.innerHTML = `
            <h3>Races & Classes in ${this.currentSelection}</h3>
            <details>
                <summary>Common Races (${raceRelations.size})</summary>
                <div class="details-content-inner">
                    ${Array.from(raceRelations.entries()).map(([race, relations]) => `
                        <details>
                            <summary class="relationship-item emphasized">
                                <div class="relationship-header">
                                    <span class="relationship-name">${race}</span>
                                    <small>(${relations.length} specialization${relations.length > 1 ? 's' : ''})</small>
                                </div>
                            </summary>
                            <div class="details-content-inner">
                                <div class="relationship-reason">
                                    <strong>Found in ${this.currentSelection} because:</strong> ${relations[0].reason}<br><br>
                                    <strong>Class Specializations:</strong><br>
                                    ${relations.map(rel => `
                                        <div class="relationship-item emphasized">
                                            <strong>${rel.class} (${rel.subclass})</strong>: ${rel.subclassReason}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
            <details>
                <summary>Prominent Classes (${classRelations.size})</summary>
                <div class="details-content-inner">
                    ${Array.from(classRelations.entries()).map(([className, subclasses]) => `
                        <details>
                            <summary class="relationship-item">
                                <div class="relationship-header">
                                    <span class="relationship-name">${className}</span>
                                    <small>(${subclasses.length} subclass${subclasses.length > 1 ? 'es' : ''})</small>
                                </div>
                            </summary>
                            <div class="details-content-inner">
                                <div class="relationship-reason">
                                    ${subclasses.map(sc => `
                                        <div class="relationship-item emphasized">
                                            <strong>${sc.subclass}:</strong> ${sc.reason}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
        `;
   },

   renderRaceDetails(infoContainer, relationshipsContainer) {
      infoContainer.innerHTML = `
            <h3>About ${this.currentSelection}</h3>
            <p>The ${this.currentSelection} race has adapted to various continents across Alabastria, developing unique relationships with different classes and specializations.</p>
        `;

      // Find class and continent relationships for this race
      const classRelations = new Map();
      const continentRelations = new Map();

      this.relationData.forEach(classData => {
         classData.subclasses.forEach(subclass => {
            const raceData = subclass.races.find(r => r.name === this.currentSelection);
            if (raceData) {
               if (!classRelations.has(classData.class)) {
                  classRelations.set(classData.class, []);
               }
               classRelations.get(classData.class).push({
                  subclass: subclass.subclass,
                  reason: raceData.subclass_reason,
                  continent: raceData.continent,
                  continentReason: raceData.continent_reason
               });

               if (!continentRelations.has(raceData.continent)) {
                  continentRelations.set(raceData.continent, []);
               }
               continentRelations.get(raceData.continent).push({
                  class: classData.class,
                  subclass: subclass.subclass,
                  reason: raceData.continent_reason
               });
            }
         });
      });

      relationshipsContainer.innerHTML = `
            <h3>${this.currentSelection} Relationships</h3>
            <details>
                <summary>Suitable Classes (${classRelations.size})</summary>
                <div class="details-content-inner">
                    ${Array.from(classRelations.entries()).map(([className, subclasses]) => `
                        <details>
                            <summary class="relationship-item">
                                <div class="relationship-header">
                                    <span class="relationship-name">${className}</span>
                                    <small>(${subclasses.length} subclass${subclasses.length > 1 ? 'es' : ''})</small>
                                </div>
                            </summary>
                            <div class="details-content-inner">
                                <div class="relationship-reason">
                                    ${subclasses.map(sc => `
                                        <div class="relationship-item">
                                            <strong>${sc.subclass}:</strong> ${sc.reason} <em>(in ${sc.continent})</em>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
            <details>
                <summary>Found in Continents (${continentRelations.size})</summary>
                <div class="details-content-inner">
                    ${Array.from(continentRelations.entries()).map(([continent, classes]) => `
                        <details>
                            <summary class="relationship-item">
                                <div class="relationship-header">
                                    <span class="relationship-name">${continent}</span>
                                    <small>(${classes.length} specialization${classes.length > 1 ? 's' : ''})</small>
                                </div>
                            </summary>
                            <div class="details-content-inner">
                                <div class="relationship-reason">
                                    <strong>Why they're here:</strong> ${classes[0].reason}<br><br>
                                    <strong>Specializations:</strong><br>
                                    ${classes.map(c => `
                                        <div class="relationship-item">
                                            ${c.class} (${c.subclass})
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
        `;
   },

   renderClassDetails(infoContainer, relationshipsContainer) {
      const classData = this.relationData.find(c => c.class === this.currentSelection);

      infoContainer.innerHTML = `
            <h3>About ${this.currentSelection}</h3>
            <p>${classData.suitability_reason}</p>
        `;

      // Organize subclasses and their relationships
      relationshipsContainer.innerHTML = `
            <h3>${this.currentSelection} Subclasses & Relationships</h3>
            <details>
                <summary>Subclasses (${classData.subclasses.length})</summary>
                <div class="details-content-inner">
                    ${classData.subclasses.map(subclass => `
                        <details>
                            <summary class="subclass-section">
                                <h4>${subclass.subclass}</h4>
                            </summary>
                            <div class="details-content-inner">
                                <details>
                                    <summary>Suitable Races (${subclass.races.length})</summary>
                                    <div class="details-content-inner">
                                        ${subclass.races.map(race => `
                                            <details>
                                                <summary class="relationship-item">
                                                    <div class="relationship-header">
                                                        <span class="relationship-name">${race.name}</span>
                                                        <small>(${race.continent})</small>
                                                    </div>
                                                </summary>
                                                <div class="details-content-inner">
                                                    <div class="relationship-reason">
                                                        <strong>Why suitable:</strong> ${race.subclass_reason}<br>
                                                        <strong>Continental context:</strong> ${race.continent_reason}
                                                    </div>
                                                </div>
                                            </details>
                                        `).join('')}
                                    </div>
                                </details>
                                ${subclass.prominent_continents ? `
                                    <details>
                                        <summary>Prominent Continents (${subclass.prominent_continents.length})</summary>
                                        <div class="details-content-inner">
                                            ${subclass.prominent_continents.map(continent => `
                                                <details>
                                                    <summary class="relationship-item emphasized">
                                                        <div class="relationship-header">
                                                            <span class="relationship-name">${continent.continent}</span>
                                                        </div>
                                                    </summary>
                                                    <div class="details-content-inner">
                                                        <div class="relationship-reason">
                                                            ${continent.reason}
                                                        </div>
                                                    </div>
                                                </details>
                                            `).join('')}
                                        </div>
                                    </details>
                                ` : ''}
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
        `;
   }
};
