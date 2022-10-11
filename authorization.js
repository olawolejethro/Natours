const fs = require("fs");
const path = require("path");

const userDatabase = path.join(__dirname, "database", "users.json");

function getAllUsers() {
  return new Promise((resolve, reject) => {
    fs.readFile(userDatabase, "utf8", (err, users) => {
      if (err) {
        reject(err);
      }

      resolve(JSON.parse(users));
    });
  });
}

function authenticateUser(req, res, roles) {
  return new Promise((resolve, reject) => {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", async () => {
      const parseBody = Buffer.concat(body).toString();
      const userDetails = JSON.parse(parseBody);
      console.log(userDetails);
      if (!userDetails) {
        reject(`please input your username and password`);
      }
      const { user: loginDetails, tour } = userDetails;

      const users = await getAllUsers();
      // console.log(users);

      const userFound = users.find(
        (user) =>
          user.username.toLowerCase() ===
            loginDetails["username"].toLowerCase() &&
          user.password.toLowerCase() === loginDetails["password"].toLowerCase()
      );
      if (!userFound) {
        reject(`logging details nt  found`);
      }
      resolve(userFound);

      console.log(userFound);

      // console.log(user)
      // console.log(userFound);

      if (!roles.includes(userFound.role)) {
        reject(`you are not eligible to access this resources`);
      }
      resolve(tour);
    });
    // resolve(tour);
  });
}
module.exports = {
  authenticateUser,
};
