document.addEventListener("DOMContentLoaded", () => {
  const WHEEL_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  ];

  const RED_NUMBERS = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];

  const svg = document.getElementById("roulette-wheel");
  const segmentsGroup = document.getElementById("wheel-segments");
  const spinButton = document.getElementById("spin-button");
  const spinSound = document.getElementById("spin-sound");
  let isSpinning = false;

  function drawWheel() {
    const numberOfSegments = WHEEL_NUMBERS.length;
    const anglePerSegment = 360 / numberOfSegments;

    for (let i = 0; i < numberOfSegments; i++) {
      const startAngle = anglePerSegment * i;
      const endAngle = startAngle + anglePerSegment;
      const number = WHEEL_NUMBERS[i];

      // Create segment path
      const largeArcFlag = anglePerSegment > 180 ? 1 : 0;
      const x1 = 200 * Math.cos((Math.PI * startAngle) / 180);
      const y1 = 200 * Math.sin((Math.PI * startAngle) / 180);
      const x2 = 200 * Math.cos((Math.PI * endAngle) / 180);
      const y2 = 200 * Math.sin((Math.PI * endAngle) / 180);

      const pathData = `
                M 0 0 
                L ${x1} ${y1}
                A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
            `;

      const segment = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      segment.setAttribute("d", pathData);
      segment.setAttribute(
        "fill",
        number === 0
          ? "#0f5c0f"
          : RED_NUMBERS.includes(number)
          ? "#b51515"
          : "#0f0f0f"
      );
      segmentsGroup.appendChild(segment);

      // Add the number text
      const textAngle = startAngle + anglePerSegment / 2;
      const textX = 170 * Math.cos((Math.PI * textAngle) / 180);
      const textY = 170 * Math.sin((Math.PI * textAngle) / 180);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", textX);
      text.setAttribute("y", textY);
      text.setAttribute("fill", "#ffffff");
      text.setAttribute("font-size", "16");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("alignment-baseline", "middle");

      // Rotate text to face outward
      text.setAttribute(
        "transform",
        `rotate(${textAngle + 90} ${textX} ${textY})`
      );

      text.textContent = number;

      segmentsGroup.appendChild(text);
    }
  }

  function spin() {
    if (isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true; // Disable the button while spinning

    // Use Crypto API for better randomness
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomSpin = (randomBuffer[0] % 3600) + 3600; // Random spin between 360 and 3960 degrees

    const finalSpin = randomSpin - 95;
    svg.style.transition = "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)";
    svg.style.transform = `rotate(${finalSpin}deg)`;

    // Play spinning sound
    spinSound.play();

    setTimeout(() => {
      isSpinning = false;
      svg.style.transition = "none";

      // Calculate the winning number based on the final rotation
      const adjustedRotation = ((finalSpin % 360) + 360) % 360; // Normalize rotation to positive value between 0-360
      const segmentAngle = 360 / WHEEL_NUMBERS.length;
      const winningIndex =
        Math.floor((360 - adjustedRotation) / segmentAngle) %
        WHEEL_NUMBERS.length;
      const winningNumber = WHEEL_NUMBERS[winningIndex];

      // Stop spinning sound
      spinSound.pause();
      spinSound.currentTime = 0; // Reset the sound for the next spin

      updateWinningNumber(winningNumber);
      updateGameHistory(winningNumber);
      // Re-enable the spin button after the spin is complete
      spinButton.disabled = false;
    }, 5000);
  }

  function updateWinningNumber(number) {
    const winningNumberElement = document.getElementById("winning-number");
    const colorClass =
      number === 0
        ? "text-green-600"
        : RED_NUMBERS.includes(number)
        ? "text-red-600"
        : "text-black";
    const colorText =
      number === 0 ? "Green" : RED_NUMBERS.includes(number) ? "Red" : "Black";

    winningNumberElement.innerHTML = `
            <div class="text-6xl font-bold mb-2 ${colorClass}">
                ${number}
            </div>
            <div class="text-xl font-semibold">
                <span class="${colorClass}">${colorText}</span>
                <span class="ml-2">${number % 2 === 0 ? "Even" : "Odd"}</span>
                <span class="ml-2">${number > 18 ? "High" : "Low"}</span>
            </div>
        `;
  }

  function updateGameHistory(number) {
    const historyNumbersElement = document.getElementById("history-numbers");
    const color =
      number === 0
        ? "bg-green-600"
        : RED_NUMBERS.includes(number)
        ? "bg-red-600"
        : "bg-gray-800";

    const historyElement = document.createElement("div");
    historyElement.className = `w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${color} shadow-md`;
    historyElement.textContent = number;

    if (historyNumbersElement.children.length >= 10) {
      historyNumbersElement.removeChild(historyNumbersElement.lastChild);
    }
    historyNumbersElement.insertBefore(
      historyElement,
      historyNumbersElement.firstChild
    );
  }

  spinButton.addEventListener("click", spin);

  // Draw the wheel and set initial position so that 0 is at the top
  drawWheel();
  svg.style.transform = "rotate(-95deg)";
});
