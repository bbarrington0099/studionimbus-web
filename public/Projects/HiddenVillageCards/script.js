const panels = document.querySelectorAll('.panel');

function removeActiveClasses() {
    panels.forEach(panel => {
        panel.classList.remove('active')
    })
}

function removeHiddenClasses() {
    panels.forEach(panel => {
        panel.classList.remove('hidden')
    })
}

function changeBand() {
    let buttonState = document.getElementById("bandChange");
    let ASFBand = document.getElementById("AlliedShinobiForces");
    let LeBand = document.getElementById("Leaf");
    let SoBand = document.getElementById("Sound");
    let GrBand = document.getElementById("Grass");
    let StBand = document.getElementById("Stone");
    let ClBand = document.getElementById("Cloud");
    let SaBand = document.getElementById("Sand");
    let MiBand = document.getElementById("Mist");
    let RaBand = document.getElementById("Rain");
    let WaBand = document.getElementById("Waterfall");

    let starterTitle = document.getElementById("starterTitle");
    let starterBody = document.getElementById("starterBody");

    if (buttonState.innerHTML === "Go Rogue") {
        buttonState.innerHTML = "Protect The Village";
        starterTitle.innerHTML = "Akatsuki";
        starterBody.innerHTML = "Akatsuki (<a href='https://naruto.fandom.com/wiki/Akatsuki' target='_blank'>暁</a>, literally meaning: 'Dawn' or 'Daybreak') was a group of shinobi that existed outside the usual system of hidden villages. Over the course of several decades, Akatsuki took different forms and was led by different individuals. Though each iteration is viewed as either subversives or criminals, all seek to make the world a better place through their own means. Each Akatsuki tended to have multiple lairs across the world, inaccessible either due to their remoteness or the various security measures that protected them."
        ASFBand.style.backgroundImage = "url('img/alliedShinobiForcesR.png')";
        LeBand.style.backgroundImage = "url('img/leafR.png')";
        SoBand.style.backgroundImage = "url('img/soundR.png')";
        GrBand.style.backgroundImage = "url('img/grassR.png')";
        StBand.style.backgroundImage = "url('img/stoneR.png')";
        ClBand.style.backgroundImage = "url('img/cloudR.png')";
        SaBand.style.backgroundImage = "url('img/sandR.png')";
        MiBand.style.backgroundImage = "url('img/mistR.png')";
        RaBand.style.backgroundImage = "url('img/rainR.png')";
        WaBand.style.backgroundImage = "url('img/waterfallR.png')";
    } else if (buttonState.innerHTML === "Protect The Village") {
        buttonState.innerHTML = "Go Rogue";
        starterTitle.innerHTML = "Allied Shinobi Forces";
        starterBody.innerHTML = "The Allied Shinobi Forces (<a href='https://naruto.fandom.com/wiki/Allied_Shinobi_Forces' target='_blank'>忍連合軍</a>, Shinobi Rengōgun) was a coalition between the collective military might of the shinobi nations of the Lands of Lightning, Water, Earth, Wind, and Fire, and the lone samurai nation of the Land of Iron."
        ASFBand.style.backgroundImage = "url('img/alliedShinobiForces.png')";
        LeBand.style.backgroundImage = "url('img/leaf.png')";
        SoBand.style.backgroundImage = "url('img/sound.png')";
        GrBand.style.backgroundImage = "url('img/grass.png')";
        StBand.style.backgroundImage = "url('img/stone.png')";
        ClBand.style.backgroundImage = "url('img/cloud.png')";
        SaBand.style.backgroundImage = "url('img/sand.png')";
        MiBand.style.backgroundImage = "url('img/mist.png')";
        RaBand.style.backgroundImage = "url('img/rain.png')";
        WaBand.style.backgroundImage = "url('img/waterfall.png')";
    }
}

panels.forEach((panel, index) => {
    let i = index;
    panel.addEventListener('click', () => {
        removeActiveClasses()
        removeHiddenClasses()
        panel.classList.add('active')
        
        if (i === 0) {
            panels.forEach((panel, index) => {
                if (index >= 4) {
                    panel.classList.add('hidden')
                }
            });
        } else if ((i < (panels.length - 3))) {
            panels.forEach((panel, index) => {
                if ((index < (i - 1)) || (index > (i + 3))) {
                    panel.classList.add('hidden')
                }
            });
        } else if (i === (panels.length - 3)) {
            panels.forEach((panel, index) => {
                if ((index < (i - 2))) {
                    panel.classList.add('hidden')
                }
            });
        } else if (i === (panels.length - 2)) {
            panels.forEach((panel, index) => {
                if ((index < (i - 3))) {
                    panel.classList.add('hidden')
                }
            });
        } else if (i === (panels.length - 1)) {
            panels.forEach((panel, index) => {
                if ((index < (i - 4))) {
                    panel.classList.add('hidden')
                }
            });
        }
    })
});

/*
TO-DO: 
    document the code
    add save state to browser cache of if rouge or hero and which village is selected
*/
