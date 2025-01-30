// Quantum States
const BASES = {
    RECTILINEAR: 'rectilinear',
    DIAGONAL: 'diagonal'
};

const STATES = {
    [BASES.RECTILINEAR]: ['0', '1'],
    [BASES.DIAGONAL]: ['+', '-']
};

// DOM Elements
const plaintextInput = document.getElementById('plaintext');
const encodeButton = document.getElementById('encode-btn');
const encryptedOutput = document.getElementById('encrypted-output');
const keyOutput = document.getElementById('key-output');
const quantumStates = document.getElementById('quantum-states');
const basisChoice = document.getElementById('basis-choice');
const measurement = document.getElementById('measurement');

const encryptedInput = document.getElementById('encrypted-input');
const keyInput = document.getElementById('key-input');
const decodeButton = document.getElementById('decode-btn');
const decryptedOutput = document.getElementById('decrypted-output');
const decodingProcess = document.getElementById('decoding-process');

// Helper Functions
function getRandomBasis() {
    return Math.random() < 0.5 ? BASES.RECTILINEAR : BASES.DIAGONAL;
}

function getRandomState(basis) {
    const states = STATES[basis];
    return states[Math.floor(Math.random() * states.length)];
}

function measureState(state, measurementBasis, preparationBasis) {
    if (measurementBasis === preparationBasis) {
        return state;
    }
    return getRandomState(measurementBasis);
}

function stringToBinary(str) {
    return str.split('').map(char => 
        char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
}

function binaryToString(binary) {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map(byte => 
        String.fromCharCode(parseInt(byte, 2))
    ).join('');
}

// Visualization Functions
function visualizeQuantumStates(qubits, bases) {
    const html = qubits.map((qubit, i) => `
        <div class="qubit">
            <div>Qubit ${i}: ${qubit}</div>
            <div>Basis: ${bases[i]}</div>
        </div>
    `).join('');
    quantumStates.innerHTML = html;
}

function visualizeBasisChoice(aliceBases, bobBases) {
    const html = aliceBases.map((basis, i) => `
        <div class="basis-comparison">
            <div>Position ${i}:</div>
            <div>Alice's Basis: ${basis}</div>
            <div>Bob's Basis: ${bobBases[i]}</div>
            <div>Match: ${basis === bobBases[i] ? '✓' : '✗'}</div>
        </div>
    `).join('');
    basisChoice.innerHTML = html;
}

function visualizeMeasurement(measurements, key) {
    const html = measurements.map((m, i) => `
        <div class="measurement">
            <div>Position ${i}: ${m}</div>
            <div>Key Bit: ${key.includes(i) ? m : 'discarded'}</div>
        </div>
    `).join('');
    measurement.innerHTML = html;
}

// Encoding Process
encodeButton.addEventListener('click', () => {
    const message = plaintextInput.value;
    if (!message) return;

    // Convert message to binary
    const binaryMessage = stringToBinary(message);

    // Generate quantum states
    const aliceQubits = [];
    const aliceBases = [];
    
    for (let bit of binaryMessage) {
        const basis = getRandomBasis();
        const state = bit === '0' ? STATES[basis][0] : STATES[basis][1];
        aliceQubits.push(state);
        aliceBases.push(basis);
    }

    // Bob's measurement
    const bobBases = aliceQubits.map(() => getRandomBasis());
    const bobMeasurements = aliceQubits.map((qubit, i) => 
        measureState(qubit, bobBases[i], aliceBases[i])
    );

    // Key sifting
    const matchingPositions = aliceBases.map((basis, i) => 
        basis === bobBases[i] ? i : null
    ).filter(pos => pos !== null);

    const key = matchingPositions.map(pos => 
        bobMeasurements[pos] === STATES[aliceBases[pos]][0] ? '0' : '1'
    ).join('');

    // Encrypt message using key
    const keyRepeated = key.repeat(Math.ceil(binaryMessage.length / key.length))
        .slice(0, binaryMessage.length);
    
    const encryptedBinary = binaryMessage.split('').map((bit, i) => 
        bit ^ keyRepeated[i]
    ).join('');

    // Update UI
    visualizeQuantumStates(aliceQubits, aliceBases);
    visualizeBasisChoice(aliceBases, bobBases);
    visualizeMeasurement(bobMeasurements, matchingPositions);

    encryptedOutput.textContent = encryptedBinary;
    keyOutput.textContent = key;
});

// Decoding Process
decodeButton.addEventListener('click', () => {
    const encryptedBinary = encryptedInput.value;
    const key = keyInput.value;

    if (!encryptedBinary || !key) return;

    // Repeat key to match encrypted message length
    const keyRepeated = key.repeat(Math.ceil(encryptedBinary.length / key.length))
        .slice(0, encryptedBinary.length);

    // Decrypt message
    const decryptedBinary = encryptedBinary.split('').map((bit, i) => 
        bit ^ keyRepeated[i]
    ).join('');

    // Convert binary back to text
    const decryptedMessage = binaryToString(decryptedBinary);

    // Visualize decoding process
    decodingProcess.innerHTML = `
        <div class="decoding-step">
            <div>Encrypted Binary: ${encryptedBinary}</div>
            <div>Key: ${keyRepeated}</div>
            <div>Decrypted Binary: ${decryptedBinary}</div>
        </div>
    `;

    decryptedOutput.textContent = decryptedMessage;
});
