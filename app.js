const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const categoryRoute = require('./router/category');
const productRoute = require('./router/product');
const productDetailRoute = require('./router/productdetail');
const restaurantRoute = require('./router/restaurant');
const folderRoute = require('./router/folder');
const userRoute = require('./router/user');
const toppingRoute = require('./router/topping');
const orderRoute = require('./router/order');
const orderTestRoute = require('./router/ordertest');
const clickRoute = require('./router/click');
var fs = require('fs');
const userModel = require("./model/userModel");

const sseRoute = require("./router/sse");
// const SSE = require("express-sse");
// -------------------------------------
// -----------------------------
// redis

const redis = require('redis');
(async () => {
    const client = redis.createClient({
      url: `redis://127.0.0.1:6379`,
    });
  
    client.on("error", (err) => console.log("Redis Client Error", err));
  
    await client.connect();
  
    await client.set("key", "value");
    console.log("Redis Connected!")
    const value = await client.get("key");
    console.log(value);
  })();

// const client = redis.createClient(6379, '127.0.0.1');
// client.on('error', err => {
//     console.log('Error ' + err);
// });
// client.on('connect', err => {
//     console.log('connect ted redis');
// });
// client.set("name", "Flavio")
// client.set('test1', 'test resul');
// ---------------------------

const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, {
    pingTimeout: 30000,
    cors:{origin: ['GET, POST']}

});

// server.listen(3000);
// ----------------------------------
app.use(cors());

const multer = require('multer');
const path = require('path');
// const { Console } = require("console");

var storage = multer.diskStorage({
    destination: async (req, file, cb) => {

   
        cb(null, __dirname + req.body.imageFoldeStore );
    },
    filename: function (req, file, cb){
     



        if (typeof req.body.productName === 'undefined' && typeof req.body.productDetailName === 'undefined')
         { 
            cb (null, req.body.restaurantName +Date.now() + path.extname(file.originalname))
            
            }
            else if (typeof req.body.productDetailName === 'undefined')
            {
                cb (null, req.body.restaurantName + req.body.productName +Date.now() + path.extname(file.originalname)  )
            } else

         {cb (null, req.body.restaurantName + req.body.productName + req.body.productDetailName  +Date.now() + path.extname(file.originalname)  ), console.log('22222222')};
    }
});

let upload = multer({storage: storage});

app.use("/uploads", express.static("uploads"));

// app.post("/upload",upload.single("image"),(req, res )=>{
//     if(typeof req.file === "undefined" || req.file == null){
//         return res.status(422).send("choose image");
//     }
//     let file = req.file;

    
//     return res.status(200).send({imagelink: file.path});
// } );


app.use("/upload",upload.single("image"),(req, res )=>{
    console.log("upload app.use");
    if(typeof req.file === "undefined" || req.file == null){
        return res.status(422).send("choose image");
    }

    // console.log('req.file.path')
    // console.log(req.file.path)
    // console.log('__dirname ')
    // console.log(__dirname )
    return res.status(200).send({imagelink: req.file.path});
} );
app.use(express.json({extended: false}));
// mongoose.connect("mongodb+srv://jwttest1:jwttest1@cluster0.kd5vw.mongodb.net/myFirstDatabasetest?retryWrites=true&w=majority", ()=>{
//     console.log("connect to mongdb");
// });
const url = 'mongodb://localhost:27017/onlinebooking';
mongoose.connect(url, ()=>{
    console.log("connection to local database");
});

app.use('/upload' ,express.static("uploads"));

app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/productdetail", productDetailRoute);
app.use("/restaurant", restaurantRoute);
app.use("/folder", folderRoute);
app.use("/user", userRoute);
app.use("/topping", toppingRoute);
app.use("/order", orderRoute);
app.use("/ordertest", orderTestRoute);
app.use("/click", clickRoute);

app.use( sseRoute);
// app.listen("3000", ()=> {
//     console.log("Server running")
// }
// );

// -------------------
//  to check

// Exploring Array ForEach
// Exploring Array Map
// Exploring Array Filter
// Exploring Array Reduce
// Exploring Array Some (you’re here)
// Exploring Array Every
// Exploring Array Find
// ----------------------------------------
user =   userModel.find();
var clientOnline = {};
// ----------------------------------------
// check cileint user log co trong client online vaf add neu khong co
const addUser = (userId, socketId) => {
   if(!clientOnline.hasOwnProperty(userId)) {
    clientOnline[userId] = socketId;
    // console.log(clientOnline.hasOwnProperty(userId))
    // console.log('check clien on line user co ton tai va add vao map')
   }
     
  };

 
  // ----------------------------------------
// remove user form client online
//   const removeUser = (socketId) => {
//     clientOnline = clientOnline.filter((user) => user.socketId !== socketId);
//   };

  // ----------------------------------------

  const getUser = (userId) => {
    return clientOnline.get(userId);
  };


 
    // ----------------------------------------



io.on('connection', async (client) => { 
    console.log('connection on sdflkgjdsflasdfasdfsadfsadf')
//------------------------------
   // add user to online list
    client.on('add_user', async (userId) =>{

        addUser(userId, client.id);
     
    } );
   // ----------------------------------------
// send order to restaurantOner
client.on('send_order', async (data) =>{
    console.log('send_order')
    // console.log(data['restaurantownerId'])
    // console.log(data['orderId'])
// console.log(clientOnline[ restaurantOnwnerId])
 
 
    io.to(clientOnline[data['restaurantownerId'] ]) .emit('receiveOrder', {'orderId':data['orderId'] });
} );

//  send to specit user

client.on('sendMessage', async (data) => {

    io.to(clientOnline[ data['receiveId']]) .emit('getmessage', {'order': 'searchOrder' });
});

   // ----------------------------------------

client.on('xac_nhan_don_hang', async (data) => {

        io.to(clientOnline[ data['receiveId']]) .emit('xac_nhan_don_hang', {'order': 'searchOrder' });
    });

    client.on('tu_choi_don_hang', async (data) => {

        io.to(clientOnline[ data['receiveId']]) .emit('tu_choi_don_hang', {'lydo':  data['lydo']});
    });
      // ----------------------------------------

      client.on('disconnect', () => {
        // removeUser(client.id);
    });
        // ----------------------------------------

});
// ----------------------------------------
server.listen(3000, ()=> {
    console.log("Server running")
});



