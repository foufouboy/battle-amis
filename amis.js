
let guerriers = [];
let turnsData = [];
let nbCombats = 500;

let nbBarbares = 73;
let nbSorciers = 14;
let nbNoirs = 10;
let nbPaladins = 3;

const simulationBtn = document.querySelector("button");
const barbaresInp = document.querySelector("#barbare");
const sorciersInp = document.querySelector("#sorcier");
const noirsInp = document.querySelector("#sorcier-noir");
const paladinInp = document.querySelector("#paladin");
const iterationSlt = document.querySelector("select");
const table = document.querySelector("tbody");

barbaresInp.addEventListener("input", _ => {
    if (validInput(barbaresInp.value)) nbBarbares = +barbaresInp.value;
});

sorciersInp.addEventListener("input", _ => {
    if (validInput(sorciersInp.value)) nbSorciers = +sorciersInp.value;
});

noirsInp.addEventListener("input", _ => {
    if (validInput(noirsInp.value)) nbNoirs = +noirsInp.value;
});

paladinInp.addEventListener("input", _ => {
    if (validInput(paladinInp.value)) nbPaladins = +paladinInp.value;
});

simulationBtn.addEventListener("click", newSimulation);
iterationSlt.addEventListener("input", _ => {
    showIteration(iterationSlt.value);
})

function validInput(input) {
    input = +input;
    return (0 <= input && input <= 1000) && Number.isInteger(input)
}

function shuffle(a) {
    return a
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

function combat(a, b) {
    let niveauA = a.niveau;
    let niveauB = b.niveau;
    const tirage = ~(Math.random() * 100);

    // on commence par tester les classes
    if (a.classe === b.faiblesse) {
        niveauA *= 10;
    } else if (b.classe === a.faiblesse) {
        niveauB *= 10;
    }

    // Puis, si les niveaux ne sont pas équivalents, on procède au calcul 
    // du pourcentage de victoire
    if (niveauA !== niveauB) {
        const strongest = null;
        const weakest = null;
        
        if (niveauA > niveauB) {
            strongest = a;
            weakest = b;
        } else {
            strongest = b;
            weakest = a;
        }
        
        percentage = ((strongest.niveau * 10) / weakest.niveau) * 50;
        
        // Si on est dans la première moitié du pourcentage,
        // alors le plus fort à gagné
        // (ce qui fait que si le plus fort a 200% de chances de gagner, il ne perd jamais
        // car le tirage va de 1 à 100)
        if (tirage < percentage) {
            strongest.niveau += weakest.niveau;
            weakest.niveau = 1;
        } else {
            weakest.niveau += strongest.niveau;
            strongest.niveau += 1;
        }
    // Sinon on procède simplement à un pile ou face...
    } else {
        if (tirage < 50) {
            a.niveau += b.niveau;
            b.niveau = 1;
        } else {
            b.niveau += a.niveau;
            a.niveau = 1;
        }
    }
    //...et celui qui perd donne ses niveaux à l'autre
}

function addData() {
    turnsData.push(JSON.parse(JSON.stringify(guerriers)));   
}

function makeTurnAnd(func = () => {}) {
    guerriers = shuffle(guerriers); 

    for (let i = 1; i < guerriers.length; i += 2) {
        combat(guerriers[i], guerriers[i - 1]);
    }

    func();
}

function newSimulation() {
    guerriers = [];
    turnsData = [];
    
    for (let barbares = nbBarbares; barbares; barbares--) guerriers.push(new Barbare()); 
    for (let sorciers = nbSorciers; sorciers; sorciers--) guerriers.push(new Sorcier()); 
    for (let sorciersNoirs = nbNoirs; sorciersNoirs; sorciersNoirs--) guerriers.push(new SorcierNoir()); 
    for (let paladins = nbPaladins; paladins; paladins--) guerriers.push(new Paladin()); 

    for (let i = 0; i < nbCombats; i++) {
        makeTurnAnd(addData);
    }

    showIteration(nbCombats);
}

function showIteration(n) {
    // à diviser si continuation
    table.innerHTML = "";
    const turnWarriors = turnsData[n - 1];
    console.log(turnWarriors);
    
    // affichage du ratio de niveaux
    const levelsData = turnWarriors.reduce((a, e) => {
        if (e.niveau > 1) {
            a[e.classe] ? a[e.classe]++ : a[e.classe] = 1;
        }
        return a;
    }, {});
    console.log(levelsData);

    document.querySelector(".barbare-truc span")
        .textContent = levelsData.Barbare;
    document.querySelector(".sorcier-truc span")
        .textContent = levelsData.Sorcier;
    document.querySelector(".noirs-truc span")
        .textContent = levelsData.SorcierNoir;
    document.querySelector(".paladin-truc span")
        .textContent = levelsData.Paladin;
    
    // affichage de tous les niveaux
    for (let i = 0; i < turnWarriors.length; i++) {
        const newRow = document.createElement("tr");
        const barCell = document.createElement("td");
        const sorCell = document.createElement("td");
        const noirCell = document.createElement("td");
        const palCell = document.createElement("td");
        const currentWarrior = turnWarriors[i];

        newRow.classList.add(i + 1);
        newRow.classList.add("unactive");
        barCell.classList.add("BarbareCell");
        sorCell.classList.add("SorcierCell");
        noirCell.classList.add("SorcierNoirCell");
        palCell.classList.add("PaladinCell");

        newRow.appendChild(barCell);
        newRow.appendChild(sorCell);
        newRow.appendChild(noirCell);
        newRow.appendChild(palCell);

        table.appendChild(newRow);

        const classCells = document.querySelectorAll(`.${currentWarrior.classe}Cell`);

        for (let cell of classCells) {
            if (cell.textContent === "") {
                cell.textContent = currentWarrior.niveau;
                cell.parentNode.classList.remove("unactive");
                break;
            }
        }
    }

    Array.from(document.querySelectorAll("tr.unactive")).forEach(e => {e.remove()});
}

class Barbare {
    constructor() {
        this.classe = "Barbare";
        this.faiblesse = "Sorcier";
        this.niveau = 1;
    }
}

class Sorcier {
    constructor() {
        this.classe = "Sorcier";
        this.faiblesse = "SorcierNoir";
        this.niveau = 1;
    }
}

class SorcierNoir {
    constructor() {
        this.classe = "SorcierNoir";
        this.faiblesse = "Paladin";
        this.niveau = 1;
    }
}

class Paladin {
    constructor() {
        this.classe = "Paladin";
        this.faiblesse = "Barbare";
        this.niveau = 1;
    }
}

newSimulation();
