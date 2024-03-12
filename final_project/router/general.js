const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios').default;

const doesExist = (username)=>{
    let users_with_same_name = users.filter((user)=>{
      return user.username === username
    });
    if(users_with_same_name.length > 0){
      return true;
    } else {
      return false;
    }
}  

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});  
});

// Get the book list available in the shop
const promise1 = new Promise((resolve, reject) => {
    try {
        public_users.get('/',function (req, res) {
            resolve(res.send(JSON.stringify(books,null,4)));
        });
    } catch (err) {
        reject(err)
    }
});

// Get book details based on ISBN
const promise2 = new Promise((resolve, reject) => {
    try {
        public_users.get('/isbn/:isbn',function (req, res) {
            const isbn = req.params.isbn;
            resolve(res.send(books[isbn]));
        });
    } catch (err) {
        reject(err)
    }
});

// Get book details based on author
const connectToURL = (url)=>{
    const req = axios.get(url);
    req.then(resp => {
        public_users.get('/author/:author',function (req, res) {
            let filtered_authors = [];
            var keys = Object.keys(books);
            let i = 0;
            let j = 0
            while(i < keys.length) {
                if(books[keys[i]].author === req.params.author) {
                    filtered_authors[j] = books[keys[i]];
                    j++;
                }
                i++;
            }
            res.send(filtered_authors)
        });
    })
    .catch(err => {
        console.log(err.toString())
    });
}

connectToURL('https://jnamg1998-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/')

// Get book details based on title
const connectToURL1 = (url)=>{
    const req = axios.get(url);
    req.then(resp => {
        public_users.get('/title/:title',function (req, res) {
            let filtered_titles = [];
            var keys = Object.keys(books);
            let i = 0;
            let j = 0
            while(i < keys.length) {
                if(books[keys[i]].title === req.params.title) {
                    filtered_titles[j] = books[keys[i]];
                    j++;
                }
                i++;
            }
            res.send(filtered_titles)
        });
    })
    .catch(err => {
        console.log(err.toString())
    });
}

connectToURL1('https://jnamg1998-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/')

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews)
});

module.exports.general = public_users;