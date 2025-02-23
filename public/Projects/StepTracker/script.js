let stepContainer = document.getElementById('stepContainer');
let steps = document.getElementsByClassName('step');
let bars = document.getElementsByClassName('bar');
let prevBtn = document.getElementById('prev');
let nextBtn = document.getElementById('next');
let reached = 0;
let traveled = 0;

let availableButtons = () => {
    if (reached > 0 && reached < (steps.length - 1)) {    
        prevBtn.classList.remove('unavailable');
        nextBtn.classList.remove('unavailable');
    } else if (reached === (steps.length - 1)) {
        nextBtn.classList.add('unavailable');
    } else if (reached === 0) {
        prevBtn.classList.add('unavailable');
    }
}

let nextButton = () => {
    if ((reached) < (steps.length - 1)) {
        reached++;
        bars[traveled].classList.add('traveled');
        steps[reached].classList.add('reached', 'transitioningStep');
        traveled++;
    }

    availableButtons();
}

let prevButton = () => {
    if (reached > 0) {
        steps[reached].classList.remove('reached', 'transitioningStep');
        traveled--;
        reached--;
        bars[traveled].classList.remove('traveled');
    }

    availableButtons();
}

let addSteps = (amount) => {
    for (let i = 0; i < amount; i++) {
        stepContainer.innerHTML += `
            <div class="bar"></div>
            <div class="step">${steps.length + 1}</div>
        `;
    }
}

/*
TO-DO:
    document the code
    add option to change step amount
    add area to change each step text or image?
*/