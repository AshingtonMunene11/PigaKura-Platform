//base url
const BASE_URL = "http://localhost:3000/candidates";

// Dark mode button
const themeToggle = document.getElementById("toggle-theme");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

const learnButton = document.querySelector('.learn');
const partyForm = document.getElementById('party-form');
const partySelect = document.querySelector('.partySelect');
const candidateSection = document.getElementById('candidate-section');

// Submit party button of candidates
partyForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const selectedParty = partySelect.value;

  if (!selectedParty) {
    alert("Please select a party.");
    return;
  }

  fetchCandidateByParty(selectedParty);
});

// Fetch candidate
function fetchCandidateByParty(party) {
  fetch(`${BASE_URL}?party=${party}`)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        candidateSection.innerHTML = `<p>No candidate found for this party.</p>`;
      } else {
        renderCandidate(data[0]); // Show first candidate that matches
      }
    })
    .catch(error => {
      console.error("Error fetching candidate:", error);
      candidateSection.innerHTML = `<p>Error loading candidate info. Check your server.</p>`;
    });
}

// Render candidate on the page
function renderCandidate(candidate) {
  candidateSection.innerHTML = `
    <h3>Meet the Candidates</h3>
    <div class="candidate-card" id="candidate-${candidate.id}">
      <h4>${candidate.name}</h4>
      <p><strong>Party:</strong> ${candidate.party}</p>
      <p><strong>Running Mate:</strong> ${candidate.runningMate || "N/A"}</p>
      <img src="${candidate.partySymbol}" alt="Party Symbol" style="max-width: 150px; margin: 10px 0;">
      <p><strong>Votes:</strong> <span id="vote-count-${candidate.id}">${candidate.votes}</span></p>
      <button onclick="voteCandidate(${candidate.id})">Vote</button>
      <button onclick="deleteCandidate(${candidate.id})" style="margin-left: 10px; background-color: red; color: white;">Remove</button>
      <button onclick="showNominationForm()" style="margin-left: 10px; background-color: green; color: white;">Nominate</button>
    </div>
  `;
}

// Handle vote for candidates
function voteCandidate(id) {
  fetch(`${BASE_URL}/${id}`)
    .then(response => response.json())
    .then(candidate => {
      const updatedVotes = candidate.votes + 1;

      return fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ votes: updatedVotes })
      });
    })
    .then(() => {
      // Refresh vote count
      return fetch(`${BASE_URL}/${id}`);
    })
    .then(response => response.json())
    .then(updatedCandidate => {
     
      document.getElementById(`vote-count-${updatedCandidate.id}`).textContent = updatedCandidate.votes;
      alert("✅ Your vote has been counted!");
    })
    .catch(error => {
      console.error("Error during voting:", error);
      alert("❌ Failed to submit your vote. Please try again.");//Alerts Voter if failed voting
    });
}

// Delete candidate
window.deleteCandidate = function (id) {
  const confirmDelete = confirm("Are you sure you want to hide this candidate?");
  if (!confirmDelete) return;

  fetch(`${BASE_URL}/${id}`, {//only paty selected will be deleted
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isDeleted: true })//used soft delete so that i cannot lose info on my dbjson, the commented code below is for hard delete
  })
    .then(() => {
      document.getElementById(`candidate-${id}`)?.remove();
      alert("Candidate has been soft-deleted (hidden).");
    })
    .catch(err => {
      console.error("Error soft-deleting candidate:", err);
    });
};

/*
window.deleteCandidate = function (id) {
  const confirmDelete = confirm("Are you sure you want to remove this candidate?");
  if (!confirmDelete) return;

  fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
    .then(() => {
      const card = document.getElementById(`candidate-${id}`);
      if (card) card.remove();
      alert("Candidate removed.");
    })
    .catch(err => {
      console.error("Try Delete Again:", err);
    });
};
*/
