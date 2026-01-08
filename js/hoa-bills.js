document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('bill-upload');
  const uploadStatus = document.getElementById('upload-status');
  const progressContainer = document.getElementById('summarization-progress');
  const progressBar = document.getElementById('progress-bar');
  const summarySection = document.getElementById('auto-summary-section');
  const summaryContent = document.getElementById('auto-summary-content');

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      uploadStatus.textContent = file.name;
      progressContainer.style.display = 'block';
      summarySection.style.display = 'none';
      
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
        
        if (progress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            progressContainer.style.display = 'none';
            showSummary(file);
          }, 500);
        }
      }, 400);
    });
  }

  function showSummary(file) {
    summarySection.style.display = 'block';
    
    // Create a mock summary based on file info
    const date = new Date().toLocaleDateString();
    const mockVendor = file.name.split('.')[0].replace(/[-_]/g, ' ');
    const mockAmount = (Math.random() * 500 + 50).toFixed(2);
    
    summaryContent.innerHTML = `
      <div class="planner-card" style="padding: 32px 60px; text-align: center;">
        <h3 class="planner-card-title" style="margin-bottom: 16px;">Document: ${file.name}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: left;">
          <div>
            <p class="planner-card-content"><strong>Detected Vendor:</strong> ${mockVendor.charAt(0).toUpperCase() + mockVendor.slice(1)}</p>
            <p class="planner-card-content"><strong>Estimated Amount:</strong> $${mockAmount}</p>
            <p class="planner-card-content"><strong>Date Extracted:</strong> ${date}</p>
          </div>
          <div style="padding-left: 16px; border-left: 1px solid rgba(0, 50, 107, 0.1);">
            <p class="planner-card-content"><strong>AI Insights:</strong></p>
            <ul class="planner-card-content" style="margin-left: 20px; margin-top: 8px;">
              <li>No past due balance detected.</li>
              <li>Standard net-30 terms apply.</li>
              <li>Matches maintenance category for HOA records.</li>
            </ul>
          </div>
        </div>
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(0, 50, 107, 0.1); display: flex; justify-content: center; gap: 12px;">
          <button class="planner-button planner-button-secondary planner-button-sm">Add to Expenses</button>
          <button class="planner-button planner-button-secondary planner-button-sm">File as Record</button>
        </div>
      </div>
    `;
    
    if (window.utils && window.utils.showToast) {
      window.utils.showToast('Document summarized successfully', 'success');
    }
  }
});
