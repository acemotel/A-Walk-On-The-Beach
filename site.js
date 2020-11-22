const cPent = ['C', 'D', 'E', 'G', 'A'];
const modScale = ['E2', 'F2', 'A2']; // This excludes C as it will always be played

const feedbackDelay = new Tone.FeedbackDelay("4tn", 0.2).toDestination();
const reverb = new Tone.Reverb(4).toDestination();
// create a new synth and route the output to master
const synth = new Tone.Synth({
    "volume": -44,
    "detune": 0,
    "portamento": 0.05,
    "envelope": {
        "attack": 2.05,
        "attackCurve": "linear",
        "decay": 0.2,
        "decayCurve": "exponential",
        "release": 1.5,
        "releaseCurve": "exponential",
        "sustain": 0.2
    },
    "oscillator": {
        "partialCount": 0,
        "partials": [],
        "phase": 0,
        "type": "amtriangle",
        "harmonicity": 1,
        "modulationType": "sine"
    }
}).connect(reverb);
const sampler = new Tone.Sampler({
    urls: {
        C3: "C3.wav",
        C4: "C4.wav",
        C5: "C5.wav",
        G3: "G3.wav",
        G4: "G4.wav",
        G5: "G5.wav",
    },
    baseUrl: "samples/"
}).connect(feedbackDelay);
const texture = new Tone.Sampler({
    urls: {
        C3: "1.wav",
        C4: "2.wav",
        C5: "3.wav",
        C6: "4.wav",
        C7: "vinyl_crackle.wav"
    },
    baseUrl: "samples/textures/"
}).connect(feedbackDelay);
const modorgan = new Tone.Sampler({
    urls: {
        C2: "C2.wav",
        E2: "E2.wav",
        F2: "F2.wav",
        A2: "A2.wav",
    },
    baseUrl: "samples/modorgan/",
    attack: 2,
    release: 3,
    curve: "linear"
}).toDestination();

texture.volume.value = -35;
let c = 0;
let prevModNote = "";
const loop = new Tone.Loop(function (time) {
    let note = randomNoteC(3, 5);
    let delay = Math.random() / 2;
    if (randomIntFromInterval(0, 3) === 0) {
        sampler.triggerAttackRelease(note, "1m", time + delay, Math.random() * 0.7);
        synth.triggerAttackRelease(note, "4n", time + delay);
        texture.triggerAttackRelease(randomNoteC(2, 6), "1m", time + delay);
    }
    if (c % 4 === 0 && randomIntFromInterval(0, 1) === 0) {
        let bassNoteIndex = randomIntFromInterval(0, 4);
        // Play the bass note and a note 3 up from it (5th chords eg A5)
        sampler.triggerAttackRelease(`${cPent[bassNoteIndex]}2`, "2m", time + delay, Math.random());
        sampler.triggerAttackRelease(`${cPent[(bassNoteIndex + 3) % 5]}2`, "2m", time + delay, Math.random());
        texture.triggerAttackRelease(randomNoteC(0, 3), "1m", time + delay);

        if (randomIntFromInterval(0, 2) === 0) {
            // Play modular organ (LABS) sample if current note is different from random + C
            // Release current notes being played if so
            let modNote = modScale[randomIntFromInterval(0, modScale.length - 1)];
            if (prevModNote === "" || modNote !== prevModNote) {
                modorgan.releaseAll();
                modorgan.triggerAttack("C2");
                modorgan.triggerAttack(modNote);
                prevModNote = modNote;
            }

        }

        // At rare, random times play the vinyl crackle
        if (randomIntFromInterval(0, 9) === 0) {
            texture.triggerAttackRelease("C7", 5);
        }
    }

    c++;
}, "4n").start(0);

Tone.Transport.bpm.value = 80;
Tone.Master.volume.value = 15;

play = () => {
    if (Tone.context.state !== 'running') {
        Tone.context.resume();
    }
    // Start the transport which is the main timeline
    Tone.Transport.start();

    // Hide play btn, show stop btn
    document.getElementById("play").style.display = "none";
    document.getElementById("stop").style.display = "block";
    document.body.style.backgroundColor = "#000000";

}

stop = () => {
    Tone.Transport.stop();

    // Hide stop btn, show play btn
    document.getElementById("play").style.display = "block";
    document.getElementById("stop").style.display = "none";
    document.body.style.backgroundColor = "#f5f5f5";

}

randomNoteC = (x, y) => {
    let note = cPent[randomIntFromInterval(0, cPent.length - 1)];
    let oct = randomIntFromInterval(x, y);
    return note + oct;
}

randomIntFromInterval = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// These are for desktop users
mouseOver = () => {
    document.body.style.backgroundColor = "#000000";
}

mouseOut = () => {
    document.body.style.backgroundColor = "#f5f5f5";
}

