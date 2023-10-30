//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const username = "sarveshbxr23";
const password = encodeURIComponent("Upadhyay@123"); // URL-encode the password
const clusterURL = "sarveshcluster.zqfbbn0.mongodb.net";
const databaseName = "ToDoList";

const url = `mongodb+srv://${username}:${password}@${clusterURL}/${databaseName}`;

mongoose.connect(url);

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDo List",
});

const item2 = new Item({
  name: "Hit the + button to add new items",
});

const item3 = new Item({
  name: "Click the checkboxes to delete an item",
});

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];

app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function () {
        console.log("Saved the items successfully");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving items from the database.");
  }
});

app.get("/:customListName", async function (req, res) {
  try {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName }).then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// app.post("/", function (req, res) {
//   const itemName = req.body.newItem;
//   const item = new Item({
//     name: itemName
//   });

//   item.save();
//   res.redirect("/");

// });

// app.post("/", async function (req, res) {
//   const itemName = req.body.newItem;
//   const listName = req.body.listName;

//   const item = new Item({
//     name: itemName,
//   });

//   try {
//     if (listName === "Today") {
//       await item.save();
//       res.redirect("/");
//     }
//     else {
//       List.findOne({name: listName}).then(function(foundList) {
//         foundList.items.push(item);
//         foundList.save();
//         res.redirect("/" + listName);
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error saving item to the database.");
//   }
// });

app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.listName;

  const item = new Item({
    name: itemName,
  });

  try {
    if (listName === "Today") {
      await item.save();
      res.redirect("/");
    } else {
      // Find the custom list by name
      List.findOne({ name: listName }).then(function (foundList) {
        if (foundList) {
          // If the list exists, add the item to it and save
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + encodeURIComponent(customListName));
        } else {
          // If the list does not exist, create a new list and add the item to it
          const newList = new List({
            name: listName,
            items: defaultItems,
          });
          newList.save();
          res.redirect("/" + listName);
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving item to the database.");
  }
});


app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId).then(function (err) {
    if (!err) {
      console.log("Successfully Deleted Item");
      res.redirect("/");
    }
    res.redirect("/");
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
