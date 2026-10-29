
const analyzeButton = document.getElementById("analyzeButton");
const copyFingerprintButton = document.getElementById("copyFingerprintButton");
const copyButton = document.getElementById("copyButton");
const resetButton = document.getElementById("resetButton");

const result = document.getElementById("result");
const report = document.getElementById("copyStatus");

let fingerprint = "";
let reportText = "";

// Convert bytes into a SHA-256 hash.
async function makeHashFromBytes(bytes) {
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Create a hash from text.
async function makeHash(text) {
  const bytes = new TextEncoder().encode(text);
  return makeHashFromBytes(bytes);
}

// Display one browser signal in a card.
function makeCard(name, value) {
  const card = document.createElement("article");
  card.className = "result-card";

  const heading = document.createElement("h3");
  heading.textContent = name;

  const detail = document.createElement("p");
  detail.textContent = String(value);

  card.append(heading, detail);
  result.appendChild(card);
}

// Draw a fingerprint-like pattern on Canvas.
function drawCanvas() {
  const canvas = document.getElementById("fingerprintCanvas");
  const context = canvas.getContext("2d");

  if (!context) return null;

  // Background.
  context.fillStyle = "#17151f";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Heading.
  context.fillStyle = "#c4b5fd";
  context.font = "bold 19px Arial";
  context.fillText("Canvas Signature Test", 22, 32);

  // Draw fingerprint-like curved rings.
  for (let i = 0; i < 7; i++) {
    context.beginPath();

    context.ellipse(
      95,
      100,
      18 + i * 9,
      10 + i * 7,
      0,
      0,
      Math.PI * 2
    );

    context.strokeStyle =
      i % 2 === 0 ? "#a78bfa" : "#6d5a9d";

    context.lineWidth = 2;
    context.stroke();
  }

  // Add explanatory text.
  context.fillStyle = "#eeeaf5";
  context.font = "14px Arial";
  context.fillText("2D browser rendering", 220, 88);

  context.fillStyle = "#a29caf";
  context.font = "12px Arial";
  context.fillText("Pixel data -> SHA-256", 220, 113);

  // Return the actual pixel data for hashing.
  return context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  ).data;
}

// Draw graphics and check WebGL support.
function checkWebGL() {
  const canvas = document.getElementById("webglCanvas");
  const status = document.getElementById("webglStatus");
  const rendererText = document.getElementById("webglRenderer");

  const gl = canvas.getContext("webgl");

  if (!gl) {
    status.textContent = "WebGL is not available.";
    rendererText.textContent = "Renderer information unavailable.";
    return false;
  }

  // Set the drawing area.
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Draw the dark background.
  gl.clearColor(0.08, 0.07, 0.12, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw purple graphics bars.
  gl.enable(gl.SCISSOR_TEST);

  for (let i = 0; i < 10; i++) {
    gl.scissor(25 + i * 42, 55, 28, 55);

    gl.clearColor(
      0.35 + i * 0.035,
      0.25,
      0.65,
      1.0
    );

    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  gl.disable(gl.SCISSOR_TEST);

  status.textContent = "WebGL is supported.";

  // Try to read graphics renderer information.
  let renderer = "Not disclosed by browser";

  const extension = gl.getExtension("WEBGL_debug_renderer_info");

  if (extension) {
    renderer = gl.getParameter(
      extension.UNMASKED_RENDERER_WEBGL
    );
  }

  rendererText.textContent = renderer;

  return true;
}

// Run the complete browser analysis.
analyzeButton.addEventListener("click", async function () {
  result.replaceChildren();
  report.textContent = "Analyzing browser...";

  fingerprint = "";
  reportText = "";

  const signals = [
    ["Browser language", navigator.language || "Unavailable"],
    ["Screen resolution", screen.width + " × " + screen.height],
    [
      "Time zone",
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Unavailable"
    ],
    ["CPU threads", navigator.hardwareConcurrency || "Unavailable"],
    ["Cookies", navigator.cookieEnabled ? "Enabled" : "Disabled"],
    ["Platform", navigator.platform || "Unavailable"]
  ];

  // Run the Canvas and WebGL tests.
  const canvasPixels = drawCanvas();
  const webglAvailable = checkWebGL();

  signals.push([
    "Canvas API",
    canvasPixels ? "Supported" : "Unavailable"
  ]);

  signals.push([
    "WebGL",
    webglAvailable ? "Supported" : "Unavailable"
  ]);

  // Display the collected browser signals.
  signals.forEach(function (signal) {
    makeCard(signal[0], signal[1]);
  });

  let canvasHash = "Unavailable";

  try {
    // Hash the raw Canvas pixel bytes efficiently.
    if (canvasPixels) {
      canvasHash = await makeHashFromBytes(canvasPixels);

      document.getElementById("canvasHash").textContent =
        canvasHash;
    } else {
      document.getElementById("canvasHash").textContent =
        "Canvas signature unavailable.";
    }

    // Include the Canvas signature in the overall fingerprint.
    const source =
      signals.map(signal => signal.join(":")).join("|") +
      "|Canvas signature:" + canvasHash;

    fingerprint = await makeHash(source);

    document.getElementById("fingerprintToken").textContent =
      fingerprint;

  } catch (error) {
    fingerprint = "";

    document.getElementById("fingerprintToken").textContent =
      "Hash unavailable. Open the project using localhost or HTTPS.";

    document.getElementById("canvasHash").textContent =
      "Canvas hash unavailable.";
  }

  // Show the number of signals collected, not a risk score.
  document.getElementById("score").textContent = signals.length;

  document.getElementById("scoreTitle").textContent =
    "Signals detected";

  document.getElementById("scoreText").textContent =
    "Collected " + signals.length +
    " browser attributes. These demonstrate how information can " +
    "contribute to fingerprinting. This count is not a risk score.";

  // Show the signals used in the fingerprint.
  const ingredients =
    document.getElementById("fingerprintIngredients");

  ingredients.replaceChildren();

  signals.forEach(function (signal) {
    const item = document.createElement("li");
    item.textContent = signal[0];
    ingredients.appendChild(item);
  });

  const canvasIngredient = document.createElement("li");
  canvasIngredient.textContent = "Canvas pixel signature";
  ingredients.appendChild(canvasIngredient);

  // Display privacy recommendations.
  const recommendations = [
    "Keep your browser updated.",
    "Review browser privacy and tracking-protection settings.",
    "Limit unnecessary browser extensions and permissions.",
    "Private browsing does not make your browser fingerprint-proof."
  ];

  const recommendationList =
    document.getElementById("recommendationList");

  recommendationList.replaceChildren();

  recommendations.forEach(function (recommendation) {
    const item = document.createElement("li");
    item.textContent = recommendation;
    recommendationList.appendChild(item);
  });

  // Prepare the downloadable-by-copying text report.
  reportText = "Browser Fingerprinting Analyzer Report\n\n";

  signals.forEach(function (signal) {
    reportText += signal[0] + ": " + signal[1] + "\n";
  });

  reportText += "\nCanvas signature hash: " + canvasHash + "\n";
  reportText += "\nFingerprint: " +
    (fingerprint || "Unavailable") + "\n";

  reportText += "\nWebGL renderer: " +
    document.getElementById("webglRenderer").textContent + "\n";

  // Reveal the analysis sections.
  [
    "summary",
    "fingerprintPreview",
    "canvasSection",
    "webglSection",
    "recommendations"
  ].forEach(function (id) {
    document.getElementById(id).classList.remove("hidden");
  });

  report.textContent = "Analysis completed.";
});

// Copy the generated fingerprint.
copyFingerprintButton.addEventListener("click", async function () {
  if (!fingerprint) {
    report.textContent = "Analyze your browser first.";
    return;
  }

  try {
    await navigator.clipboard.writeText(fingerprint);
    report.textContent = "Fingerprint copied.";
  } catch (error) {
    report.textContent =
      "Clipboard unavailable. Copy the fingerprint manually.";
  }
});

// Copy the complete report.
copyButton.addEventListener("click", async function () {
  if (!reportText) {
    report.textContent = "Analyze your browser first.";
    return;
  }

  try {
    await navigator.clipboard.writeText(reportText);
    report.textContent = "Report copied.";
  } catch (error) {
    report.textContent =
      "Clipboard unavailable. Please copy the report manually.";
  }
});

// Reset all results and visualizations.
resetButton.addEventListener("click", function () {
  fingerprint = "";
  reportText = "";

  result.replaceChildren();

  const empty = document.createElement("div");
  empty.className = "empty-state";

  const icon = document.createElement("span");
  icon.className = "empty-icon";
  icon.textContent = "⌘";

  const heading = document.createElement("h3");
  heading.textContent = "Ready to analyze";

  const message = document.createElement("p");
  message.textContent =
    "Click “Analyze browser” to inspect your browser signals.";

  empty.append(icon, heading, message);
  result.appendChild(empty);

  document.getElementById("score").textContent = "0";
  document.getElementById("scoreTitle").textContent =
    "Signals detected";
  document.getElementById("scoreText").textContent = "";

  document.getElementById("fingerprintToken").textContent =
    "Your fingerprint will appear here.";

  document.getElementById("fingerprintIngredients").replaceChildren();
  document.getElementById("recommendationList").replaceChildren();

  document.getElementById("canvasHash").textContent =
    "Not generated yet.";

  document.getElementById("webglStatus").textContent =
    "Not tested yet.";

  document.getElementById("webglRenderer").textContent =
    "Not detected yet.";

  [
    "summary",
    "fingerprintPreview",
    "canvasSection",
    "webglSection",
    "recommendations"
  ].forEach(function (id) {
    document.getElementById(id).classList.add("hidden");
  });

  // Clear the Canvas drawing.
  const canvas = document.getElementById("fingerprintCanvas");
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Clear the WebGL drawing.
  const webglCanvas = document.getElementById("webglCanvas");
  const gl = webglCanvas.getContext("webgl");

  if (gl) {
    gl.viewport(0, 0, webglCanvas.width, webglCanvas.height);
    gl.clearColor(0.08, 0.07, 0.10, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  report.textContent = "Results reset.";
});
