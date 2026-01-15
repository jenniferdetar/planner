/**
 * Vision Board Module
 * Standardized initialization for all vision board focus pages
 */

const visionPage = {
    initialize: function() {
        console.log('Initializing Vision Board focus page...');
        this.setupDate();
        
        const body = document.body;
        const visionId = body.dataset.visionId;
        const visionTitle = body.dataset.visionTitle || '';
        
        if (!visionId) {
            console.error('Missing data-vision-id on body');
            return;
        }

        // Initialize Photo Board
        if (window.VisionPhotoBoard) {
            window.VisionPhotoBoard.init({
                inputId: `vision-${visionId}-photos`,
                gridId: `vision-${visionId}-photo-grid`,
                storageKey: `vision-board:${visionId}`,
                emptyText: `Add photos that inspire your ${visionTitle.toLowerCase()} goals.`
            });
        }

        // Initialize Form Sync
        if (window.formSync) {
            window.formSync.init({
                storagePrefix: `vision-${visionId}`
            });
        }

        // Initialize Reading Tracker (for Professional Growth)
        this.setupReadingTracker();
    },

    setupReadingTracker: function() {
        const storageKey = 'vision-board:professional-growth:reading';
        const currentBookEl = document.getElementById('reading-current-book');
        const chaptersEl = document.getElementById('reading-chapters-today');
        const notesEl = document.getElementById('reading-notes');

        if (!currentBookEl || !chaptersEl || !notesEl) return;

        const populateChapterOptions = (selectedValue) => {
            chaptersEl.innerHTML = '';
            for (let i = 0; i <= 30; i += 1) {
                const option = document.createElement('option');
                option.value = String(i);
                option.textContent = `${i} chapter${i === 1 ? '' : 's'}`;
                if (selectedValue !== undefined && String(selectedValue) === String(i)) {
                    option.selected = true;
                }
                chaptersEl.appendChild(option);
            }
        };

        const populateBooks = (selectedId, fallbackTitle) => {
            currentBookEl.innerHTML = '';
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Select a business book';
            currentBookEl.appendChild(placeholder);

            const books = opusStorage.getBooksToRead() || [];
            books.forEach(book => {
                const option = document.createElement('option');
                option.value = book.id || book.title || '';
                option.textContent = book.author ? `${book.title} — ${book.author}` : book.title;
                if (selectedId && option.value === selectedId) {
                    option.selected = true;
                }
                currentBookEl.appendChild(option);
            });

            if (fallbackTitle && !currentBookEl.value) {
                const manual = document.createElement('option');
                manual.value = fallbackTitle;
                manual.textContent = fallbackTitle;
                manual.selected = true;
                currentBookEl.appendChild(manual);
            }
        };

        const load = () => {
            try {
                const stored = opusStorage.getMetadata(storageKey) || {};
                populateBooks(stored.bookId, stored.bookTitle);
                populateChapterOptions(typeof stored.chaptersToday === 'number' ? stored.chaptersToday : 0);
                if (stored.notes) notesEl.value = stored.notes;
            } catch (e) {
                populateBooks();
                populateChapterOptions(0);
            }
        };

        const save = () => {
            const selectedOption = currentBookEl.options[currentBookEl.selectedIndex];
            const payload = {
                bookId: currentBookEl.value,
                bookTitle: selectedOption ? selectedOption.textContent : '',
                chaptersToday: chaptersEl.value ? Number(chaptersEl.value) : 0,
                notes: notesEl.value.trim()
            };
            opusStorage.updateMetadata(storageKey, payload);
        };

        [currentBookEl, chaptersEl, notesEl].forEach(el => {
            el.addEventListener('input', save);
            el.addEventListener('change', save);
        });

        load();
    },

    setupDate: function() {
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
};

window.visionPage = visionPage;
