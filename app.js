// public/app.js

const apiUrl = 'http://localhost:3000/api';

const authSection = document.getElementById('auth-section');
const jobSection = document.getElementById('job-section');
const authMessage = document.getElementById('auth-message');

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const userTypeSelect = document.getElementById('userType');

const filterLocationInput = document.getElementById('filterLocation');
const filterSkillInput = document.getElementById('filterSkill');
const jobList = document.getElementById('jobList');

let currentUser = null;

document.getElementById('registerBtn').addEventListener('click', async () => {
  const username = usernameInput.value;
  const password = passwordInput.value;
  const userType = userTypeSelect.value;

  try {
    const res = await fetch(${apiUrl}/register, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password, userType })
    });
    const data = await res.json();
    authMessage.textContent = data.message;
  } catch(e) {
    authMessage.textContent = "Error registering user.";
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = usernameInput.value;
  const password = passwordInput.value;

  try {
    const res = await fetch(${apiUrl}/login, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    if(res.ok) {
      const data = await res.json();
      authMessage.textContent = "Login successful!";
      currentUser = { username, userType: data.userType };
      authSection.style.display = 'none';
      jobSection.style.display = 'block';
      fetchJobs();
    } else {
      const err = await res.json();
      authMessage.textContent = err.message;
    }
  } catch(e) {
    authMessage.textContent = "Error during login.";
  }
});

document.getElementById('filterBtn').addEventListener('click', () => {
  fetchJobs();
});

async function fetchJobs() {
  const location = filterLocationInput.value;
  const skill = filterSkillInput.value;

  let url = ${apiUrl}/jobs?;
  if(location) url += location=${encodeURIComponent(location)}&;
  if(skill) url += skill=${encodeURIComponent(skill)}&;

  try {
    const res = await fetch(url);
    const jobs = await res.json();
    displayJobs(jobs);
  } catch(e) {
    jobList.innerHTML = '<li>Error loading jobs</li>';
  }
}

function displayJobs(jobs) {
  jobList.innerHTML = '';
  if(jobs.length === 0) {
    jobList.innerHTML = '<li>No jobs found</li>';
    return;
  }
  jobs.forEach(job => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${job.title}</strong> - ${job.location}<br/>${job.description} <br/>
      <button onclick="applyJob(${job.id})">Apply</button>`;
    jobList.appendChild(li);
  });
}

async function applyJob(jobId) {
  if(!currentUser) {
    alert("Please login first!");
    return;
  }
  try {
    const res = await fetch(${apiUrl}/jobs/${jobId}/apply, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username: currentUser.username })
    });
    const data = await res.json();
    alert(data.message);
  } catch(e) {
    alert("Error applying for job.");
  }
}