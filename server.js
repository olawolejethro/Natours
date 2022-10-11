const fs = require("fs");
const path = require("path");
const http = require("http");
const { authenticateUser } = require("./authorization");
const PORT = 4000;
const HOST_NAME = "localhost";
const tourDatabase = path.join(__dirname, "database", "tours.json");

function requestHandler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/tours" && req.method === "GET") {
    authenticateUser(req,res,['admin','user'])
    .then(()=>{
    getAllTours(req, res);
    })
    .catch((err) => {
      res.statusCode = 401
      res.end(JSON.stringify({error :err}))
    })
  }
  if (req.url === "/tours" && req.method === "POST") {
    authenticateUser(req,res,['admin'])
    .then(()=>{
      addTour(req, res);
    })
    .catch((err) => {
      res.statusCode = 401
      res.end(JSON.stringify({error :err}))
    })
  }
  if (req.url === "/tours" && req.method === "PUT") {
    authenticateUser(req,res,['admin'])
    .then(()=>{
      updateTour(req, res);
    })
    .catch((err) => {
      res.statusCode = 401
      res.end(JSON.stringify({error :err}))
    })
  }
  if (req.url === "/tours" && req.method === "DELETE") {
    authenticateUser(req,res,['admin','user'])
    .then(()=>{
      deleteTour(req, res);
    })
    .catch((err) => {
      res.statusCode = 401
      res.end(JSON.stringify({error :err}))
    })
    deleteTour(req, res);
  }
}

function getAllTours(req, res) {
  // fs.readFile(tourDatabase, "utf8", (err, tours) => {
  //   if (err) {
  //     console.log(err);
  //     res.writeHead(400);
  //     res.end("An error occured");
  //     return
  //   }

  //   res.end(tours);
  // });

  return new promise((resolve,reject) => {
      fs.readFile(tourDatabase, "utf8", (err, tours) => {
          if (err) {
            console.log(err);
          //   res.writeHead(400);
          reject(err)
          } 
          // res.writeHead(200);
          resolve(tours);
        });

  })
}

  // const read = fs.readFileSync(tourDatabase,'utf8')
  // console.log(read)
// }

function addTour(req, res) {
  const body = [];
  req.on("data", (chunck) => {
    body.push(chunck);
  });

  req.on("end", () => {
    const parseBody = Buffer.concat(body).toString();
    const {tour} = JSON.parse(parseBody);
    console.log(newTour);


    // const parseBody = Buffer.concat(body).toString();
    // const {tour} = JSON.parse(parseBody);
    // const tourid = tour.id;

    fs.readFile(tourDatabase, "utf8", (err, tours) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("cant read tour file");
      }
      res.end(tours);

      const oldTours = JSON.parse(tours);
      const newTours = [...oldTours, tour];

      fs.writeFile(tourDatabase, JSON.stringify(newTours), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(400);
          res.end("unabel to write to db");
        }
        res.end(JSON.stringify(newTours));
      });
    });
  });
}

function updateTour(req, res) {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end", () => {
    const parseBody = Buffer.concat(body).toString();
    const tourToBeUpdated = JSON.parse(parseBody);
    // console.log(tourToBeUpdated)
    const tourid = tourToBeUpdated.id;
    console.log(tourid);

    fs.readFile(tourDatabase, "utf8", (err, tour) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("cant read tour file");
      }
      res.end(tour);

      const toursDb = JSON.parse(tour);
      // console.log(toursDb);
      const tourIndex = toursDb.findIndex((tour) => tour.id === tourid);
      console.log(tourIndex);

      if (!tourIndex || tourIndex === -1) {
        res.writeHead(404);
        res.end(`incorrect tour details`);
        return;
      }
      const updatedTour = { ...toursDb[tourIndex], ...tourToBeUpdated };
      console.log(updatedTour);
      toursDb[tourIndex] = updatedTour;
      console.log(toursDb);

      fs.writeFile(tourDatabase, JSON.stringify(toursDb), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(400);
          res.end("unabel to write to db");
        }
        res.end(JSON.stringify(toursDb));
      });
    });
  });
}

function deleteTour(req, res) {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end", () => {
    const parseBody = Buffer.concat(body).toString();
    const {tour} = JSON.parse(parseBody);
    const tourid = tour.id;
    // console.log(tourid);

    fs.readFile(tourDatabase, "utf8", (err, tours) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("cant read tour file");
        return
      }
      // res.end(tour);
      const toursDb = JSON.parse(tours);
      // console.log(toursDb);
      const tourIndex = toursDb.findIndex((tour) => tour.id === tourid);
      // console.log(tourIndex);

      if (!tourIndex || tourIndex === -1) {
        res.writeHead(404);
        res.end(`Tour does not exit`);
        return
        // throw new error
      }
      //DELETE TOUR
      toursDb.splice(tourIndex, 1);

      fs.writeFile(tourDatabase, JSON.stringify(toursDb), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end(JSON.stringify({
            message : "Internal Server error"
          }));
          return
        }
        res.writeHead(200)
        res.end(`your tour has been successfully deleted`);
      });
    });
  });
}

const server = http.createServer(requestHandler);

server.listen(PORT, HOST_NAME, () => {
  // toursDB = JSON.parse(fs.readFileSync(tourDatabase, "utf8"));
  console.log(`server is running on ${HOST_NAME}:${PORT}`);
});
