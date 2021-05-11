require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const path = require("path");
const csurf = require("csurf");
const app = express();
// const rateLimit = require("express-rate-limit");
const server = require("http").createServer(app);
// const cors = require("cors");
const socket = require("socket.io");
const db = require("./config/db");
const PORT = process.env.PORT || 3000;
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
require("./config/passport")(passport);
const expressFileUpload = require("express-fileupload");
const { sanitize_message } = require("./services/xss_sanitize");
app.use(expressFileUpload());


const imageFolder = __dirname + "/public";

module.exports = imageFolder;

app.use(flash());
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,  // ako je true ne moze da se pristupi connect.sid tj cookie sa js ako je false moze da se pristupi
        //secure:true //only available in HTTPS protocol
    }
}));
app.use(passport.initialize());
app.use(passport.session());
const csrfMiddleware = csurf({
    cookie: false
});
app.disable('x-powered-by');
app.use(csrfMiddleware);
// const limiter = rateLimit({
//     windowMs: 3 * 60 * 1000, //3 minutes in milliseconds
//     max: 3, // max 3 requests
//     message: 'You have exceeded the 3 requests in 3 minutes limit!', 
// });
// app.use("/login",limiter)
// app.use(cors());
app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.unfollow_message = req.flash('unfollow_message');
    res.locals.orange_message = req.flash("orange_message");
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals._csrf = req.csrfToken(); // available to every view
    next();
});

app.set("view engine", "hbs");

app.use(express.static(path.join(__dirname,"public")));
app.use(express.static(path.join(__dirname,"public","images")));
app.use(express.static(path.join(__dirname,"public")));
app.use("/public", express.static(__dirname + '/public'));
app.use("/styles", express.static(__dirname + '/public'));
app.use("/images", express.static(__dirname + '/public/images'));


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('views', "public/views");

hbs.registerPartials(__dirname + "/public/views/components");
hbs.registerHelper('cutDate', function (date) {
    const slicedDate = date.toString().slice(0, 15);
    return slicedDate;
});
hbs.registerHelper("isEqual", function (par1, par2, options) {
    if (par1 === par2) { return options.fn(this); }
    return options.inverse(this);
});

hbs.registerHelper("isDoubleEqual", function (par1, par2, par3, par4, options) {
    if (par1 === par2 || par3 === par4) { return options.fn(this); }
    return options.inverse(this);
});

app.use("/", require("./routes/home"));
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));
app.use("/admin", require("./routes/admin"));
// ovo ce biti izvrseno tek nakon sto se ove 4 gore izvrse tj ako
// ne prodje nijedna od njih 
app.use((req,res)=>{
    res.status(404);
    res.render("404.hbs");
});

// db.authenticate()
//     .then(() => {
//         console.log("Connected do database. ");
//         server.listen(PORT, (err) => {
//             if (err) { console.log(err); }
//             console.log("Server is running on port:" + PORT);
//         });
//     }).catch((err) => {
//         console.log("There was an error in connecting do database-> " + err);
//     });

server.listen(PORT, (err) => {
                if (err) { console.log(err); }
                console.log("Server is running on port:" + PORT);
            });

const io = socket(server);

io.on('connection', (socket) => {
    //console.log(`User with socket id ${socket.id} made socket connection`);
    //Public chat
    socket.on('public-chat', async (data) => {
        data.message = await sanitize_message(data.message);
        io.emit('public-chat', data);
    });
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });
    socket.on('stop-typing', (data) => {
        socket.broadcast.emit('stop-typing');
    });
    //End public chat
    //Private chat
    socket.on('joinRoom', (data) => {
        socket.join(data.roomId);
    });
    socket.on('private-chat', async (data) => {
        //socket.broadcast.to()
        // socket.to(data.roomId).emit('private-chat', data);
        data.message = await sanitize_message(data.message);
        io.emit('private-chat', data);

    });
    //End private chat
    socket.on('disconnect', () => {
        //console.log(`User with socket id ${socket.id} disconnected`);
    });
});

