const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

let books = [];
let ids = [0];

const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/books' && req.method === 'GET') {
        if (books.length == 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "No books found." }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(books));
        }
    } else if (pathname === '/book' && req.method === 'POST') {
        let body = "";
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const bookData = JSON.parse(body);
            if (getBookByName(bookData.name.toUpperCase()) == null) {
                const newBook = createBook(bookData.name.toUpperCase(), bookData.description);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newBook));
            } else {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Book already registered" }));
            }
        });
    } else if (pathname.startsWith('/book/') && req.method === 'GET') {
        const bookId = pathname.split('/')[2];
        const book = getBookById(bookId);
        if (book) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(book));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Book Not Found" }));
        }
    } else if (pathname.startsWith('/book/') && req.method === 'PUT') {
        const bookId = pathname.split('/')[2];
        let body = "";
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const bookData = JSON.parse(body);
            const existingBookIndex = books.findIndex(book => book.id == bookId);
            if (existingBookIndex !== -1) {
                books[existingBookIndex] = {
                    id: parseInt(bookId),
                    name: bookData.name.toUpperCase(),
                    description: bookData.description
                };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(books[existingBookIndex]));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Book Not Found" }));
            }
        });
    } else if (pathname.startsWith('/book/') && req.method === 'PATCH') {
        const bookId = pathname.split('/')[2];
        let body = "";
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const bookData = JSON.parse(body);
            const existingBookIndex = books.findIndex(book => book.id == bookId);
            if (existingBookIndex !== -1) {
                const updatedBook = { ...books[existingBookIndex], ...bookData };
                books[existingBookIndex] = updatedBook;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedBook));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Book Not Found" }));
            }
        });
    } else if (pathname.startsWith('/book/') && req.method === 'DELETE') {
        const bookId = pathname.split('/')[2];
        const existingBookIndex = books.findIndex(book => book.id == bookId);
        if (existingBookIndex !== -1) {
            books.splice(existingBookIndex, 1);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Book deleted successfully" }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Book Not Found" }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Endpoint not found" }));
    }
};

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

function createBook(name, description) {
    let id = ids[ids.length - 1] + 1;
    ids.push(id);
    const newBook = { id, name, description };
    books.push(newBook);
    return newBook;
}

function getBookById(id) {
    return books.find(book => book.id == id);
}

function getBookByName(name) {
    return books.find(book => book.name == name);
}
