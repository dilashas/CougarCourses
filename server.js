//npm i express body-parser mongoose
//npm i express-session passport passport-local passport-local-mongoose

const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//Add sessions
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

//Configure body-parser and set static dir path.
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

//Initialize passport
app.use(session({
    secret: "alongsecretonlyiknow_asdlfkhja465xzcew523",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Configure Mongoose
mongoose.connect('mongodb://localhost:27017/courseDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);


const courseSchema = {
    CRN: String,
    Course_num: String,
    Sc: String,
    Title: String,
    Attribute: String,
    Units: String,
    CAP:String,
    Enr: String,
    Instructor: String,
    Modality: String,
    Days: String,
    Times: String,
    Room: String
};

const plsSchema = new mongoose.Schema({
    name: String,
    attribute: String,
})

const projectSchema = new mongoose.Schema({
        project_name: String,
        area: String,
        people: String,
        location:String,
        description: String,
        posted_by: String,
        posted_email: String
    }
)
const Project = mongoose.model('project', projectSchema);
projectlist = []



const Course = mongoose.model('Course', courseSchema);
const CScourse = mongoose.model('CScourse', courseSchema);
const PLScourse = mongoose.model('PLScourse', plsSchema);

const userSchema= new mongoose.Schema(
    {
        username:{
            type: String,
            unique: true,
            require: true,
            minlength: 3
        },
        password:{
            type: String,
            require: true
        },
        fullname:{
            type: String,
            require: true
        }
    }
);

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

//Configure passport
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.listen(3000, function () {
    console.log("server started at 3000");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/.html");
});

app.get('/get_current_user', function (req,res){
    if(req.isAuthenticated()){
        console.log(req.user);
        res.send({
            message:"success",
            data:req.user
        });
    } else{
        res.send({
            message: "no login",
            data:{}
        })
    }
});

app.get("/get_all_courses", function (req, res) {
    // console.log(courseSchema)
    Course.find(function (err, data) {
        console.log(data)
        if (err) {
            res.send({
                "message": "error",
                "data": []
            });
        } else {
            res.send({
                "message": "success",
                "data": data
            })
        }
    });
});

app.get("/get_cs_courses", function (req, res) {
    // console.log(courseSchema)
    CScourse.find(function (err, data) {
        console.log(data)
        if (err) {
            res.send({
                "message": "error",
                "data": []
            });
        } else {
            res.send({
                "message": "success",
                "data": data
            })
        }
    });
});

app.get("/get_pls_courses", function (req, res) {
    // console.log(courseSchema)
    PLScourse.find(function (err, data) {
        console.log(data)
        if (err) {
            res.send({
                "message": "error",
                "data": []
            });
        } else {
            res.send({
                "message": "success",
                "data": data
            })
        }
    });
});



app.get('/course', function (req, res) {
    res.sendFile(__dirname + "/public/courses.html");
});
app.get('/majorcourse', function (req, res) {
    res.sendFile(__dirname + "/public/CSmajor.html");
});

app.get('/plscourse', function (req, res) {
    res.sendFile(__dirname + "/public/pls.html");
});

app.get('/get_movie_by_id', function (req, res) {
    Movie.findOne({"_id": req.query.movie_id}, function (err, data) {
        if (err) {
            res.send({
                "message": "error",
                "data": {}
            });
        } else {
            res.send({
                "message": "success",
                "data": data
            })
        }
    });
});

app.get('/register', (req, res) => {
    if (req.query.error) {
        res.redirect("/register.html?error=" + req.query.error);
    } else {
        res.redirect("/register.html");
    }
});

app.post('/register', (req, res) => {
    const newUser={username: req.body.username, fullname: req.body.fullname
    };
    User.register(
        newUser,
        req.body.password,
        function(err, user){
            if(err){
                console.log(err);
                res.redirect("/register?error="+err);
            }else{
                //write into cookies, authenticate the requests
                const authenticate = passport.authenticate("local");
                authenticate(req,res, function (){
                    res.redirect("/")
                });
            }
        }
    );

});


app.get('/login', (req, res) => {
    if (req.query.error) {
        res.redirect("/login.html?error=" + req.query.error);
    } else {
        res.redirect("/login.html");
    }
});

app.post('/login', (req, res) => {
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(
        user,
        function(err){
            if(err){
                console.log(err);
                res.redirect('login?error=Invalid username or password');
            }else{
                const authenticate = passport.authenticate(
                    "local",
                    {
                        successRedirect:"/",
                        failureRedirect:"/login?error=Username and password don't match"
                    })
                authenticate(req, res);
            }

        }
    )
});


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


app.get("/edit", (req, res) => {
    //A page can be viewed only after login
    console.log(res.isAuthenticated());
    if(req.isAuthenticated()){
        res.sendFile(__dirname + "/src/movie_edit.html");
    }else{
        res.sendFile(__dirname + "/src/movie_edit.html");
    }
});


app.post('/like_movie', (req, res) => {
    //Users need to login to like a movie
});

//Submit New Project

app.get('/submit_project', (req, res) => {  if (req.isAuthenticated()) {
    res.redirect("/project-submit.html");
} else {
    res.redirect("/login?error=You need to login first")
}
});

app.post('/new-project',(req, res) => {
    const project = {
        project_name: req.body.project_name,
        area: req.body.area,
        people: req.body.people,
        location: req.body.location,
        description: req.body.description,
        posted_by:loginName,
        posted_email: loginEmail
    }
    console.log("save: " + req.body._id)
    const np = new Project(project);
    np.save(
        (err, new_project) =>{
            if (err){
                console.log(err["message"]);
                res.redirect("/project-submit.html?error_message=" + err["message"] + "&input=" + JSON.stringify(project))
            }else{
                console.log(new_project._id);
                res.redirect("/project.html");
            }
        })

});

app.get("/get_projects_by_filter", (req, res) => {
    let sk = req.query.search_key;
    console.log(sk);
    Project.find({
        $and: [
            {project_name: {$regex: sk}}
        ]
    }, (err, data) =>{
        if (err) {
            res.send(
                {
                    "message": "db_error",
                    "data": []
                })
        } else {
            res.send({
                "message": "success",
                "data": data
            })
        }
        console.log(data);
    });
});

app.get('/submit_project', (req, res) => {  if (req.isAuthenticated()) {
    res.redirect("/project-submit.html");
} else {
    res.redirect("/login?error=You need to login first")
}
});