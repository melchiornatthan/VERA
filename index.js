//Import packages yang diperlukan
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

//meginisialisasi app sebagai express app
const app = express();
const router = express.Router();
const { Client } = require("pg");
const bcrypt = require("bcrypt");
const { response } = require("express");
app.use(
  express.static(
    "C:/Users/Melchior Natthan/Documents/Mirror/SIVITAS AKADEMIKA/SEMESTER 4/SBD/Praktikum/File Proyek"
  )
);
//Melakukan koneksi terhadap database
const db = new Client({
  user: "melchior_sbd",
  host: "melchior-sbd.postgres.database.azure.com",
  database: "vera_database",
  password: "H4s1bu4n",
  port: 5432,
  sslmode: "require",
  ssl: true,
});

//Melakukan koneksi dan menunjukkan indikasi database terhubung atau tidak
//jalankan koneksi ke database
db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Azure Database Connected");
});

//middleware (session)
app.use(
  session({
    secret: "ini contoh secret",
    saveUninitialized: false,
    resave: false,
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

var temp;

//router untuk login dan register user
router.get("/", function (req, res) {
  res.sendFile(__dirname + "/startpage.html");
});
//router untuk login dan register admin
router.get("/admin", function (req, res) {
  res.sendFile(__dirname + "/admin_start.html");
});
//router untuk ke halaman home admin
router.get("/adminhome", function (req, res) {
  temp = req.session;
  if (temp.username) {
    res.sendFile(__dirname + "/admin.html");
  } else {
    res.write("<h1>You need to log in before you can see this page.</h1>");
    res.end(`<a class="fw-bold text-center" href="/admin">Login</a>`);
  }
});

//router untuk ke halaman home user
router.get("/home", (req, res) => {
  temp = req.session;

  if (temp.username) {
    res.write(`<!DOCTYPE html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Home Page</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous" />
      <link href="custom.css" rel="stylesheet" />
    </head>`);

    res.write(
      `<body style="background-color: #F1F1F1;" >
      <nav class="navbar navbar-expand-lg navbar-default navbar-light sticky-top" style="background-color: #556E53;">
    <div class="container-fluid">
    <a class="navbar-brand fw-bold text-white" href="#home">VERA</a>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <a class="nav-link active text-white" aria-current="page" href="#home">Home</a>
          <a class="nav-link text-white" href="#rent">Rent</a>
          <a class="nav-link text-white" href="#history">History</a>
        </div>
      </div>
    </div>
  </nav>
          <div class="container-fluid px-4 py-1 text-center" style="background-color: #F1F1F1;" id="home">
          <h1 class="display-5 fw-bold py-5">Welcome ${temp.username} </h1>
        </div>`
    );

    res.write(
      `<div class="container-fluid px-4 py-5 text-center" id ="rent" style="background-color: #F1F1F1;" id="home">
    <div class="row py-5 my-auto mx-auto">
      <div class="col-sm-12 col-md-4 col-lg-4 mx-auto my-auto">
        <h1 class="display-5 fw-bold py-3 ">Rent Now</h1>
        <input type="number" min="1" max="30" class="form-control w-50 mx-auto" id="days" placeholder="Days" />
        <p class="fw-bold fs-4 py-2 ">Do you wanna include driver</p>
        <form id="drivers">
          <input type="radio" name="driver" value="true" /> Yes <br />
          <input type="radio" name="driver" value="false" /> No<br />
        </form>
      </div>
      <div class="col-sm-12 col-md-8 col-lg-8 py-2 mx-auto my-auto table-wrapper-scroll-y my-custom-scrollbar">
        <table class="table table-hover shadow" style="background-color: F1F1F1;" id=data_vehicle>
          <thead>
            <tr>
              <th>Car Model</th>
              <th>Registration Number</th>
              <th>Avalability</th>
              <th>Select One</th>
            </tr>
          </thead>
        </table>
      </div>
      
    </div>
    <input class="btn btn-primary btn-lg mx-auto my-auto" type="button" value="Book Now" id="book_button" />
  </div>
    `
    );
    res.write(
      // table header
      `<div class="container-fluid px-4 py-5 text-center table-wrapper-scroll-y my-custom-scrollbar" id="history" style="background-color: #F1F1F1;">
       <h1 class="display-5 fw-bold py-3">Booking History</h1>
       <table class="table table-hover shadow" "background-color: #F1F1F1;"  id=data_book>
       <thead>
       <tr>
         <th>Booking ID</th>
         <th>Date Time</th>
         <th>Vehicle ID</th>
         <th>Price</th>
         <th>Driver</th>
       </tr>
     </thead>
       </table>
     </div>`
    );
    res.end(
      `</body>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
        <script>
        var days, driver, vehicle_id, user_id;
     
        jQuery(document).ready(function ($) {
          $.post("/getvehicle", {}, function (data) {
            $("#data_vehicle").html(data);
          });
          $.post("/getbooking", {}, function (data) {
            $("#data_book").html(data);
          });
          
        });
     
        $("#book_button").click(function () {
          days = $("#days").val();
          driver = $("input[name=driver]:checked", "#drivers").val();
          vehicle_id = $('input[name=vehicle]:checked').val()
          $.post(
            "/booking",
            {
              vehicle_id: vehicle_id,
              days: days,
              driver: driver,
              vehicle_id: vehicle_id,

            },
            function (data) {
              if (data === "done") {
                window.alert(vehicle_id);
                window.location.reload();
              } else if (data === "insert") {
                window.alert("Gagal Melakukan Insert");
              } else if (data === "updatecar") {
                window.alert("Gagal Melakukan Update ke Mobil");
              } else if (data === "days") {
                window.alert("Hari Booking Error");
              }
            }
          );
        });
      </script>
    </html>`
    );
    console.log("Data Fetch successful");
    res.write(`<div class="container-fluid px-4 py-2 text-center" style="background-color: #F1F1F1;" id="home">
    <a class="fw-bold text-center" href="/">Click here to log out</a>
  </div>`);
  } else {
    res.write("<h1>You need to log in before you can see this page.</h1>");
    res.end(`<a class="fw-bold text-center" href="/"> Login</a>`);
  }
});

//router untuk melakukan register akun admin
router.post("/registeradmin", async (req, res) => {
  temp = req.session;
  temp.name = req.body.name;
  temp.email = req.body.email;
  temp.phone = req.body.phone;
  temp.username = req.body.username;
  temp.password = req.body.password;
  if (
    temp.username.length > 0 &&
    temp.password.length > 0 &&
    temp.name.length > 0 &&
    temp.email.length > 0 &&
    temp.phone.length > 0
  ) {
    const passwordHash = await bcrypt.hash(temp.password, 10);
    const query = `INSERT INTO admin (name,  email, phonenumber, username, password) VALUES ('${temp.name}', '${temp.email}', '${temp.phone}', '${temp.username}', '${passwordHash}')`;
    db.query(query, (err, result) => {
      if (err) {
        res.send("fail");
      } else {
        res.send("done");
      }
    });
  } else {
    res.send("kosong");
  }
});

//router untuk melakukan register akun user
router.post("/register", async (req, res) => {
  temp = req.session;
  temp.name = req.body.name;
  temp.address = req.body.address;
  temp.email = req.body.email;
  temp.phone = req.body.phone;
  temp.username = req.body.username;
  temp.password = req.body.password;

  if (
    temp.username.length > 0 &&
    temp.password.length > 0 &&
    temp.name.length > 0 &&
    temp.address.length > 0 &&
    temp.email.length > 0 &&
    temp.phone.length > 0
  ) {
    const passwordHash = await bcrypt.hash(temp.password, 10);
    const query = `INSERT INTO users (name, address, email, phonenumber, username, password) VALUES ('${temp.name}', '${temp.address}', '${temp.email}', '${temp.phone}', '${temp.username}', '${passwordHash}')`;
    db.query(query, (err, result) => {
      if (err) {
        res.send("fail");
      } else {
        res.send("done");
      }
    });
  } else {
    res.send("kosong");
  }
});

//Router add vehicle : melakukan tambah mobil baru
router.post("/addvehicle", async (req, res) => {
  temp = req.session;
  temp.reg_number = req.body.reg_number;
  temp.car_model = req.body.car_model;
  temp.avail = req.body.avail;

  //melakukan registrasi vehicle baru ke dalam database
  if (
    temp.reg_number.length > 0 &&
    temp.car_model.length > 0 &&
    temp.avail.length > 0
  ) {
    const query = `INSERT INTO vehicle (registrationnumber, carmodel, availability) VALUES ('${temp.reg_number}', '${temp.car_model}', '${temp.avail}');`;
    db.query(query, (err, result) => {
      if (err) {
        res.send("fail");
      } else {
        res.send("done");
      }
    });
  } else {
    res.send("kosong");
  }
});

//Router add driver : melakukan tambah driver baru
router.post("/adddriver", async (req, res) => {
  temp = req.session;
  temp.name = req.body.driver_name;
  temp.address = req.body.address;
  temp.phonenumber = req.body.phonenumber;

  //melakukan registrasi driver baru ke dalam database
  if (
    temp.name.length > 0 &&
    temp.address.length > 0 &&
    temp.phonenumber.length > 0
  ) {
    const query = `INSERT INTO driver (name, phonenumber, address, status) VALUES ('${temp.name}', '${temp.phonenumber}', '${temp.address}', 'true');`;
    db.query(query, (err, result) => {
      if (err) {
        res.send("fail");
      } else {
        res.send("done");
      }
    });
  } else {
    res.send("kosong");
  }
});

//Router delete user : melakukan delete user
router.post("/deleteuser", async (req, res) => {
  temp = req.session;
  temp.user_id = req.body.user_id;
  //melakukan delete user yang ada dalam database
  const query = `DELETE from users where id = ${temp.user_id};`;
  db.query(query, (err, result) => {
    if (err) {
      res.send("fail");
    } else {
      res.send("done");
    }
  });
});

//Router delete driver : melakukan delete driver
router.post("/deletedriver", async (req, res) => {
  temp = req.session;
  temp.driver_id = req.body.driver_id;
  //melakukan delete driver dalam database
  const query = `DELETE from driver where id = ${temp.driver_id};`;
  db.query(query, (err, result) => {
    if (err) {
      res.send("fail");
    } else {
      res.send("done");
    }
  });
});

//Router delete vehicle : melakukan delete vehicle
router.post("/deletevehicle", async (req, res) => {
  temp = req.session;
  temp.vehicle_id = req.body.vehicle_id;
  //melakukan delete vehicle dalam database
  const query = `DELETE from vehicle where id = ${temp.vehicle_id};`;
  db.query(query, (err, result) => {
    if (err) {
      res.send("fail");
    } else {
      res.send("done");
    }
  });
});

//Router delete booking : melakukan delete booking
router.post("/deletebooking", async (req, res) => {
  temp = req.session;
  temp.booking_id = req.body.booking_id;

  const query = `SELECT vehicleid from booking where id = ${temp.booking_id};`;
  db.query(query, (err, result) => {
    if (err) {
      res.send("fail");
    } else {
      var vehicle_id = result.rows[0].vehicleid;
      const query = `UPDATE vehicle SET availability = 'true' WHERE id = ${vehicle_id};`;
      db.query(query, (err, result) => {
        if (err) {
          res.send("fail");
        } else {
          const query = `SELECT driverid FROM booking WHERE id = '${temp.booking_id}'`;
          db.query(query, (err, result) => {
            if (err) {
              res.send("fail");
            } else {
              var driverid = result.rows[0].driverid;
              const query = `UPDATE driver SET status = 'true' WHERE id = ${driverid};`;
              db.query(query, (err, result) => {
                if (err) {
                  res.send("fail");
                } else {
                  const query = `DELETE from booking where id = ${temp.booking_id};`;
                  db.query(query, (err, result) => {
                    if (err) {
                      res.send("fail");
                    } else {
                      res.send("done");
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

//Router login admin : melakukan login admin
router.post("/loginadmin", (req, res) => {
  temp = req.session;
  temp.username = req.body.username;
  temp.password = req.body.password;
  //melakukan login admin
  if (temp.username.length > 0 && temp.password.length > 0) {
    bcrypt.hash(temp.password, 10, function (err, hash) {
      if (err) {
        res.send(err);
      } else {
        const query = `SELECT username, id, password FROM admin WHERE username = '${temp.username}';`; //query ambil data user untuk login
        //mengecek informasi yang dimasukkan admin apakah terdaftar pada database
        db.query(query, (err, results) => {
          if (results.rowCount < 1) {
            res.end("fail");
          } else {
            bcrypt.compare(
              temp.password,
              results.rows[0].password,
              (err, result) => {
                if (!result) {
                  res.end("password");
                } else {
                  res.end("done");
                }
              }
            );
          }
        });
      }
    });
  } else {
    res.end("kosong");
  }
});

//Router login : melakukan Login
router.post("/login", (req, res) => {
  temp = req.session;
  temp.username = req.body.username;
  temp.password = req.body.password;
  //melakukan login user
  if (temp.username.length > 0 && temp.password.length > 0) {
    bcrypt.hash(temp.password, 10, function (err, hash) {
      if (err) {
        res.send(err);
      } else {
        const query = `SELECT username, id, password FROM users WHERE username = '${temp.username}';`; //query ambil data user untuk login
        //mengecek informasi yang dimasukkan user apakah terdaftar pada database
        db.query(query, (err, results) => {
          if (results.rowCount < 1) {
            res.end("fail");
          } else {
            bcrypt.compare(
              temp.password,
              results.rows[0].password,
              (err, result) => {
                if (!result) {
                  res.end("password");
                } else {
                  res.end("done");
                }
              }
            );
          }
        });
      }
    });
  } else {
    res.end("kosong");
  }
});

//Router booking : melakukan booking
router.post("/booking", async (req, res) => {
  temp = req.session;
  temp.days = req.body.days;
  temp.driver = req.body.driver;
  temp.vehicle_id = req.body.vehicle_id;

  if (temp.driver == "true") {
    const query = `SELECT id from driver WHERE status = true`;
    db.query(query, (err, result) => {
      if (err) {
        res.send("fail");
      } else {
        var driverid = result.rows[0].id;
        const query = `SELECT id FROM users WHERE username = '${temp.username}'`;
        db.query(query, (err, result) => {
          if (err) {
            res.send("fail");
          } else {
            var userid = result.rows[0].id;
            if (temp.days > 0 && temp.days < 31) {
              temp.price = temp.days * 100;
              if (temp.driver == "true") {
                temp.price += 100;
              }

              //melakukan booking
              const query = `INSERT INTO booking (price, date_time, vehicleid, userid, driverid) VALUES ('${temp.price}', current_timestamp,'${temp.vehicle_id}', ${userid}, ${driverid});`;
              db.query(query, (err, result) => {
                if (err) {
                  res.send("insert");
                } else {
                  const query = `UPDATE vehicle SET availability = 'false' WHERE id = '${temp.vehicle_id}'`;
                  db.query(query, (err, result) => {
                    if (err) {
                      res.send("updatecar");
                    } else {
                      const query = `UPDATE driver SET status = 'false' WHERE id = '${driverid}'`;
                      db.query(query, (err, result) => {
                        if (err) {
                          res.send("updatedriver");
                        } else {
                          res.send("done");
                        }
                      });
                    }
                  });
                }
              });
            } else {
              res.send("days");
            }
          }
        });
      }
    });
  } else {
    const query = `SELECT id FROM users WHERE username = '${temp.username}'`;
    db.query(query, (err, result) => {
      if (err) {
        res.send("fail");
      } else {
        var userid = result.rows[0].id;
        if (temp.days > 0 && temp.days < 31) {
          temp.price = temp.days * 100;
          if (temp.driver == "true") {
            temp.price += 100;
          }

          //melakukan booking
          const query = `INSERT INTO booking (price, date_time, vehicleid, userid) VALUES ('${temp.price}', current_timestamp,'${temp.vehicle_id}', ${userid});`;
          db.query(query, (err, result) => {
            if (err) {
              res.send("insert");
            } else {
              const query = `UPDATE vehicle SET availability = 'false' WHERE id = '${temp.vehicle_id}'`;
              db.query(query, (err, result) => {
                if (err) {
                  res.send("updatecar");
                } else {
                  res.end("done");
                }
              });
            }
          });
        } else {
          res.send("days");
        }
      }
    });
  }
});

//Router getuser : mengambil data user yang sedang login
router.post("/getuser", (req, res) => {
  temp = req.session;
  const query = `SELECT id, username, name FROM user WHERE username = '${temp.username}'`;
  db.query(query, (err, result) => {
    if (err) {
      res.send("fail");
    } else {
      res.send(result);
    }
  });
});

//Router booking admin : mendapatkan data booking untuk admin
router.post("/bookingadmin", (req, res) => {
  const query = "SELECT * FROM booking;"; // query ambil data
  //mendapatkan data dari database
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    res.write(`<table class="table table-hover " style="background-color: #F1F1F1;" id=data_vehicle>
                    <form id="bookings">
                    <thead>
                      <tr>
                        <th>Price</th>
                        <th>Date</th>
                        <th>Vehicle ID</th>
                        <th>Driver ID</th>
                        <th>User ID</th>
                        <th>Select One</th>
                      </tr>
                    </thead>`);
    for (row of results.rows) {
      res.write(`<tr>
                    <td>${row["price"]}</td>
                    <td>${row["date_time"]}</td>
                    <td>${row["vehicleid"]}</td>
                    <td>${row["driverid"]}</td>
                    <td>${row["userid"]}</td>
                    <td></td>
                    <td>
                      <input type="radio" name="booking"  value="${row["id"]}"/>
                    </td>
                    </tr>`);
    }
    res.end(`</form></table>`);
  });
});

//Router useradmin : mendapatkan data user untuk admin
router.post("/useradmin", (req, res) => {
  const query = "SELECT * FROM users;"; // query ambil data
  //mendapatkan data dari database
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    res.write(`<table class="table table-hover " style="background-color: #F1F1F1;" id=data_vehicle>
                    <form id="users">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Select One</th>
                      </tr>
                    </thead>`);
    for (row of results.rows) {
      res.write(`<tr>
                    <td>${row["name"]}</td>
                    <td>${row["username"]}</td>
                    <td>${row["email"]}</td>
                    <td>${row["phonenumber"]}</td>
                    <td>
                    
                        <input type="radio" name="user" value="${row["id"]}" /> 
                    
                    </td>
                    </tr>`);
    }
    res.end(`</form></table>`);
  });
});

//Router admindata : mengambil data admin untuk admin
router.post("/admindata", (req, res) => {
  const query = "SELECT * FROM admin;"; // query ambil data
  //mendapatkan data dari database
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    res.write(`<table class="table table-hover " style="background-color: #F1F1F1;" id=data_admin>
                    <form id="admins">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                      </tr>
                    </thead>`);
    for (row of results.rows) {
      res.write(`<tr>
                    <td>${row["name"]}</td>
                    <td>${row["username"]}</td>
                    <td>${row["email"]}</td>
                    <td>${row["phonenumber"]}</td>
                    </tr>`);
    }
    res.end(`</form></table>`);
  });
});

//Router vehicleadmin : mendapatkan data vehicle untuk admin
router.post("/vehicleadmin", (req, res) => {
  const query = "SELECT * FROM vehicle;"; // query ambil data
  //mendapatkan data dari database
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    res.write(`<table class="table table-hover " style="background-color: #F1F1F1;" id=data_vehicle>
                    <form id="vehiclesadmin">
                    <thead>
                      <tr>
                        <th>Registration Number</th>
                        <th>Car Model</th>
                        <th>Availability</th>
                        <th>Select One</th>
                      </tr>
                    </thead>`);
    for (row of results.rows) {
      res.write(`<tr>
                    <td>${row["registrationnumber"]}</td>
                    <td>${row["carmodel"]}</td>
                    <td>${row["availability"]}</td>
                    <td>
                    
                    <input name="vehicle" type="radio" value="${row["id"]}" />
                   
                    </td>
                    </tr>`);
    }
    res.end(` </form></table>`);
  });
});

//Router driveradmin : mendapatkan data driver untuk admin
router.post("/driveradmin", (req, res) => {
  const query = "SELECT * FROM driver;"; // query ambil data
  //mendapatkan data dari database
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    res.write(`<table class="table table-hover " style="background-color: #F1F1F1;" id=data_vehicle>
                    <form id="drivers"><thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Address</th>
                        <th>Availability</th>
                        <th>Select One</th>
                      </tr>
                    </thead>`);
    for (row of results.rows) {
      res.write(`<tr>
                    <td>${row["name"]}</td>
                    <td>${row["phonenumber"]}</td>
                    <td>${row["address"]}</td>
                    <td>${row["status"]}</td>
                    <td>
                    
                    <input  type="radio" name="driver"value="${row["id"]}" >
                    
                    </td>
                    </tr>`);
    }
    res.end(`</form></table>`);
  });
});

//Router getvehicle : mendapatkan data vehicle
router.post("/getvehicle", (req, res) => {
  const query =
    "SELECT * FROM vehicle WHERE availability = 'true' ORDER BY carmodel ASC;"; // query ambil data
  //mendapatkan data dari database
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    res.write(`<table class="table table-hover " style="background-color: #F1F1F1;" id=data_vehicle>
    <form id="vehicles">
    <thead">
      <tr>
        <th>Car Model</th>
        <th>Registration Number</th>
        <th>Avalability</th>
        <th>Select One</th>
      </tr>
    </thead>`);
    for (row of results.rows) {
      res.write(`<tr>
                    <td>${row["carmodel"]}</td>
                    <td>${row["registrationnumber"]}</td>
                    <td>${row["availability"]}</td>
                    <td><input type="radio" name="vehicle" value="${row["id"]}"></td>
                  </tr>`);
    }

    res.end(`</form></table>`);
  });
});

//Router getbooking : mendapatkan data booking
router.post("/getbooking", (req, res) => {
  temp = req.session;

  const query = `SELECT id FROM users WHERE username = '${temp.username}';`;
  db.query(query, (err, result) => {
    if (err) {
      res.send("fail");
    } else {
      var userid = result.rows[0].id;
      const query = `SELECT * FROM booking WHERE userid = ${userid};`; // query ambil data
      //mendapatkan data dari database
      db.query(query, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
        res.write(`<table class="table table-hover " style="background-color: #F1F1F1;" id=data_vehicle>
                        <thead>
                          <tr>
                            <th>Booking ID</th>
                            <th>Date Time</th>
                            <th>Vehicle ID</th>
                            <th>Price</th>
                            <th>Driver</th>
                          </tr>
                        </thead>`);
        for (row of results.rows) {
          res.write(`<tr>
                        <td>${row["id"]}</td>
                        <td>${row["date_time"]}</td>
                        <td>${row["vehicleid"]}</td>
                        <td>${row["price"]}</td>
                        <td>${row["driverid"]}</td>
                        </tr>`);
        }
        res.end(`</table>`);
      });
    }
  });
});

//Deklarasi port untuk server
app.use("/", router);
app.listen(process.env.PORT || 1234, () => {
  console.log(`App Started on PORT ${process.env.PORT || 1234}`);
});
