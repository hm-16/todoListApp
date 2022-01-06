const express = require("express");
const bodyParser = require("body-parser"); 
const mongoose = require("mongoose");
const _ =require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs'); 
app.use(express.static("public"));

mongoose.connect("mongodb+srv://harshul-admin:Test123@cluster0.amfs4.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item",itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

const itm1 = new Item({
    name: "Welcome to ToDo List app"
});

const itm2 = new Item({
    name: "Hit + to add new item"
});

const itm3 = new Item({
    name: "<-- Hit this to mark it complete"
});

const defaultItems = [itm1,itm2,itm3];


app.get("/",function(req,res){
    Item.find({},function(err,result){
        if(result.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err) console.log(err);
                else console.log("Successfully inserted to DB");
            });
            res.redirect("/");
        }else{
            res.render("list",{listTitle:"Today",newItems:result});
        }
        
    });
});
app.post("/",function(req,res){
    const itemName = req.body.item;
    const listName = req.body.list;
    const itm = new Item({
        name: itemName
    });
    if(listName ==="Today"){
        itm.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName},function(err,foundList){
            if(!err){
                foundList.items.push(itm);
                foundList.save();
                res.redirect("/"+listName);
            }else{
                console.log(err);
            }
        });
    }
    
});
app.get("/:routeName",function(req,res){
    const customListName = _.capitalize(req.params.routeName);

    List.findOne({name: customListName},function(err,result){
        if(!err){
            if(!result) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else {
                res.render("list",{listTitle: result.name,newItems:result.items});
            }
        }else{
            console.log(err);
        }
    });
    
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server has started sucessfully");
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err) console.log(err);
            else console.log("Deleted successfully , id: "+checkedItemId);
            res.redirect("/");
        });
    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }else{
                console.log(err);
            }
        });
    }
    
    
});