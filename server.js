const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');         
const csv = require('csv-parser');    
const cors = require('cors');         

const app = express();
const port = 3000;
const csvFilePath = 'job_seekers_data.csv'; 

// --- Global Data Arrays ---
let jobSeekersData = []; 
let customJobSeekers = []; // NEW: Array to store user-submitted data in memory

// --- Middleware ---
app.use(cors()); 
app.use(bodyParser.json());
app.use(express.static('public')); 

// =================================================================
// FUNCTION: Load data from CSV file
// =================================================================
function loadCsvData() {
    jobSeekersData = []; 
    console.log(`Attempting to load data from: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
        console.error(`Error: CSV file not found at ${csvFilePath}. Please create it and restart the server.`);
        return;
    }

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            // Data cleaning/formatting: Ensure AADHAR is a clean string
            data.age = parseInt(data.age, 10) || null; 
            // NOTE: We assume your CSV file has an 'Aadhaar' column now for this to work.
            data.aadhar = data.Aadhaar ? data.Aadhaar.toString().replace(/[^0-9]/g, '') : '';
            
            jobSeekersData.push(data);
        })
        .on('end', () => {
            console.log(`CSV file successfully processed. Loaded ${jobSeekersData.length} job seekers.`);
        })
        .on('error', (err) => {
            console.error('An error occurred while reading the CSV:', err);
        });
}

// Load data immediately on server start
loadCsvData(); 

// =================================================================
// NEW API ENDPOINT: Handle User-Saved Profile Data (POST)
// =================================================================
app.post('/api/save-profile', (req, res) => {
    const profileData = req.body;
    
    // Check for critical data
    if (!profileData || !profileData.aadhar || !profileData.name) {
        return res.status(400).json({ success: false, message: 'Incomplete profile data (Aadhaar or Name missing).' });
    }

    // Structure the new data to be consistent with how CSV headers look
    const newSeekerData = {
        Aadhaar: profileData.aadhar, // Use raw aadhar for comparison
        Name: profileData.name,
        Age: profileData.age,
        // Using the assumed CSV headers (with spaces) for consistency in the combined array
        'Job type': profileData.jobtype, 
        // Note: For skills, using 'Skills' as a generic field for manually added data
        'Sales Assistant ': profileData.skills, 
        'Education ': profileData.education,
        'Location ': profileData.location,
        'Contact ': profileData.contact,
        Experience: profileData.experience,
        Gmail: profileData.email,
        source: 'user_saved' 
    };

    // Find if a profile with this Aadhaar already exists in the custom list
    const existingIndex = customJobSeekers.findIndex(seeker => seeker.Aadhaar === profileData.aadhar);

    if (existingIndex !== -1) {
        // If profile exists, update it
        customJobSeekers[existingIndex] = newSeekerData;
        console.log(`Profile updated for Aadhaar: ${profileData.aadhar}`);
    } else {
        // If new profile, add it to the custom list
        customJobSeekers.push(newSeekerData);
        console.log(`New profile saved for Aadhaar: ${profileData.aadhar}`);
    }
    
    res.json({ success: true, message: 'Profile saved successfully and added to job seekers list.' });
});


// =================================================================
// UPDATED API ENDPOINT: Get all job seekers data (CSV + Custom)
// =================================================================
app.get('/api/jobseekers', (req, res) => {
    // Combine CSV data (jobSeekersData) and manually saved data (customJobSeekers)
    const combinedSeekers = [...jobSeekersData, ...customJobSeekers];
    res.json(combinedSeekers);
});

// =================================================================
// EXISTING ENDPOINT: Dummy OTP endpoint 
// =================================================================
app.post('/auth/send-otp', (req, res) => {
    const { aadhar } = req.body;
    if (!aadhar || aadhar.length !== 12) return res.status(400).json({ message: 'Invalid Aadhaar' });
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`Generated OTP for ${aadhar}: ${otp}`); 
    res.json({ otp });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});