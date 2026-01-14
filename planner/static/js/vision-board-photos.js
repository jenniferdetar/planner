(function () {
  function ensureLayout(photo) {
    if (photo.layout) return photo;
    return { ...photo, layout: { rotate: 0, colSpan: 1, rowSpan: 1 } };
  }

  const DEFAULT_PHOTOS_BY_KEY = {
    'vision-board:living-space': [
      {
        src: '../images/a51a3cb703d652fc98e070537590f454.jpg',
        name: 'Living space inspiration'
      },
      {
        src: '../images/19146f688d799890f789efe49e40d4b2.jpg',
        name: 'Living space inspiration'
      }
    ],
    'vision-board:professional-growth': [
      { src: '../images/1.-Farmhouse-Heritage-Study-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/2.-Woodland-Retreat-Office-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/4.-Cottage-Core-Corner-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/5.-Industrial-Rustic-Fusion-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/8.-Stone-Timber-Study-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/9.-Rustic-Loft-Library-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/10.-Lodge-Style-Workspace-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/12.-Canyon-Rock-Workspace-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/13.-Artisan-Workshop-Office-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/14.-Rustic-French-Country-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/17.-Mountain-View-Office-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/18.-Ranch-House-Study-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/21.-Rustic-Blue-Barn-Office-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/23.-Rustic-Boho-Study-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' },
      { src: '../images/24.-Textured-Timber-Suite-Rustic-Home-Office-Ideas-1.png', name: 'Professional growth inspiration' }
    ]
  };

  function readPhotos(storageKey) {
    try {
      const data = opusStorage.getMetadata(storageKey) || [];
      if (!Array.isArray(data)) return [];
      return data.map((photo) => ensureLayout(photo));
    } catch (err) {
      return [];
    }
  }

  function writePhotos(storageKey, photos) {
    opusStorage.updateMetadata(storageKey, photos);
  }

  function renderGrid(grid, photos, emptyText) {
    grid.innerHTML = '';
    if (!photos.length) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'vision-photo-empty';
      emptyEl.textContent = emptyText || 'Add photos to build your vision board.';
      grid.appendChild(emptyEl);
      return;
    }

    photos.forEach((photo, index) => {
      const card = document.createElement('div');
      card.className = 'vision-photo-card';
      if (photo.layout) {
        card.style.setProperty('--vision-rotate', photo.layout.rotate + 'deg');
      }

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.name || 'Vision board photo';
      card.appendChild(img);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'vision-photo-remove';
      removeBtn.textContent = 'Remove';
      removeBtn.dataset.index = String(index);
      card.appendChild(removeBtn);

      grid.appendChild(card);
    });
  }

  function initVisionPhotoBoard(options) {
    if (!options) return;
    const input = document.getElementById(options.inputId);
    const grid = document.getElementById(options.gridId);
    if (!input || !grid) return;

    const storageKey = options.storageKey || 'vision-board:photos';
    let photos = readPhotos(storageKey);
    if (!photos.length && DEFAULT_PHOTOS_BY_KEY[storageKey]) {
      photos = DEFAULT_PHOTOS_BY_KEY[storageKey].map((photo) =>
        ensureLayout(photo)
      );
      writePhotos(storageKey, photos);
    } else {
      writePhotos(storageKey, photos);
    }
    renderGrid(grid, photos, options.emptyText);

    const uploadBtn = document.querySelector(
      '[data-vision-upload="' + options.inputId + '"]'
    );
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => input.click());
    }

    input.addEventListener('change', (event) => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;

      const readers = files
        .filter((file) => file.type && file.type.startsWith('image/'))
        .map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ src: reader.result, name: file.name });
            };
            reader.readAsDataURL(file);
          });
        });

      Promise.all(readers).then((results) => {
        photos = photos.concat(results.map((photo) => ensureLayout(photo)));
        writePhotos(storageKey, photos);
        renderGrid(grid, photos, options.emptyText);
      });

      input.value = '';
    });

    grid.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains('vision-photo-remove')) return;

      const index = Number(target.dataset.index);
      if (Number.isNaN(index)) return;
      photos.splice(index, 1);
      writePhotos(storageKey, photos);
      renderGrid(grid, photos, options.emptyText);
    });
  }

  window.VisionPhotoBoard = {
    init: initVisionPhotoBoard
  };
})();

