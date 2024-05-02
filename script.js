const http = require('http');
const url = require('url');
// const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

let books = [];
let ids = [0];

const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if(pathname === '/books' && req.method === 'GET') {
        if(books.length == 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: "No books found."
            }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(books));
        }
    } else if(pathname === '/book' && req.method === 'POST') {
        let body = "";
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const bookData = JSON.parse(body);
            const newBook = createBook(bookData.name, bookData.description);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newBook));
        })

    } else if(pathname.startsWith('/book/') && req.method === 'GET') {
        const bookId = pathname.split('/')[2];
        console.log(bookId);
        const book = getBookById(bookId);
        if(book) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(book));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Book Not Found" }))
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: "Endpoint not found"
        }));
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