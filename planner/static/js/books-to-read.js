(() => {
  const STORAGE_KEY = 'booksToRead';
  const seedBooks = [
    { title: '12 Months to $1 Million', author: 'Ryan Daniel Moran' },
    { title: '40 Rules for Internet Business Success', author: 'Matthew Paulson' },
    { title: '45 Practical and Effective Tips to Generate More Revenue from Your Events', author: 'Silvia Pellegrini' },
    { title: '50 Ways for a Start Up to Raise Investment Using Chat GPT', author: 'The Grumpy Entrepreneur' },
    { title: '7-Day Ketogenic Diet Meal Plan', author: 'Louise Hendon' },
    { title: '80/20 Principle: The Secret to Achieving More with Less', author: 'Richard Koch' },
    { title: 'A Manager\'s Guide to Virtual Teams', author: 'Yael Zofi' },
    { title: 'A Tale of Two Cities', author: 'Charles Dickens' },
    { title: 'All In: How Great Leaders Build Unstoppable Teams', author: 'Mike Michalowicz' },
    { title: 'All It Takes Is a Goal: The 3-Step Plan to Ditch Regret and Tap Into Your Massive Potential', author: 'Jon Acuff' },
    { title: 'Amazon Ads for Books', author: 'Agustin Rubini' },
    { title: 'Amazon FBA: A Step-by-Step Beginners Guide to Selling on Amazon', author: 'James Moore' },
    { title: 'Amazon Seller Pro Tips', author: 'Amy Awol' },
    { title: 'Ancient Home Remedies', author: 'Sarafina Cole' },
    { title: 'Ashes: An Epic Sword & Sorcery Novel', author: 'Paul J. Bennett' },
    { title: 'Awakening the Entrepreneur Within', author: 'Michael E. Gerber' },
    { title: 'Be a Free Range Human', author: 'Marianne Cantwell' },
    { title: 'Because Money Matters: How to Earn More Money as a Freelancer in a Gig Economy', author: 'V. V. Cam' },
    { title: 'Betrayal (Infidelity Book 1)', author: 'Aleatha Romig' },
    { title: 'Biblical Mourning: Encouragement for Those Who Grieve', author: 'John Flavel' },
    { title: 'Bootstrap Brilliance: Securing Self-Funding for a Start-Up Business', author: 'B.B. Wayne' },
    { title: 'Bootstrap Your Way to Success: Low Cost Business Ideas for Entrepreneurs', author: 'Marsha Meriwether' },
    { title: 'Build Like a Woman: The Blueprint for Creating a Business and Life You Love', author: 'Kathleen Griffith' },
    { title: 'Build a Business You Love', author: 'Dave Ramsey' },
    { title: 'Building eCommerce Applications', author: 'Developers from DevZone' },
    { title: 'Business Boutique', author: 'Christy Wright' },
    { title: 'Christians and the Supernatural', author: 'J Stafford Wright' },
    { title: 'Delegation: The Most Important Skills in Business', author: 'Dave Ramsey' },
    { title: 'Do Over: Make Today the First Day of Your New Career', author: 'Jon Acuff' },
    { title: "Don't Drop Ship! A Guide to Starting Your Own Drop Ship Business and Reasons Why You Probably Shouldn't", author: 'Brilliant Building' },
    { title: 'Dropshipping: A Beginners Guide to Dropshipping How to Make Money Online and Build Your Own Online Business', author: 'James Moore' },
    { title: 'E-Myth Mastery: The Seven Essential Disciplines for Building World Class Companies', author: 'Michael E. Gerber' },
    { title: 'Edge of Oblivion', author: 'Abiegail Rose' },
    { title: 'Entrepreneur Mindsets and Habits', author: 'James Moore' },
    { title: "Entrepreneur's Startup Guide", author: 'Entrepreneur Media Inc.' },
    { title: 'Etsy: The Orange Book', author: 'Nick Bishop' },
    { title: 'Five Ingredient Cookbook', author: 'Hannie P. Scott' },
    { title: 'From Paycheck to Purpose', author: 'Ken Coleman' },
    { title: 'Gigged: The End of the Job and the Future of Work', author: 'Sarah Kessler' },
    { title: 'Gone with the Wind', author: 'Margaret Mitchell' },
    { title: "Grimms' Fairy Tales", author: 'Jacob Grimm' },
    { title: 'Guide to Holistic Wellness', author: 'Cody J. Donatus' },
    { title: 'Harmony House', author: 'Ruth Hay' },
    { title: 'Hazardous Duty', author: 'Christy Barritt' },
    { title: 'He Speaks to Me: Preparing to Hear from God', author: 'Priscilla Shirer' },
    { title: 'Heavy Equipment', author: 'Skye Warren' },
    { title: 'Highland Games', author: 'Evie Alexander' },
    { title: "Highlander's Captive", author: 'Mariah Stone' },
    { title: "Hinds' Feet on High Places", author: 'Hannah Hurnard' },
    { title: 'How To Make Money Online: Real Methods for Beginners', author: 'Adam Dragún' },
    { title: 'How to Build a Million Dollar App', author: 'George Berkowski' },
    { title: 'How to Build a World-Class Internet Lead Generation Program', author: 'Peter Geisheker' },
    { title: 'How to Start an Online Business', author: 'Nick Bishop' },
    { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi' },
    { title: 'Instant Pot Cookbook: 101 Delicious Recipes', author: 'Monet Chapin' },
    { title: 'Israel, My Beloved', author: 'Kay Arthur' },
    { title: 'Ketogenic Cookbook for Weight Loss', author: 'Andrew Ross' },
    { title: 'Kickstart Your Internet Business', author: 'Gloria Wilcher' },
    { title: 'Kingdom Business Breakthrough', author: 'Candice Zakariya' },
    { title: 'Lady Maddie', author: 'S. Cinders' },
    { title: 'Limoncello Yellow: A Franki Amato Mystery', author: 'Traci Andrighetti' },
    { title: 'Little Me Big Business: How to Grow Your Small Business, Increase Your Profits & Go Global (in your Pajamas)', author: 'Nadia Finer' },
    { title: 'Mail Order Bride Amelia', author: 'Karla Gracey' },
    { title: 'Manifest $10,000: Learn How to Manifest $10,000 by Using the Law of Attraction and Improving Your Money Mindset', author: 'Cassie Parks' },
    { title: 'Mark of the Lion Gift Collection', author: 'Francine Rivers' },
    { title: 'Midnight Marriage', author: 'Lucinda Brant' },
    { title: 'Own Your Past Change Your Future', author: 'Dr. John Delony' },
    { title: 'Piercing the Darkness', author: 'Frank Peretti' },
    { title: "Praying God's Word for Your Husband", author: 'Kathi Lipp' },
    { title: 'Praying for Your Husband from Head to Toe: A Daily Guide to Scripture-Based Prayer', author: 'Sharon Jaynes' },
    { title: 'Pride and Prejudice', author: 'Jane Austen' },
    { title: 'Purpose and Profit: How Business Can Lift Up the World', author: 'George Serafeim' },
    { title: 'Quitter: Closing the Gap Between Your Day Job & Your Dream Job', author: 'Jon Acuff' },
    { title: 'Redefining Anxiety: What It Is, What It Isn\'t, and How to Get Your Life Back', author: 'Dr. John Delony' },
    { title: 'The Richest Man in Babylon', author: 'George S. Clason' },
    { title: 'Running Remote: Master the Lessons from the World\'s Most Successful Remote-Work Pioneers', author: 'Liam Martin & Rob Rawson' },
    { title: 'Scale of the Dragon: An Epic Dragon Fantasy Adventure', author: 'Richard Fierce' },
    { title: 'Sell Local, Think Global: 50 Innovative Ways to Make Chunk Change and Grow Your Business', author: 'Olga Mizrahi' },
    { title: 'Sense and Sensibility', author: 'Jane Austen' },
    { title: 'Servant of the Crown: Heir to the Crown, Book One', author: 'Paul J. Bennett' },
    { title: 'Side Hustle: From Idea to Income in 27 Days', author: 'Chris Guillebeau' },
    { title: 'Sons of Encouragement', author: 'Francine Rivers' },
    { title: 'Start: Punch Fear in the Face, Escape Average, Do Work That Matters', author: 'Jon Acuff' },
    { title: 'Success Is a Choice: Make the Choices That Make You Successful', author: 'John C. Maxwell' },
    { title: 'Super Simple POD: An A-to-Z Guide to Print on Demand Success', author: 'Amy Harrop' },
    { title: 'Tempered Steel: An Epic Fantasy Adventure', author: 'Paul J. Bennett' },
    { title: 'The $100 Startup: Reinvent the Way You Make a Living, Do What You Love, and Create a New Future', author: 'Chris Guillebeau' },
    { title: 'The 10-Hour Work Month', author: 'Laura Anderson' },
    { title: 'The 21-Day Financial Fast', author: 'Michelle Singletary' },
    { title: "The Absolute Beginner's Guide to HTML and CSS", author: 'Kevin Wilson' },
    { title: 'The Adventures of Pinocchio', author: 'Carlo Collodi' },
    { title: 'The Angel City Rapture', author: 'Miguel Angel Hernandez Jr.' },
    { title: 'The Auschwitz Protocol', author: 'Jack Carnegie' },
    { title: 'The Captive Bride', author: 'Gilbert Morris' },
    { title: 'The Chronicles of Narnia', author: 'C. S. Lewis' },
    { title: "The Complete America's Test Kitchen TV Show Cookbook", author: "America's Test Kitchen" },
    { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas' },
    { title: 'The Gig Is Up', author: 'Olga Mizrahi' },
    { title: 'The Glass Menagerie', author: 'Tennessee Williams' },
    { title: 'The Help', author: 'Kathryn Stockett' },
    { title: 'The Honorable Imposter', author: 'Gilbert Morris' },
    { title: 'The Indentured Heart', author: 'Gilbert Morris' },
    { title: 'The Keto Diet for Weight Loss', author: 'Vincent Miles' },
    { title: "The Pilgrim's Progress", author: 'John Bunyan' },
    { title: 'The Pinnacle Recruitment & Interview Method: 7 Steps to Revealing Candidate Dialogues', author: 'Ozan Dagdeviren' },
    { title: 'The Proximity Principle', author: 'Ken Coleman' },
    { title: 'The Pursuit of God', author: 'A. W. Tozer' },
    { title: 'The Restart Roadmap: Rewire and Reset Your Career', author: 'Jason Tartick' },
    { title: 'The Rich Life', author: 'Madison Getchell' },
    { title: 'The Secret Adversary', author: 'Agatha Christie' },
    { title: 'The Secret Garden', author: 'Frances Hodgson Burnett' },
    { title: "The Small Business Owner's Bible 2024", author: 'Thomas Newton' },
    { title: 'The Sweaty Startup: How to Get Rich Doing Boring Things', author: 'Nick Huber' },
    { title: 'The Treasure Bride', author: 'Rebecca Hagan Lee' },
    { title: 'The Visitation', author: 'Frank E. Peretti' },
    { title: 'This Is My Day! 31 Days of Supernatural Living', author: 'Kayode Tadese' },
    { title: 'This Present Darkness', author: 'Frank Peretti' },
    { title: 'Treasure Island', author: 'Robert Louis Stevenson' },
    { title: 'Triple Shot: Three First-in-Series Mysteries', author: 'Melissa F. Miller' },
    { title: 'Two Awesome Hours: Science-Based Strategies to Harness Your Best Time and Get Your Most Important Work Done', author: 'Josh Davis' },
    { title: 'War and Peace', author: 'Leo Tolstoy' },
    { title: 'Welcome Home to Murder', author: 'Cindy Kline' },
    { title: 'Words of Peace and Welcome', author: 'Horatius Bonar' },
    { title: 'Work LESS Accomplish MORE: 101 Productivity Principles', author: 'Richard & Lynn Voigt' },
    { title: 'Workbook for Rich Dad Poor Dad', author: 'MaxHelp Workbooks' }
  ];

  const normalizeBook = (book) => {
    const title = (book.title || '').trim().toLowerCase();
    const author = (book.author || '').trim().toLowerCase();
    return `${title}|||${author}`;
  };

  const formatBook = (book) => ({
    ...book,
    id: book.id || crypto.randomUUID(),
    completed: !!book.completed
  });

  const form = document.getElementById('books-form');
  const titleInput = document.getElementById('book-title');
  const authorInput = document.getElementById('book-author');
  const shelf = document.getElementById('bookshelf');
  const progressFill = document.getElementById('books-progress-fill');
  const progressText = document.getElementById('books-progress-text');
  const progressPercent = document.getElementById('books-progress-percent');

  if (!form || !titleInput || !authorInput || !shelf) return;

  const loadBooks = () => {
    try {
      const existing = opusStorage.getBooksToRead();

      const merged = [];
      const seen = new Set();

      existing.forEach((book) => {
        const formatted = formatBook(book);
        const key = normalizeBook(formatted);
        if (seen.has(key)) {
          const index = merged.findIndex((item) => normalizeBook(item) === key);
          if (index !== -1 && !merged[index].completed && formatted.completed) {
            merged[index] = { ...formatted, id: merged[index].id || formatted.id };
          }
          return;
        }
        seen.add(key);
        merged.push(formatted);
      });

      seedBooks.forEach((seed) => {
        const formatted = formatBook({ ...seed, completed: false });
        const key = normalizeBook(formatted);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(formatted);
        }
      });

      if (existing.length === 0 && merged.length > 0) {
        saveBooks(merged);
      }
      return merged;
    } catch (err) {
      console.error('Error loading books:', err);
      const seeded = seedBooks.map((book) => formatBook({ ...book, completed: false }));
      return seeded;
    }
  };

  const saveBooks = (books) => {
    opusStorage.setBooksToRead(books);
  };

  const updateProgress = (books) => {
    if (!progressFill || !progressText || !progressPercent) return;
    const total = books.length;
    const completed = books.filter((book) => book.completed).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    progressFill.style.width = `${percent}%`;
    progressFill.parentElement?.setAttribute('aria-valuenow', `${percent}`);
    progressText.textContent = `${completed} of ${total} completed`;
    progressPercent.textContent = `${percent}%`;
  };

  const createBookCard = (book) => {
    const card = document.createElement('div');
    card.className = 'book-spine';
    if (book.completed) {
      card.classList.add('completed');
    }

    const title = document.createElement('div');
    title.className = 'book-spine-title';
    title.textContent = book.title;
    card.appendChild(title);

    if (book.author) {
      const author = document.createElement('div');
      author.className = 'book-spine-author';
      author.textContent = book.author;
      card.appendChild(author);
    }

    const check = document.createElement('span');
    check.className = 'book-spine-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';
    card.appendChild(check);

    const actions = document.createElement('div');
    actions.className = 'book-spine-actions';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'book-check';
    checkbox.checked = !!book.completed;
    checkbox.setAttribute('aria-label', `Mark ${book.title} as read`);
    checkbox.addEventListener('change', () => {
      const updated = loadBooks().map((item) => {
        if (item.id === book.id) {
          return { ...item, completed: checkbox.checked };
        }
        return item;
      });
      saveBooks(updated);
      renderBooks();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'book-remove';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      const updated = loadBooks().filter((item) => item.id !== book.id);
      saveBooks(updated);
      renderBooks();
    });

    actions.appendChild(checkbox);
    actions.appendChild(remove);
    card.appendChild(actions);

    return card;
  };

  const renderBooks = () => {
    const books = loadBooks();
    shelf.innerHTML = '';

    if (!books.length) {
      const empty = document.createElement('div');
      empty.className = 'bookshelf-empty';
      empty.textContent = 'Add your next book and build your reading list.';
      shelf.appendChild(empty);
      updateProgress([]);
      return;
    }

    for (let i = 0; i < books.length; i += 10) {
      const shelfGroup = document.createElement('div');
      shelfGroup.className = 'bookshelf-shelf';

      books.slice(i, i + 10).forEach((book) => {
        shelfGroup.appendChild(createBookCard(book));
      });

      shelf.appendChild(shelfGroup);
    }
    updateProgress(books);
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    if (!title) return;

    const books = loadBooks();
    const newBook = {
      id: crypto.randomUUID(),
      title,
      author,
      completed: false
    };
    const key = normalizeBook(newBook);
    const exists = books.some((book) => normalizeBook(book) === key);
    if (exists) {
      titleInput.value = '';
      authorInput.value = '';
      renderBooks();
      return;
    }

    books.push(newBook);
    saveBooks(books);
    titleInput.value = '';
    authorInput.value = '';
    renderBooks();
  });

  renderBooks();
})();


