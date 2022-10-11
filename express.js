const express = require("express");
const logger = require("morgan");
const path = require("path");
const { authenticateUser } = require("./authorization");
const PORT = 4000;
const app = express();
const fs = require("fs");

// const tourDatabase = app.use(
//   "./database",
//   express.static(path.join(__dirname, "database", "tours.json"))
// );
app.use(logger("dev"));
app.use(express.json());

const tourDatabase = path.join(__dirname, "database", "tours.json");

app.get("/tours", (req, res) => {
  // res.setHeader("Content-Type", "application/json");
  // authenticateUser(req,res,['admin','user'])
  try {
    // const read = fs.readFileSync(tourDatabase,'utf8')
    // res.json(read)
    getAllTours(req, res);
    // res.json(tourDatabase);
  } catch (error) {
    res.status(404);
    res.send(error);
  }
});

app.post("/tours", (req, res) => {
  // authenticateUser(req,res,['admin'])
  try {
    addTour(req, res);
  } catch (error) {
    res.status(404);
    res.send(error);
  }
});
app.put("/tours/:id", (req, res) => {
  // authenticateUser(req,res,['admin'])
  try {
      updateTour(req, res);
  } catch (error) {
    res.status(404);
    res.send(error);
  }
});
//   if (req.url === "/tours" && req.method === "PUT") {
//     authenticateUser(req,res,['admin'])
//     .then(()=>{
//       updateTour(req, res);
//     })
//     .catch((err) => {
//       res.statusCode = 401
//       res.end(JSON.stringify({error :err}))
//     })
//   }
//   if (req.url === "/tours" && req.method === "DELETE") {
//     authenticateUser(req,res,['admin','user'])
//     .then(()=>{
//       deleteTour(req, res);
//     })
//     .catch((err) => {
//       res.statusCode = 401
//       res.end(JSON.stringify({error :err}))
//     })
//     deleteTour(req, res);
//   }
// }

function getAllTours(req, res, next) {
  fs.readFile(tourDatabase, "utf8", (err, tours) => {
    if (err) {
      console.log(err);
      res.writeHead(400);
      next();
  }
  console.log(tours);

    res.json(JSON.parse( tours));
  });

}


function addTour(req, res) {
  const {tour} = req.body
  console.log(tour)
    fs.readFile(tourDatabase, "utf8", (err, tours) => {
      if (err) {
        console.log(err);
        res.status(400);
        res.send("cant read tour file");
      }

      const oldTours = JSON.parse(tours);
      console.log(oldTours);
      const newTours = [...oldTours, tour];

      fs.writeFile(tourDatabase, JSON.stringify(newTours), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(400);
          res.end("unabel to write to db");
        }
        res.send(JSON.stringify(newTours));
      });
      res.json(newTours)
    });
  }

function updateTour(req, res) {
//   const body = [];
//   req.on("data", (chunk) => {
//     body.push(chunk);
//   });
//   req.on("end", () => {
//     const parseBody = Buffer.concat(body).toString();
//     const tourToBeUpdated = JSON.parse(parseBody);
//     // console.log(tourToBeUpdated)
//     const tourid = tourToBeUpdated.id;
//     console.log(tourid);

const tourid = req.params.id
console.log(req.body)
const body = req.body

    fs.readFile(tourDatabase, "utf8", (err, tour) => {
      if (err) {
        console.log(err);
        res.status(400);
        res.send("cant read tour file");
      }

      const toursDb = JSON.parse(tour);
      console.log(toursDb);
      // console.log(req.params.id)
      const tourIndex = toursDb.findIndex((tour) => tour.id === +tourid);
      console.log(tourIndex);

      if (!tourIndex || tourIndex === -1) {
        res.writeHead(404);
        res.end(`incorrect tour details`);
        return;
      }
      const updatedTour = { ...toursDb[tourIndex], ...body };
      console.log(updatedTour);
      toursDb[tourIndex] = updatedTour;
      console.log(toursDb);

      fs.writeFile(tourDatabase, JSON.stringify(toursDb), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(400);
          res.end("unabel to write to db");
        }
        res.json(toursDb)
      });
    });
  }
// }

function deleteTour(req, res) {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end", () => {
    const parseBody = Buffer.concat(body).toString();
    const { tour } = JSON.parse(parseBody);
    const tourid = tour.id;
    // console.log(tourid);

    fs.readFile(tourDatabase, "utf8", (err, tours) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("cant read tour file");
        return;
      }
      // res.end(tour);
      const toursDb = JSON.parse(tours);
      // console.log(toursDb);
      const tourIndex = toursDb.findIndex((tour) => tour.id === tourid);
      // console.log(tourIndex);

      if (!tourIndex || tourIndex === -1) {
        res.writeHead(404);
        res.end(`Tour does not exit`);
        return;
        // throw new error
      }
      //DELETE TOUR
      toursDb.splice(tourIndex, 1);

      fs.writeFile(tourDatabase, JSON.stringify(toursDb), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end(
            JSON.stringify({
              message: "Internal Server error",
            })
          );
          return;
        }
        res.writeHead(200);
        res.end(`your tour has been successfully deleted`);
      });
    });
  });
}

app.listen(PORT, () => {
  console.log(`server is listening from port ${PORT}`);
});
