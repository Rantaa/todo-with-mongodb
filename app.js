//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require('ejs');
const _ = require('lodash');



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');


const itemSchema = {
  name: String
};

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to your todoList!'
});

const item2 = new Item({
  name: 'Hit the + button to add a new item.'
});

const item3 = new Item({
  name: '<-- Hit this to delete an item.'
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model('List', listSchema);


app.get("/", function (req, res) {

  Item.find(function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully inserted defaultList to DB.')
        }
      });
      res.redirect('/');
    } else {
      res.render("list", { listTitle: 'Today', newListItems: foundItems });
    }
  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const newItem = new Item({
    name: itemName
  });

  newItem.save();
  res.redirect('/')
  
});

app.post("/delete", function(req,res) {
  console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Successfully deleted item from list');
    }
  })
  res.redirect('/')
})

app.get("/:listTitle", function(req, res) {
  const customListTitle = req.params.listTitle
  
  List.findOne({name: customListTitle}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListTitle,
          items:defaultItems
        });
        
        list.save()
        res.render("list", {listTitle: customListTitle, newListItems: defaultItems});
      } else {
        res.render("list", {listTitle: customListTitle, newListItems: foundList.items});
      }
    }
  })


})


// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
