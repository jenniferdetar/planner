document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    const tabs = document.querySelectorAll('.planner-header-pill[data-tab]');
    const contents = document.querySelectorAll('.hoa-tab-content');

    function switchTab(tabId) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
        contents.forEach(c => c.classList.toggle('hidden', c.id !== tabId));
        localStorage.setItem('hoaActiveTab', tabId);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Handle internal hub links (data-tab-link)
    document.querySelectorAll('[data-tab-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tabLink);
        });
    });

    // Restore active tab
    const savedTab = localStorage.getItem('hoaActiveTab');
    if (savedTab && document.getElementById(savedTab)) {
        switchTab(savedTab);
    }

    // Bill Upload Logic (from hoa-bills.js)
    const billsCard = document.getElementById('hoa-financials-bills-card');
    const billsSection = document.getElementById('hoa-bills-section');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('bill-upload');
    const uploadStatus = document.getElementById('upload-status');
    const progressContainer = document.getElementById('summarization-progress');
    const progressBar = document.getElementById('progress-bar');
    const summarySection = document.getElementById('auto-summary-section');
    const summaryContent = document.getElementById('auto-summary-content');

    if (billsCard && billsSection) {
        billsCard.addEventListener('click', () => {
            billsSection.style.display = billsSection.style.display === 'none' ? 'block' : 'none';
        });
    }

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

    // PDF Summarizer (from index.html)
    const hoaPdfInput = document.getElementById('hoa-pdf-input');
    const hoaSummaryBox = document.getElementById('hoa-summary-output');
    const hoaSummaryMeta = document.getElementById('hoa-summary-meta');
    const STOPWORDS = new Set(['the','and','of','to','in','a','for','on','at','by','with','is','it','as','be','an','or','from','that','this','are','was','were','will','can','may','not','your','you']);

    if (hoaPdfInput) {
        hoaPdfInput.addEventListener('change', async (evt) => {
            if (!window.pdfjsLib) {
                if (hoaSummaryBox) hoaSummaryBox.textContent = 'PDF reader is unavailable right now.';
                return;
            }
            const file = evt.target.files?.[0];
            if (!file) return;
            if (hoaSummaryBox) hoaSummaryBox.textContent = 'Processing PDF…';
            if (hoaSummaryMeta) hoaSummaryMeta.innerHTML = '';
            
            try {
                // Check if requireSupabaseUser is available
                if (typeof requireSupabaseUser !== 'function') {
                    if (hoaSummaryBox) hoaSummaryBox.textContent = 'Authentication helper missing.';
                    return;
                }

                const user = await requireSupabaseUser();
                if (!user) {
                    if (hoaSummaryBox) hoaSummaryBox.textContent = 'Please log in to upload and sync PDFs.';
                    return;
                }

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map(item => item.str).join(' ');
                    text += ' ' + strings;
                    if (text.length > 12000) break;
                }
                const summary = summarizeText(text);
                const wordCount = text.split(/\s+/).filter(Boolean).length;

                const path = `${user.id}/hoa/${Date.now()}-${file.name}`;
                const { error: uploadError } = await window.supabaseClient
                    .storage.from('hoa-unit-files')
                    .upload(path, file, { upsert: false });
                if (uploadError) throw uploadError;

                const { data: publicUrlData } = window.supabaseClient
                    .storage.from('hoa-unit-files')
                    .getPublicUrl(path);
                const fileUrl = publicUrlData?.publicUrl || '';

                await window.supabaseClient.from('hoa_units').insert({
                    user_id: user.id,
                    unit_name: 'HOA Library',
                    file_name: file.name,
                    file_url: fileUrl,
                    summary,
                    pages: pdf.numPages,
                    words: wordCount
                });

                renderSummary(summary, { name: file.name, pages: pdf.numPages, words: wordCount, url: fileUrl });
            } catch (err) {
                console.error(err);
                if (hoaSummaryBox) hoaSummaryBox.textContent = 'Unable to read or upload that PDF. Please try another file.';
            }
        });
    }

    function summarizeText(text) {
        if (!text || !text.trim()) return 'No readable text found in this PDF.';
        const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.?!])\s+/).filter(s => s.length > 20);
        const topSentences = sentences.slice(0, 3).join(' ');
        const freq = {};
        text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).forEach(word => {
            if (!word || STOPWORDS.has(word)) return;
            freq[word] = (freq[word] || 0) + 1;
        });
        const keywords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w).join(', ');
        return `${topSentences || 'Summary unavailable.'}\n\nTop keywords: ${keywords || 'n/a'}`;
    }

    function renderSummary(summaryText, meta) {
        if (hoaSummaryBox) hoaSummaryBox.textContent = summaryText;
        if (hoaSummaryMeta) {
            hoaSummaryMeta.innerHTML = [
                meta.name ? `<span class="hoa-summary-pill">File: ${meta.name}</span>` : '',
                meta.pages ? `<span class="hoa-summary-pill">Pages: ${meta.pages}</span>` : '',
                meta.words ? `<span class="hoa-summary-pill">Words: ${meta.words}</span>` : '',
                meta.url ? `<span class="hoa-summary-pill"><a href="${meta.url}" target="_blank" rel="noopener">Open</a></span>` : ''
            ].filter(Boolean).join('');
        }
    }
});
