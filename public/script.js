// ❄️ Schneeflocken erzeugen
function createSnowflake() {
    const snow = document.querySelector(".snow");
    const flake = document.createElement("div");
    flake.classList.add("snowflake");
    flake.textContent = "❄";

    flake.style.left = Math.random() * 100 + "vw";
    flake.style.fontSize = 8 + Math.random() * 12 + "px";
    flake.style.animationDuration = 3 + Math.random() * 5 + "s";

    snow.appendChild(flake);

    setTimeout(() => flake.remove(), 9000);
}
setInterval(createSnowflake, 150);

// 🎁 Wichteln Funktion
let userId = null;

document.getElementById("registerForm").addEventListener("submit", async (e)=>{
    e.preventDefault();

    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;

    const res = await fetch("/api/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({name, address})
    });

    const data = await res.json();
    userId = data.id;

    document.getElementById("drawBtn").classList.remove("hidden");
    alert("Du bist eingetragen!");
});

document.getElementById("drawBtn").addEventListener("click", async ()=>{
    const res = await fetch("/api/draw?id=" + userId);
    const data = await res.json();

    document.getElementById("result").textContent = data.message;
});
