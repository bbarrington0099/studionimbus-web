// Check if there is a saved state in local storage
if (localStorage.getItem("primeCheckerPageState")) {
  // If there is a saved state, retrieve it and set it as the page content
  const savedState = localStorage.getItem("primeCheckerPageState");
  document.body.innerHTML = savedState;
}

// Save the current page state to local storage on page unload
window.addEventListener("beforeunload", function() {
  const pageState = document.body.innerHTML;
  localStorage.setItem("primeCheckerPageState", pageState);
});

let listArea = document.getElementById('listArea');
listArea.style.display = 'none';

let track = 'start';

const isPrime = (num) => {
  if (num < 2 || (num > 2 && num % 2 === 0)) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const checkNumber = () => {
  let input = document.getElementById('toCheck').value;
  let answerLocation = document.getElementById('answer');
  let amountLocation = document.getElementById('answer2');
  if (input > 1000000000) {
    let highAnswer = isPrime(input);
    answerLocation.innerHTML = highAnswer;
    amountLocation.innerHTML = `Error: Please Choose a Value of 1,000,000,000 or Less to do More than Answer True or False`;
    amountLocation.style.color = 'orange';
    highAnswer === true ? (answerLocation.style.color = 'green') : (answerLocation.style.color = 'red');
    document.getElementById('range').value = '';
    return;
  };
  if (input === '') {
    answerLocation.innerHTML = 'Error: No Input';
    answerLocation.style.color = 'orange';
    return;
  };
  if (isNaN(input)) {
    answerLocation.innerHTML = `Error: ${input} is Not a Number`;
    answerLocation.style.color = 'orange';
    return;
  };
  let answer = isPrime(input);
  answerLocation.innerHTML = answer; 
  answer === true ? (answerLocation.style.color = 'green') : (answerLocation.style.color = 'red');
  track = 'checked';
};

const giveAmount = () => {
  let answer1 = document.getElementById('answer').value;
  let initialInput = Number(document.getElementById('toCheck').value);
  let startInput = document.getElementById('range').value;
  let answerLocation = document.getElementById('answer2');
    if (((initialInput - startInput) >= 1500000) && ((initialInput - startInput) < 2000000)) {
    document.getElementById('warn').innerHTML = `Warning: Range of ${initialInput - startInput} May Take Time or Crash <br> Recommend Adjusting Range`;
  } else if ((initialInput - startInput) >= 2000000) {
    document.getElementById('warn').innerHTML = `Warning: Range of ${initialInput - startInput} May Crash <br> Adjusting Range To Within 1,500,000`;
    document.getElementById('range').value = (initialInput - 1500000);
    startInput = (initialInput - 1500000);
  } else {
     document.getElementById('warn').innerHTML = '';
  };
  if (startInput !== '' && (isNaN(startInput) || startInput > initialInput)) {
    answerLocation.innerHTML = `Error: Input a Starting Range that is a Number Lower Than ${initialInput}`;
    answerLocation.style.color = 'orange';
    return;
  };
  let start = 2;
  start = startInput;
  let count = 0;
  for (let i = start; i <= initialInput; i++) {
    if (isPrime(i)) {
      count ++;
    };
  };
  answerLocation.style.color = 'darkblue';
  answerLocation.innerHTML = `${count}`;
  track = 'counted';
};

//a function to give us a list of primes in the range
const giveList = () => {
  let initialInput = Number(document.getElementById('toCheck').value);
  let startInput = document.getElementById('range').value;
  let answerLocation = document.getElementById('answer3');
  let start = 2;
  start = startInput;
  let list = [];
  for (let i = start; i <= initialInput; i++) {
    if (isPrime(i)) {
      list.push(i);
    };
  };
  let cleanList = list.map(n => `<span class="primeList"> ${n}</span>`);
  answerLocation.innerHTML = `${cleanList}`;
  //now lets have the next prime number given if the initial input was not Prime
  list.reverse();
  let next = list[0] + 1;
  if (!isPrime(initialInput)) {
    if (list.length === 0) {
      let nextNone = 0;
      for (let i = initialInput; !isPrime(i); i++) {
        nextNone = i;
      };
      nextNone += 1;
      let cleanNone = nextNone;
      answerLocation.innerHTML = `There are No Primes in this Range <hr><p class="next">The Next Prime is: <span id="nextNumber">${cleanNone}</span></p>`;
      return;
    };
    for (let i = next; !isPrime(i); i++) {
      next = i;
    };
    next += 1;
    let cleanNext = next;
    answerLocation.innerHTML = `${cleanList} <hr><p class="next">Given Number Not Prime, Next Prime is: <span id="nextNumber">${cleanNext}</span></p>`;
  };
}; 

//the function for our button to perform the other functions when clicked
const button = () => {
  listArea.style.display = 'none';
  let answer2 = document.getElementById('answer2');
  track = 'start';
  checkNumber();
  if (track === 'checked') { 
    giveAmount();
  } else if (answer2.innerHTML === `Error: Please Choose a Value of 1,000,000,000 or Less to do More than Answer True or False`) {
    return;
  } else {
    document.getElementById('answer2').innerHTML = '';
    document.getElementById('range').value = '';
  };
  if (track === 'counted') {
    giveList();
    listArea.style.display = 'block'
  };
};

/*
TO-DO:
  optimize the code (OOP)
  fix browser saving to save all fields
  document better
*/