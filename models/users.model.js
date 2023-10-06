const { ObjectId } = require("bson");
const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  borrowedBooks: [
    {
      BookId:String,
      Booktitle:String,
      borrowTime:{
        type:Date,
        default: Date.now
      }, 
    },
  ],
  returnedBooks: [
    {
      BookId:String, 
      Booktitle:String,
      returnTime:{
        type:Date,
        default: Date.now
      }, 
    },
  ],
},{
  versionKey:false
});

const UserModel = mongoose.model("User", UserSchema);

module.exports ={UserModel};
