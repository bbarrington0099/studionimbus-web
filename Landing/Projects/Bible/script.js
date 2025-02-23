const books = document.getElementById('books');
const scripture = document.getElementById('scripture');

const rootUrl = 'https://api.scripture.api.bible/v1/bibles';
const apiKey= '371751d0e19a50850be87d5fb8b7bf44';
const bibleId = 'de4e12af7f28f599-02';

const chapterArray = [];

const Book = class {
    constructor(name, chapters) {
        this.name = name;
        this.chapters = chapters;
    };

    createBook() {
        const bookEl = document.createElement('details');
        const chapterContainerEl = document.createElement('div');
        chapterContainerEl.setAttribute('class', 'chapterContainer')
        bookEl.setAttribute('class', 'book');
        bookEl.setAttribute('name', 'bookTitle')
        bookEl.id = this.name;
        bookEl.innerHTML = `<summary>${this.name}</summary>`;
        bookEl.appendChild(chapterContainerEl);
        this.chapters.forEach(chapter => {
            if (chapter.number !== 'intro') {
                chapterContainerEl.appendChild(new Chapter(chapter.id, this.name, chapter.number).createChapterBtn());
            }
        });
        return bookEl;
    };
};

const Chapter = class {
    constructor(id, name, number) {
        this.id = id;
        this.name = name;
        this.number = number;
    }

    createChapterBtn() {
        const chapterEl = document.createElement('button');
        chapterEl.setAttribute('class', 'chapterBtn');
        chapterEl.setAttribute('data-chapterNumber', this.number);
        chapterEl.setAttribute('data-book', this.name);
        chapterEl.setAttribute('onclick', `showVerses('${this.id}')`);
        chapterEl.innerHTML = this.number;
        chapterEl.id = this.id;
        chapterArray.push(chapterEl.id);
        return chapterEl;
    }

    createNextChapterBtn() {
        const nextChapterEl = document.createElement('button');
        nextChapterEl.disabled = true;
        nextChapterEl.setAttribute('class', 'changeChapterBtn nextChapterBtn');
        nextChapterEl.id = (chapterArray[chapterArray.indexOf(this.id) + 1]);
        const nextChapterId = nextChapterEl.id;
        nextChapterEl.setAttribute('onclick', `showVerses('${nextChapterId}')`);
        nextChapterEl.innerHTML = `NEXT`;
        return nextChapterEl;
    }

    createPrevChapterBtn() {
        const prevChapterEl = document.createElement('button');
        prevChapterEl.disabled = true;
        prevChapterEl.setAttribute('class', 'changeChapterBtn prevChapterBtn');
        prevChapterEl.id = (chapterArray[chapterArray.indexOf(this.id) - 1]);
        const prevChapterId = prevChapterEl.id;
        prevChapterEl.setAttribute('onclick', `showVerses('${prevChapterId}')`);
        prevChapterEl.innerHTML = `PREV`;
        return prevChapterEl;
    }
};

const Verse = class {
    constructor(id, content) {
        this.id = id;
        this.content = content;
    }
        
    createVerse() {
        const verseEl = document.createElement('p');
        verseEl.setAttribute('class', 'verse');
        verseEl.id = this.id;
        verseEl.innerHTML = `${this.content.split('¶')[1] ? `<br>&nbsp;&nbsp;&nbsp;&nbsp;<strong>${this.id.split('.')[2]}</strong>${this.content.split('¶')[1]}`  : `<strong>${this.id.split('.')[2]}</strong>${this.content}`}`
        return verseEl;
    }
};

const init = async () => {
    await getBooks();
    showVerses((localStorage.getItem('savedChapter') ? localStorage.getItem('savedChapter') : chapterArray[0]))  
}

const getBooks = async () => {
    await fetch(`${rootUrl}/${bibleId}/books?include-chapters=true`, {
        method: 'GET',
        headers: {
            'api-key': `${apiKey}`,
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('Response not ok')
            }
            return res.json()
        })
        .then(data => {
            for (let book of data.data) {
                books.appendChild(new Book(book.name, book.chapters).createBook());
            }
        })
        .catch(error => books.innerHTML = `${error}`);
};

const showVerses = async (chapterId) => {
    (document.querySelectorAll('.chapterBtn')).forEach(btn => {
        btn.disabled = true
    })
    scripture.innerHTML = '';
    const thisChapter = document.getElementById(`${chapterId}`);
    const chapterNumber = thisChapter.getAttribute('data-chapterNumber');
    const book = thisChapter.getAttribute('data-book');
    await fetch(`${rootUrl}/${bibleId}/chapters/${chapterId}/verses`, {
        method: 'GET',
        headers: {
            'api-key': `${apiKey}`,
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('Response not ok')
            }
            return res.json()
        })
        .then(data => {
            if (chapterArray.indexOf(chapterId) !== 0) {
                scripture.appendChild((new Chapter(thisChapter.getAttribute('id'), thisChapter.getAttribute('name'), thisChapter.getAttribute('number'))).createPrevChapterBtn());
            }
            if (chapterArray.indexOf(chapterId) !== chapterArray.length - 1) {
                scripture.appendChild((new Chapter(thisChapter.getAttribute('id'), thisChapter.getAttribute('name'), thisChapter.getAttribute('number'))).createNextChapterBtn());
            }
            scripture.innerHTML += `<h1>${book}: ${chapterNumber}</h1>`;
            scripture.innerHTML += `<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
            getVerse(data);
        });
    localStorage.setItem('savedChapter', `${chapterId}`);
};
    
const getVerse = async (data) => {
    for (let verse of data.data) {
        await fetch(`${rootUrl}/${bibleId}/verses/${verse.id}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false`, {
            method: 'GET',
            headers: {
                'api-key': `${apiKey}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Response not ok')
                }
                return res.json()
            })
            .then(data => {
                scripture.appendChild(new Verse(data.data.id, data.data.content).createVerse());
            });
    }
    if (document.querySelector('.nextChapterBtn') !== null) {
        document.querySelector('.nextChapterBtn').disabled = false;
    }
    if (document.querySelector('.prevChapterBtn') !== null) {
        document.querySelector('.prevChapterBtn').disabled = false;
    }
    (document.querySelectorAll('.chapterBtn')).forEach(btn => {
        btn.disabled = false
    })
};
