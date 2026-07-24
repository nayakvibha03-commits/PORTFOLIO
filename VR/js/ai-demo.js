/*=========================================================
    LIVE AI / ML PROJECT DEMOS

    Each demo first tries to call the real trained-model backend
    (see /backend in the project root — a Flask API with actual
    scikit-learn models). If that API isn't running (e.g. the site
    is opened as a static page with no backend started, or it
    hasn't been deployed anywhere yet), it automatically falls back
    to an equivalent in-browser simulation so the demo still works
    for visitors.

    To go live: run the backend (see backend/README.md), then set
    API_BASE below to wherever it's hosted.
=========================================================*/

const API_BASE = "http://localhost:5000";
const API_TIMEOUT_MS = 2500;

async function callApi(path, payload){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try{
        const res = await fetch(API_BASE + path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeout);
        if(!res.ok) return null;
        return await res.json();
    }catch(err){
        clearTimeout(timeout);
        return null; // backend not reachable — caller falls back to simulation
    }
}

function sourceTag(usedBackend){
    return usedBackend ? "Live model (backend)" : "Simulated (backend offline)";
}

/*----------------- CAR PRICE PREDICTION -----------------*/

async function runCarPriceDemo(){

    const company = document.getElementById("cpCompany").value;
    const fuel = document.getElementById("cpFuel").value;
    const year = parseInt(document.getElementById("cpYear").value);
    const kms = parseFloat(document.getElementById("cpKms").value);

    const resultBox = document.getElementById("cpResult");
    const verdict = document.getElementById("cpVerdict");
    const sub = document.getElementById("cpSub");

    if(!year || !kms || kms < 0 || year < 1995 || year > 2026){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Please enter a valid year and kilometers driven.";
        sub.textContent = "";
        return;
    }

    resultBox.classList.add("show");
    verdict.className = "verdict status-warn";
    verdict.textContent = "Predicting...";
    sub.textContent = "";

    const apiResult = await callApi("/api/car-price", {
        company, fuel_type: fuel, year, kms_driven: kms
    });

    let price, usedBackend = false;
    if(apiResult && apiResult.predicted_price_lakh !== undefined){
        price = apiResult.predicted_price_lakh;
        usedBackend = true;
    } else {
        price = simulateCarPrice(company, fuel, year, kms);
    }

    const age = Math.max(2026 - year, 0);
    verdict.className = "verdict status-good";
    verdict.textContent = "Estimated Resale Price: ₹" + price.toFixed(2) + " Lakh";
    sub.textContent = "Based on a " + age + "-year-old " + company + " (" + fuel +
        ") with " + kms.toLocaleString() + " km driven. · " + sourceTag(usedBackend);
}

function simulateCarPrice(company, fuel, year, kms){
    const basePrice = {
        Maruti: 4.5, Hyundai: 5.5, Honda: 6.0,
        Toyota: 7.5, Mahindra: 8.0, Ford: 5.0, Tata: 4.8
    }[company];

    const age = Math.max(2026 - year, 0);
    const ageDepreciation = basePrice * 0.06 * age;
    const kmsDepreciation = (kms / 100000) * basePrice * 0.15;

    let fuelAdj = 0;
    if(fuel === "Diesel") fuelAdj = basePrice * 0.05;
    if(fuel === "CNG") fuelAdj = -basePrice * 0.03;
    if(fuel === "LPG") fuelAdj = -basePrice * 0.04;

    let price = basePrice - ageDepreciation - kmsDepreciation + fuelAdj;
    return Math.max(price, basePrice * 0.12);
}

/*----------------- VEHICLE PERFORMANCE ANALYSIS -----------------*/

async function runVehiclePerfDemo(){

    const cylinders = parseFloat(document.getElementById("vpCylinders").value);
    const origin = document.getElementById("vpOrigin").value;
    const displacement = parseFloat(document.getElementById("vpDisplacement").value);
    const horsepower = parseFloat(document.getElementById("vpHorsepower").value);
    const weight = parseFloat(document.getElementById("vpWeight").value);
    const accel = parseFloat(document.getElementById("vpAccel").value);

    const resultBox = document.getElementById("vpResult");
    const verdict = document.getElementById("vpVerdict");
    const sub = document.getElementById("vpSub");

    if(!displacement || !horsepower || !weight || !accel){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Please fill in all engine specifications.";
        sub.textContent = "";
        return;
    }

    resultBox.classList.add("show");
    verdict.className = "verdict status-warn";
    verdict.textContent = "Predicting...";
    sub.textContent = "";

    const apiResult = await callApi("/api/vehicle-performance", {
        cylinders, displacement, horsepower, weight, acceleration: accel, origin
    });

    let efficiency, usedBackend = false;
    if(apiResult && apiResult.predicted_km_per_l !== undefined){
        efficiency = apiResult.predicted_km_per_l;
        usedBackend = true;
    } else {
        efficiency = simulateVehiclePerf(cylinders, origin, displacement, horsepower, weight, accel);
    }

    verdict.className = "verdict status-good";
    verdict.textContent = "Predicted Fuel Efficiency: " + Number(efficiency).toFixed(1) + " km/l";
    sub.textContent = cylinders + "-cylinder, " + displacement + "cc engine, " +
        horsepower + " hp, " + weight + " kg (" + origin + "). · " + sourceTag(usedBackend);
}

function simulateVehiclePerf(cylinders, origin, displacement, horsepower, weight, accel){
    let originBonus = 0;
    if(origin === "Asia") originBonus = 2;
    if(origin === "Europe") originBonus = 1;

    let efficiency = 30
        - (displacement / 1000) * 2.2
        - (weight / 1000) * 3.4
        - (horsepower / 60)
        - (cylinders * 0.4)
        + (accel * 0.25)
        + originBonus;

    return Math.min(Math.max(efficiency, 4), 25);
}

/*----------------- TRISENSEMIND TEXT EMOTION -----------------*/

async function runTriSenseDemo(){

    const rawText = document.getElementById("tsText").value.trim();
    const text = rawText.toLowerCase();

    const resultBox = document.getElementById("tsResult");
    const verdict = document.getElementById("tsVerdict");
    const bar = document.getElementById("tsBar");
    const sub = document.getElementById("tsSub");

    if(!text){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Please type something first.";
        bar.style.width = "0%";
        sub.textContent = "";
        return;
    }

    resultBox.classList.add("show");
    verdict.className = "verdict status-warn";
    verdict.textContent = "Analyzing...";
    bar.style.width = "0%";
    sub.textContent = "";

    const apiResult = await callApi("/api/text-emotion", { text: rawText });

    let emotion, confidence, usedBackend = false;
    if(apiResult && apiResult.emotion){
        emotion = apiResult.emotion;
        confidence = apiResult.confidence;
        usedBackend = true;
    } else {
        const sim = simulateTriSense(text);
        emotion = sim.emotion;
        confidence = sim.confidence;
    }

    const statusClass = emotion === "Happy" ? "status-good" :
                         emotion === "Neutral" ? "status-warn" :
                         (emotion === "Sad" || emotion === "Fear") ? "status-warn" : "status-bad";

    verdict.className = "verdict " + statusClass;
    verdict.textContent = "Detected Emotion: " + emotion;
    bar.style.width = confidence.toFixed(0) + "%";
    sub.textContent = "Confidence: " + confidence.toFixed(0) + "% (text-analysis mode). · " + sourceTag(usedBackend);
}

function simulateTriSense(text){
    const emotions = {
        Happy: ["happy","excited","great","awesome","love","joy","glad","amazing","wonderful","fantastic","proud","thrilled"],
        Sad: ["sad","upset","depressed","down","cry","lonely","heartbroken","hurt","disappointed"],
        Angry: ["angry","furious","annoyed","mad","hate","irritated","frustrated","rage"],
        Fear: ["scared","afraid","nervous","anxious","worried","fear","panic","stressed"]
    };

    let scores = { Happy: 0, Sad: 0, Angry: 0, Fear: 0 };
    let totalHits = 0;

    Object.keys(emotions).forEach(emotion => {
        emotions[emotion].forEach(word => {
            if(text.includes(word)){
                scores[emotion]++;
                totalHits++;
            }
        });
    });

    if(totalHits === 0){
        return { emotion: "Neutral", confidence: 40 };
    }

    let topEmotion = Object.keys(scores).reduce((a,b) => scores[a] >= scores[b] ? a : b);
    let confidence = Math.min(60 + (scores[topEmotion] / totalHits) * 40, 97);

    return { emotion: topEmotion, confidence };
}

/*----------------- FAKE PRODUCT DETECTOR -----------------*/

function isValidBarcode(code){

    if(!/^\d+$/.test(code)) return false;

    let digits = code;
    if(digits.length === 12) digits = "0" + digits; // UPC-A -> EAN-13
    if(digits.length !== 13) return false;

    const nums = digits.split("").map(Number);
    const checkDigit = nums.pop();

    let sum = 0;
    nums.forEach((d, i) => {
        sum += (i % 2 === 0) ? d : d * 3;
    });

    const calculated = (10 - (sum % 10)) % 10;
    return calculated === checkDigit;
}

async function runFakeProductDemo(){

    const barcode = document.getElementById("fpBarcode").value.trim();
    const name = document.getElementById("fpName").value.trim();

    const resultBox = document.getElementById("fpResult");
    const verdict = document.getElementById("fpVerdict");
    const bar = document.getElementById("fpBar");
    const sub = document.getElementById("fpSub");

    if(!barcode){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Please enter a barcode number.";
        bar.style.width = "0%";
        sub.textContent = "";
        return;
    }

    resultBox.classList.add("show");
    verdict.className = "verdict status-warn";
    verdict.textContent = "Analyzing...";
    bar.style.width = "0%";
    sub.textContent = "";

    const apiResult = await callApi("/api/fake-product", { barcode, name });

    let score, statusClass, label, barcodeValid, hasRiskWord, usedBackend = false;

    if(apiResult && apiResult.authenticity_score !== undefined){
        score = apiResult.authenticity_score;
        barcodeValid = apiResult.barcode_valid;
        hasRiskWord = apiResult.has_risk_word;
        label = apiResult.verdict;
        usedBackend = true;
    } else {
        const sim = simulateFakeProduct(barcode, name);
        score = sim.score;
        barcodeValid = sim.barcodeValid;
        hasRiskWord = sim.hasRiskWord;
        label = sim.label;
    }

    if(score >= 65) statusClass = "status-good";
    else if(score >= 40) statusClass = "status-warn";
    else statusClass = "status-bad";

    bar.style.width = score + "%";
    verdict.className = "verdict " + statusClass;
    verdict.textContent = label + " (" + score + "% authenticity)";
    sub.textContent = "Barcode structure: " + (barcodeValid ? "Valid ✅ (checksum verified)" : "Invalid ❌ (checksum failed)") +
        (hasRiskWord ? " · Listing title contains risk keywords." : "") + " · " + sourceTag(usedBackend);
}

function simulateFakeProduct(barcode, name){
    const barcodeValid = isValidBarcode(barcode);
    const lowerName = name.toLowerCase();

    const riskWords = ["copy","replica","duplicate","first copy","fake","mirror","dupe","unbranded clone"];
    const hasRiskWord = riskWords.some(w => lowerName.includes(w));

    let score = barcodeValid ? 78 : 30;
    if(hasRiskWord) score -= 40;
    if(!name) score -= 5;
    score = Math.min(Math.max(score, 4), 96);

    let label;
    if(score >= 65) label = "Likely Genuine";
    else if(score >= 40) label = "Suspicious — Verify Further";
    else label = "Likely Fake";

    return { score, barcodeValid, hasRiskWord, label };
}

/*----------------- TRISENSEMIND — TEXT / FACE / VOICE MODE TABS -----------------*/

document.querySelectorAll(".ts-mode-tab").forEach(tab => {

    tab.addEventListener("click", () => {

        const mode = tab.dataset.tsMode;

        if(mode !== "face") stopFaceCamera();

        document.querySelectorAll(".ts-mode-tab").forEach(t => {
            t.classList.toggle("active", t === tab);
        });

        document.querySelectorAll(".ts-mode-panel").forEach(panel => {
            panel.classList.toggle("active", panel.id === "tsMode-" + mode);
        });

    });

});

/*----------------- TRISENSEMIND — FACE (webcam, simulated) -----------------*/

let faceStream = null;

function stopFaceCamera(){

    if(faceStream){
        faceStream.getTracks().forEach(track => track.stop());
        faceStream = null;
    }

    const video = document.getElementById("tsFaceVideo");
    const startBtn = document.getElementById("tsFaceStartBtn");
    const captureBtn = document.getElementById("tsFaceCaptureBtn");

    if(video) video.srcObject = null;
    if(startBtn){ startBtn.textContent = "Enable Camera"; startBtn.disabled = false; }
    if(captureBtn) captureBtn.disabled = true;
}

async function startFaceCamera(){

    const video = document.getElementById("tsFaceVideo");
    const startBtn = document.getElementById("tsFaceStartBtn");
    const captureBtn = document.getElementById("tsFaceCaptureBtn");
    const resultBox = document.getElementById("tsFaceResult");
    const verdict = document.getElementById("tsFaceVerdict");
    const sub = document.getElementById("tsFaceSub");

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Camera not supported in this browser.";
        sub.textContent = "";
        return;
    }

    try{
        faceStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = faceStream;
        startBtn.textContent = "Camera On";
        startBtn.disabled = true;
        captureBtn.disabled = false;
    }catch(err){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Camera access denied or unavailable.";
        sub.textContent = "Allow camera access in your browser settings and try again.";
    }
}

function regionStats(data, width, height, x0f, x1f, y0f, y1f){

    const x0 = Math.floor(x0f * width);
    const x1 = Math.floor(x1f * width);
    const y0 = Math.floor(y0f * height);
    const y1 = Math.floor(y1f * height);

    let sum = 0, sumSq = 0, count = 0;

    for(let y = y0; y < y1; y += 2){
        for(let x = x0; x < x1; x += 2){
            const idx = (y * width + x) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx+1] + 0.114 * data[idx+2];
            sum += lum;
            sumSq += lum * lum;
            count++;
        }
    }

    const mean = count ? sum / count : 0;
    const variance = count ? Math.max(sumSq / count - mean * mean, 0) : 0;

    return { mean, std: Math.sqrt(variance) };
}

function simulateFaceEmotion(imageData){

    // Lightweight visual heuristic (NOT the trained CV model): rather than
    // just averaging the whole frame, this compares the mouth region and
    // the eyes/brow region against the overall frame — a smile tends to
    // brighten/contrast the mouth area (visible teeth), a furrowed brow
    // raises contrast around the eyes, etc. Still an approximation, not a
    // real facial-landmark model, but it actually reacts to expression
    // instead of just ambient lighting.
    const { data, width, height } = imageData;

    const overall = regionStats(data, width, height, 0, 1, 0, 1);
    const mouth = regionStats(data, width, height, 0.30, 0.70, 0.62, 0.90);
    const eyes = regionStats(data, width, height, 0.15, 0.85, 0.25, 0.48);

    const mouthBrightDelta = mouth.mean - overall.mean;
    const mouthContrastDelta = mouth.std - overall.std;
    const eyeContrastDelta = eyes.std - overall.std;

    const scores = {
        Happy: mouthBrightDelta * 0.8 + mouthContrastDelta * 1.3,
        Sad: -mouthBrightDelta * 0.9 - mouthContrastDelta * 0.6,
        Angry: eyeContrastDelta * 1.3 - mouthContrastDelta * 0.5,
        Fear: eyeContrastDelta * 0.9 + mouthContrastDelta * 0.3
    };

    let best = "Neutral";
    let bestScore = 4.5; // baseline margin — needs a real signal to beat "Neutral"

    Object.keys(scores).forEach(key => {
        if(scores[key] > bestScore){
            bestScore = scores[key];
            best = key;
        }
    });

    const confidence = Math.min(58 + Math.abs(bestScore) * 2, 96);

    return { emotion: best, confidence };
}

function captureFaceEmotion(){

    const video = document.getElementById("tsFaceVideo");
    const canvas = document.getElementById("tsFaceCanvas");
    const resultBox = document.getElementById("tsFaceResult");
    const verdict = document.getElementById("tsFaceVerdict");
    const bar = document.getElementById("tsFaceBar");
    const sub = document.getElementById("tsFaceSub");

    if(!faceStream){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Enable the camera first.";
        sub.textContent = "";
        return;
    }

    resultBox.classList.add("show");
    verdict.className = "verdict status-warn";
    verdict.textContent = "Analyzing frame...";
    bar.style.width = "0%";
    sub.textContent = "";

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setTimeout(() => {
        const { emotion, confidence } = simulateFaceEmotion(imageData);

        const statusClass = emotion === "Happy" ? "status-good" :
                             emotion === "Neutral" ? "status-warn" : "status-bad";

        verdict.className = "verdict " + statusClass;
        verdict.textContent = "Detected Emotion: " + emotion;
        bar.style.width = confidence.toFixed(0) + "%";
        sub.textContent = "Confidence: " + confidence.toFixed(0) + "% · Simulated (mouth/eye contrast heuristic, no CV backend connected). Try a clear, well-lit, front-facing shot with a strong expression for the clearest read.";
    }, 600);
}

/*----------------- TRISENSEMIND — VOICE (mic, simulated) -----------------*/

function stdDev(arr){
    if(!arr.length) return 0;
    const mean = arr.reduce((a,b) => a+b, 0) / arr.length;
    const variance = arr.reduce((a,b) => a + (b-mean)*(b-mean), 0) / arr.length;
    return Math.sqrt(variance);
}

async function recordVoiceEmotion(){

    const btn = document.getElementById("tsVoiceRecordBtn");
    const resultBox = document.getElementById("tsVoiceResult");
    const verdict = document.getElementById("tsVoiceVerdict");
    const bar = document.getElementById("tsVoiceBar");
    const sub = document.getElementById("tsVoiceSub");

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Microphone not supported in this browser.";
        sub.textContent = "";
        return;
    }

    let micStream;
    try{
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }catch(err){
        resultBox.classList.add("show");
        verdict.className = "verdict status-bad";
        verdict.textContent = "Microphone access denied or unavailable.";
        sub.textContent = "Allow microphone access in your browser settings and try again.";
        return;
    }

    btn.disabled = true;
    resultBox.classList.add("show");
    verdict.className = "verdict status-warn";
    verdict.textContent = "Recording... speak now";
    bar.style.width = "0%";
    sub.textContent = "";

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const source = audioCtx.createMediaStreamSource(micStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const buffer = new Uint8Array(analyser.fftSize);
    const rmsSamples = [];
    const zcrSamples = [];

    const RECORD_MS = 3000;
    const interval = setInterval(() => {
        analyser.getByteTimeDomainData(buffer);

        let sumSquares = 0, crossings = 0;
        for(let i = 0; i < buffer.length; i++){
            const v = (buffer[i] - 128) / 128;
            sumSquares += v * v;
            if(i > 0){
                const prev = (buffer[i-1] - 128) / 128;
                if((prev >= 0) !== (v >= 0)) crossings++;
            }
        }

        rmsSamples.push(Math.sqrt(sumSquares / buffer.length));
        zcrSamples.push(crossings);
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        audioCtx.close();
        micStream.getTracks().forEach(track => track.stop());
        btn.disabled = false;

        const peakRms = rmsSamples.length ? Math.max(...rmsSamples) : 0;

        if(peakRms < 0.015){
            verdict.className = "verdict status-warn";
            verdict.textContent = "Didn't pick up enough voice.";
            bar.style.width = "0%";
            sub.textContent = "Try speaking louder, closer to the mic, or check mic permissions, then record again.";
            return;
        }

        const { emotion, confidence } = simulateVoiceEmotion(rmsSamples, zcrSamples);

        const statusClass = emotion === "Happy" || emotion === "Excited" ? "status-good" :
                             emotion === "Calm" || emotion === "Neutral" ? "status-warn" : "status-bad";

        verdict.className = "verdict " + statusClass;
        verdict.textContent = "Detected Tone: " + emotion;
        bar.style.width = confidence.toFixed(0) + "%";
        sub.textContent = "Confidence: " + confidence.toFixed(0) + "% · Simulated (loudness + pitch-variation heuristic, no audio-ML backend connected)";
    }, RECORD_MS);
}

function simulateVoiceEmotion(rmsSamples, zcrSamples){

    // Lightweight energy/tone heuristic (NOT the trained audio model):
    // combines how loud speech peaks get with how much the pitch/tone
    // varies across the recording, mapped onto a rough arousal/valence
    // grid so louder+varied reads Excited, louder+flat reads Angry,
    // quiet+varied reads Fear (shaky/trembling), quiet+flat reads Sad,
    // and moderate+varied reads Happy.
    const peakRms = Math.max(...rmsSamples);
    const zcrStd = stdDev(zcrSamples);

    const loud = peakRms > 0.12;
    const quiet = peakRms < 0.05;
    const highPitchVar = zcrStd > 10;

    let emotion;
    if(loud && highPitchVar) emotion = "Excited";
    else if(loud) emotion = "Angry";
    else if(quiet && highPitchVar) emotion = "Fear";
    else if(quiet) emotion = "Sad";
    else if(highPitchVar) emotion = "Happy";
    else emotion = "Neutral";

    const confidence = Math.min(56 + peakRms * 120 + Math.min(zcrStd, 20), 96);

    return { emotion, confidence };
}
