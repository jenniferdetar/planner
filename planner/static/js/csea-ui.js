window.cseaUI = (() => {
  function initialize() {
    setupTabSwitching();
    setupGrievanceModal();
    updateTodayDate();
  }

  function setupTabSwitching() {
    const tabs = document.querySelectorAll('.csea-tab-btn');
    const contents = document.querySelectorAll('.csea-tab-content');
    const subtitle = document.getElementById('csea-subtitle');

    const subtitleMap = {
      'issues': 'Stewarded member issues at a glance',
      'meetings': 'Capture summaries and follow-ups for member meetings',
      'notes': 'Follow-ups, reminders, and outcomes'
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        contents.forEach(c => {
          if (c.id === `${target}-tab`) {
            c.classList.remove('hidden');
          } else {
            c.classList.add('hidden');
          }
        });

        if (subtitle && subtitleMap[target]) {
          subtitle.textContent = subtitleMap[target];
        }
      });
    });
  }

  function updateTodayDate() {
    const todayDateEl = document.getElementById('today-date');
    if (todayDateEl) {
      todayDateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  function setupGrievanceModal() {
    const pillButton = document.getElementById('grievance-pill-btn')
    if (!pillButton) return;

    // Check if modal already exists to avoid duplicates
    if (document.getElementById('grievance-modal')) return;

    const modal = document.createElement('div')
    modal.id = 'grievance-modal'
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 hidden z-50'
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden border border-gray-200 grievance-shell">
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 grievance-actions">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-capsules text-primary"></i>
            <p class="font-semibold text-gray-800">Grievance Processing Form (Fillable)</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="grievance-print-btn" class="text-primary hover:text-primaryDark text-sm font-semibold px-3 py-1.5 rounded-md border border-primary bg-white">
              <i class="fa-solid fa-print mr-1"></i> Print
            </button>
            <button id="grievance-close-btn" class="text-gray-500 hover:text-gray-700">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
        </div>
        <div class="max-h-[70vh] overflow-y-auto bg-gray-50 p-4 grievance-content">
          <form id="grievance-form" class="space-y-6">
            <section class="bg-white border border-gray-200 rounded-lg shadow-sm grievance-section">
              <div class="px-4 py-3 bg-primary text-white rounded-t-lg flex items-center gap-2">
                <i class="fa-solid fa-clipboard-list"></i>
                <span class="font-semibold text-sm">Section 1 — Initial Grievance Information</span>
              </div>
              <div class="p-4 grid gap-3 md:grid-cols-2">
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Date</label>
                  <input type="date" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Grievance #</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Optional" />
                </div>
                <div class="grid gap-2 md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">Name of Grievant(s)</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2 md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">Home Address</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Work Phone</label>
                  <input type="tel" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Home Phone</label>
                  <input type="tel" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Cell Phone</label>
                  <input type="tel" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Immediate Supervisor</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Supervisor Phone</label>
                  <input type="tel" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Classification (Job Title)</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Date of Hire</label>
                  <input type="date" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Work Hours (per day)</label>
                  <input type="number" step="0.25" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Days per Year</label>
                  <input type="number" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2 md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">Previous Classifications Held</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2 md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">What happened?</label>
                  <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" rows="3"></textarea>
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">When did it happen?</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Where?</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2 md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">Witnesses (names)</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-2 md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">Requested Remedy</label>
                  <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" rows="3"></textarea>
                </div>
                <div class="grid gap-2 md:col-span-2">
                  <label class="text-sm font-semibold text-gray-700">Additional Comments</label>
                  <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" rows="3"></textarea>
                </div>
              </div>
            </section>

            <section class="bg-white border border-gray-200 rounded-lg shadow-sm grievance-section">
              <div class="px-4 py-3 bg-primary text-white rounded-t-lg flex items-center gap-2">
                <i class="fa-solid fa-users"></i>
                <span class="font-semibold text-sm">Section 2 — Witness Information</span>
              </div>
              <div class="p-4 space-y-4">
                <p class="text-sm font-semibold text-gray-700">Interviews with other employees (Witnesses, officers, etc.)</p>
                <div class="grid gap-4 md:grid-cols-2">
                  ${['a','b','c','d'].map(letter => `
                    <div class="grid gap-2 border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div class="grid gap-1">
                        <label class="text-xs font-semibold text-gray-700">Name (${letter.toUpperCase()})</label>
                        <input type="text" class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                      <div class="grid gap-1">
                        <label class="text-xs font-semibold text-gray-700">Title</label>
                        <input type="text" class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                      <div class="grid gap-1">
                        <label class="text-xs font-semibold text-gray-700">Date</label>
                        <input type="date" class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                      <div class="grid gap-1">
                        <label class="text-xs font-semibold text-gray-700">Comments</label>
                        <textarea class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" rows="2"></textarea>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <p class="text-sm font-semibold text-gray-700">Interview with management (Supervisor, Principal, Director, etc.)</p>
                <div class="grid gap-4 md:grid-cols-3">
                  ${['a','b','c'].map(letter => `
                    <div class="grid gap-2 border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div class="grid gap-1">
                        <label class="text-xs font-semibold text-gray-700">Name (${letter.toUpperCase()})</label>
                        <input type="text" class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                      <div class="grid gap-1">
                        <label class="text-xs font-semibold text-gray-700">Title</label>
                        <input type="text" class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                      <div class="grid gap-1">
                        <label class="text-xs font-semibold text-gray-700">Date</label>
                        <input type="date" class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                      <div class="grid gap-1">
                        <label class="text-xs font-semibold text-gray-700">Comments</label>
                        <textarea class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" rows="2"></textarea>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </section>

            <section class="bg-white border border-gray-200 rounded-lg shadow-sm grievance-section">
              <div class="px-4 py-3 bg-primary text-white rounded-t-lg flex items-center gap-2">
                <i class="fa-solid fa-scale-balanced"></i>
                <span class="font-semibold text-sm">Section 3 — Union Steward Contract Review & Analysis</span>
              </div>
              <div class="p-4 grid gap-3">
                <div class="grid gap-1">
                  <label class="text-sm font-semibold text-gray-700">Contract violation? If yes, article</label>
                  <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div class="grid gap-1">
                  <label class="text-sm font-semibold text-gray-700">Past practice check</label>
                  <div class="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                    ${['Mutual knowledge','Consistent','History','Repetitive','Not contrary to contract'].map(item => `
                      <label class="flex items-center gap-2">
                        <input type="checkbox" class="h-4 w-4 border-gray-300 rounded text-primary focus:ring-primary" />
                        <span>${item}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
                <div class="grid gap-1">
                  <label class="text-sm font-semibold text-gray-700">Other possible violations</label>
                  <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" rows="3"></textarea>
                </div>
                <div class="grid gap-1">
                  <label class="text-sm font-semibold text-gray-700">Discrepancies (unclear/insufficient/contradictory)</label>
                  <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" rows="3"></textarea>
                </div>
                <div class="grid md:grid-cols-2 gap-3">
                  <div class="grid gap-1">
                    <label class="text-sm font-semibold text-gray-700">Conclusion: pursue the matter?</label>
                    <select class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div class="grid gap-1">
                    <label class="text-sm font-semibold text-gray-700">Why / why not?</label>
                    <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div class="grid gap-2">
                  <label class="text-sm font-semibold text-gray-700">Disposition of Issue</label>
                  <div class="grid md:grid-cols-2 gap-2 text-sm">
                    ${[
                      'Pursue as a Grievance',
                      'Handle personally or delegate to',
                      'Pursue as a Complaint',
                      'Outside agency issue (agency name)',
                      'Referred for further information',
                      'Referred for further action (date)'
                    ].map(item => `
                      <div class="flex flex-col gap-1">
                        <span class="text-gray-700">${item}</span>
                        <div class="grid grid-cols-2 gap-2">
                          <input type="text" class="border border-gray-300 rounded px-2 py-1" placeholder="Details" />
                          <input type="date" class="border border-gray-300 rounded px-2 py-1" />
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </section>

            <section class="bg-white border border-gray-200 rounded-lg shadow-sm grievance-section">
              <div class="px-4 py-3 bg-primary text-white rounded-t-lg flex items-center gap-2">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span class="font-semibold text-sm">Section 4 — Timeline Tracking</span>
              </div>
              <div class="p-4 grid gap-4">
                ${[1,2,3,4,5].map(idx => `
                  <div class="grid gap-3 border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <p class="text-xs font-bold text-primary uppercase">Step ${idx}</p>
                    <div class="grid md:grid-cols-2 gap-2">
                      ${[
                        'Date filed / event occurred / discovered',
                        'Deadline for initial filing',
                        'Date of grievance meeting',
                        'Deadline for written response',
                        'Date of management response',
                        'Deadline for filing next level',
                        ...(idx === 4 ? ['Deadline for arbitration notice'] : [])
                      ].map(label => `
                        <div class="grid gap-1">
                          <label class="text-xs font-semibold text-gray-700">${label}</label>
                          <input type="date" class="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          </form>
        </div>
        <div class="px-5 py-3 border-t border-gray-200 bg-white flex justify-end gap-3 grievance-actions">
          <button id="grievance-cancel-btn" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
          <button id="grievance-save-btn" class="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primaryDark transition shadow-md">Submit Form</button>
        </div>
      </div>
    `
    document.body.appendChild(modal)

    const closeModal = () => modal.classList.add('hidden')
    const printModal = () => {
      document.body.classList.add('printing-grievance')
      modal.classList.remove('hidden')
      window.print()
      setTimeout(() => document.body.classList.remove('printing-grievance'), 200)
    }

    pillButton?.addEventListener('click', () => modal.classList.remove('hidden'))
    modal.querySelector('#grievance-close-btn')?.addEventListener('click', closeModal)
    modal.querySelector('#grievance-cancel-btn')?.addEventListener('click', closeModal)
    modal.querySelector('#grievance-print-btn')?.addEventListener('click', printModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal()
    })

    const todayDate = document.getElementById('today-date')
    if (todayDate) {
      todayDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return { initialize };
})();
