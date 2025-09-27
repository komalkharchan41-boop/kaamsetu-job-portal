// Detect location
document.getElementById("detectLocation")?.addEventListener("click", () => {
  alert("Location auto-detected: Kathora Square, Amravati ✅");
  document.getElementById("locationDisplay").innerText = "Kathora Square, Amravati";
});

// Dummy jobs list (excel data ko yaha connect karenge later)
const jobs = [
  { title: "Software Developer", location: "Kathora Square", skills: "JavaScript, Node.js" },
  { title: "Data Entry Operator", location: "Amravati", skills: "Typing, Excel" },
  { title: "Digital Marketing Intern", location: "Kathora Square", skills: "SEO, Social Media" }
];

// Search jobs
document.getElementById("searchBtn")?.addEventListener("click", () => {
  const container = document.getElementById("jobsList");
  container.innerHTML = "";
  jobs.forEach(job => {
    const div = document.createElement("div");
    div.classList.add("job-card");
    div.innerHTML = `<h4>${job.title}</h4>
                     <p><b>Location:</b> ${job.location}</p>
                     <p><b>Skills:</b> ${job.skills}</p>
                     <button onclick="applyJob('${job.title}')">Apply</button>`;
    container.appendChild(div);
  });
});

// Apply function
function applyJob(jobTitle) {
  alert(`You applied for ${jobTitle}! ✅`);
}
