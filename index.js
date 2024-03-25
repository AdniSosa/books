import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "capstone5",
  password: "BD1234",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function fetchImage(url) {
  const img = new Image();
  return new Promise((res, rej) => {
      img.onload = () => res(img);
      img.onerror = e => rej(e);
      img.src = url;
  });
}


let books = [];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id ASC");
    books = result.rows;
  
    const isbn = books.isbn;
    const img = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
    
    /*const w = img.width;
    const h = img.height;*/
    res.render("index.ejs", {
      listBooks: books,
      bookCover: img
    });
   
  } catch (err) {
    console.log(err);
  }
  

});

app.post("/new", async (req, res) => {
  
  const title = req.body.newTitle;
  const rating = req.body.newRating;
  const date =  req.body.newDate;
  const summary = req.body.newSummary;
  const cover = req.body.newISBN;
  try {
    await db.query("INSERT INTO books (title, rating, date, summary, isbn) VALUES (($1), $2, ($3), ($4), ($5));", [title, rating, date, summary, cover]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }

});

app.post("/add", async (req, res) => {
  
  if (req.body.newEntry === "Add a new entry +") {
    res.render("new.ejs");
  } else {
    res.redirect("/");
  }
});

app.post("/filter", async (req, res) => {
  const ratingClic = req.body.select;
  try {
        
    if (ratingClic === "Rating") {

      const result = await db.query("SELECT * FROM books ORDER BY rating DESC");
      books = result.rows;
      
      const isbn = books.isbn;
      const img = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
      
      res.render("index.ejs", {
      listBooks: books,
      bookCover: img});
      
  } else if (ratingClic === "ascending") {
      const result = await db.query("SELECT * FROM books ORDER BY date ASC");
      books = result.rows;
      
      const isbn = books.isbn;
      const img = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
      
      res.render("index.ejs", {
      listBooks: books,
      bookCover: img});
      
  
} else {
  const result = await db.query("SELECT * FROM books ORDER BY date DESC");
  books = result.rows;
  
  const isbn = books.isbn;
  const img = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
  
  res.render("index.ejs", {
  listBooks: books,
  bookCover: img});
  
}
} catch (err) {
  console.log(err);
}
});

app.post("/edit", async (req, res) => {
  const id = req.body. updatedId;
  const editTitle = req.body.updatedTitle;
  const editAuthor = req.body.updatedAuthor;
  const editRating = req.body.updatedRating;
  const editDate =  req.body.updatedDate;
  const editSummary = req.body.updatedSummary;
  try {
    await db.query("UPDATE books SET title = ($1), author = ($2), rating = $3, date = $4, summary = ($5) WHERE id = $6", [editTitle, editAuthor, editRating, editDate, editSummary, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body["deleteBook"];
  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
