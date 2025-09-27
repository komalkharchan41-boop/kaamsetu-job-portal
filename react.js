import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Use colorful CSS and animations here

const App = () => {
  const [userType, setUserType] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [jobs, setJobs] = useState([]);
  const [unprofessionalWorkers, setUnprofessionalWorkers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch jobs based on filters
  const fetchJobs = async () => {
    const skillQuery = skills.split(',').map(s => s.trim()).join(',');
    const res = await axios.get(http://localhost:5000/jobs?location=${location}&skills=${skillQuery});
    setJobs(res.data);
  };

  // Fetch unprofessional workers only
  const fetchUnprofessional = async () => {
    const res = await axios.get('http://localhost:5000/users?isProfessional=false');
    setUnprofessionalWorkers(res.data);
  };

  useEffect(() => {
    fetchJobs();
    fetchUnprofessional();
  }, []);

  // Post a review
  const addReview = async (userId, review) => {
    const res = await axios.post(http://localhost:5000/users/${userId}/review, review);
    alert('Review added!');
    setReviews(res.data.profile.reviews);
  };

  return (
    <div className="app-container">
      <header className="header" style={{background: 'linear-gradient(45deg, #4facfe, #00f2fe)', color: 'white', padding: '1rem'}}>
        <h1>Smart Job Community Platform</h1>
        <div>
          <label>Select User Type: </label>
          <select onChange={e => setUserType(e.target.value)} value={userType}>
            <option value="">--Select--</option>
            <option value="job_seeker">Job Seeker</option>
            <option value="job_provider">Job Provider</option>
          </select>
        </div>
      </header>

      <main style={{padding: '1rem'}}>
        <section className="filter-section" style={{marginBottom: '2rem'}}>
          <h2>Search & Filter Jobs</h2>
          <input 
            type="text" 
            placeholder="Location" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            style={{marginRight: '1rem', padding: '0.5rem'}}
          />
          <input 
            type="text" 
            placeholder="Skills (comma separated)" 
            value={skills} 
            onChange={e => setSkills(e.target.value)}
            style={{padding: '0.5rem'}}
          />
          <button onClick={fetchJobs} style={{backgroundColor:'#007bff', color:'white', marginLeft:'1rem', padding:'0.5rem 1rem', border:'none', borderRadius:'5px'}}>
            Search
          </button>
        </section>

        <section className="job-list" style={{marginBottom: '2rem'}}>
          <h2>Job Listings</h2>
          {jobs.length === 0 ? <p>No jobs found</p> : jobs.map(job => (
            <div key={job._id} className="job-card" style={{border:'1px solid #ddd', marginBottom:'1rem', padding:'1rem', borderRadius:'5px', boxShadow:'0 0 10px rgba(0,0,0,0.1)', animation: 'fadeIn 1s'}}>
              <h3>{job.title}</h3>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Skills Required:</strong> {job.requiredSkills.join(', ')}</p>
              <p>{job.description}</p>
              <button style={{backgroundColor:'#28a745', color:'white', padding:'0.5rem', border:'none', borderRadius:'5px'}}>
                Apply Now
              </button>
            </div>
          ))}
        </section>

        <section className="unprofessional-workers">
          <h2 style={{color: 'red'}}>Unprofessional Workers</h2>
          {unprofessionalWorkers.length === 0 ? <p>No unprofessional workers found.</p> : unprofessionalWorkers.map(user => (
            <div key={user._id} style={{border:'1px solid red', padding:'1rem', marginBottom:'1rem', borderRadius:'5px', animation: 'pulse 2s infinite'}}>
              <h3>{user.username} ({user.userType})</h3>
              <p>Location: {user.location}</p>
              <p>Skills: {user.skills.join(', ')}</p>
              <p>Rating: {user.profile.rating.toFixed(1)}</p>
              <video width="320" height="240" controls style={{borderRadius:'5px'}}>
                <source src={user.profile.videoResumeUrl || "https://fake-videos.com/dummy.mp4"} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button onClick={() => setSelectedUser(user)} style={{backgroundColor:'#ffc107', marginTop:'1rem', padding:'0.5rem', border:'none', borderRadius:'5px'}}>
                See Reviews & Add Review
              </button>
            </div>
          ))}

          {selectedUser && (
            <div className="review-section" style={{border:'1px solid #ccc', padding:'1rem', marginTop:'2rem', borderRadius:'5px', backgroundColor:'#f9f9f9'}}>
              <h3>Reviews for {selectedUser.username}</h3>
              {selectedUser.profile.reviews.length === 0 ? <p>No reviews yet.</p> : (
                <ul>
                  {selectedUser.profile.reviews.map((r, idx) => (
                    <li key={idx}>
                      <strong>{r.user}:</strong> {r.comment} - <em>{r.rating} stars</em>
                    </li>
                  ))}
                </ul>
              )}
              <AddReviewForm userId={selectedUser._id} addReview={addReview} />
              <button onClick={() => setSelectedUser(null)} style={{backgroundColor:'#dc3545', color:'white', padding:'0.5rem', border:'none', borderRadius:'5px', marginTop:'1rem'}}>
                Close
              </button>
            </div>
          )}
        </section>
      </main>

      <style>{`
        @keyframes fadeIn {
          from {opacity: 0;}
          to {opacity:1;}
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 5px red;}
          50% { box-shadow: 0 0 20px red;}
          100% { box-shadow: 0 0 5px red;}
        }
      `}</style>
    </div>
  );
};

const AddReviewForm = ({userId, addReview}) => {
  const [user, setUser] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const submit = e => {
    e.preventDefault();
    addReview(userId, {user, comment, rating: Number(rating)});
    setUser(''); setComment(''); setRating(5);
  };

  return (
    <form onSubmit={submit} style={{marginTop: '1rem'}}>
      <input 
        type="text" 
        placeholder="Your Name" 
        value={user} 
        onChange={e => setUser(e.target.value)} 
        required 
        style={{marginRight: '1rem', padding:'0.5rem'}}
      />
      <input 
        type="text" 
        placeholder="Comment" 
        value={comment} 
        onChange={e => setComment(e.target.value)}
        required 
        style={{marginRight: '1rem', padding:'0.5rem', width:'300px'}}
      />
      <select value={rating} onChange={e => setRating(e.target.value)} style={{padding:'0.5rem'}}>
        {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
      </select>
      <button type="submit" style={{backgroundColor:'#007bff', color:'white', padding:'0.5rem 1rem', marginLeft:'1rem', border:'none', borderRadius:'5px'}}>
        Add Review
      </button>
    </form>
  );
};

export default App;