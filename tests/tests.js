// Chai Setup
const chai = require("chai");
const { assert } = chai;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const app = require("../index");
const crud = require("../crud");
const secretKeys = require("../secretKeys");

suite("Unit Tests", () => {
  let ids = { users: [], books: [], requests: [] };
  let orgLength = 0;

  // Done before any tests are ran
  suiteSetup(() => {
    crud.getUsers().then((users) => (orgLength = users.length));
  });

  suite("Testing /signup", () => {
    suite("GET Tests", () => {
      test("1)  Loaded Test", (done) => {
        chai
          .request(app)
          .get("/signup")
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - Sign Up<\/title>/),
              "response text should contain '<title>Book Exchange - Sign Up</title>'"
            );
            done();
          });
      });
    });

    suite("POST Tests", () => {
      test("1)  All Fields Test", (done) => {
        const data = {
          username: "dummyUser1",
          password: "test1",
          email: "abc123@gmail.com",
          name: "John Smith",
          address: "123 6th Street",
          city: "Big City",
          state: "Iowa",
          country: "United States",
          zipPostal: "52061",
        };

        chai
          .request(app)
          .post("/signup")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - Books<\/title>/),
              "response text should contain '<title>Book Exchange - Login</title>'"
            );
            done();
          });
      });

      test("2)  Required Fields Only Test", (done) => {
        const data = {
          username: "dummyUser2",
          password: "test2",
        };

        chai
          .request(app)
          .post("/signup")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            done();
          });
      });

      test("3)  No Password Field Test", (done) => {
        const data = {
          username: "shouldn'tBeSeen",
        };

        chai
          .request(app)
          .post("/signup")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - Sign Up<\/title>/),
              "response text should contain '<title>Book Exchange - Sign Up</title>'"
            );
            done();
          });
      });

      test("4)  No Username Field Test", (done) => {
        const data = {
          password: "test4",
        };

        chai
          .request(app)
          .post("/signup")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - Sign Up<\/title>/),
              "response text should contain '<title>Book Exchange - Sign Up</title>'"
            );
            done();
          });
      });
    });
  });

  suite("Testing /login", () => {
    suite("GET Tests", () => {
      test("1)  Loaded Test", (done) => {
        chai
          .request(app)
          .get("/login")
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - Login<\/title>/),
              "response text should contain '<title>Book Exchange - Login</title>'"
            );
            done();
          });
      });
    });

    suite("POST Tests", () => {
      test("1)  All Fields Tests", (done) => {
        const data = {
          username: "dummyUser1",
          password: "test1",
        };

        chai
          .request(app)
          .post("/login")
          .send(data)
          .end((req, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - Books<\/title>/),
              "response text should contain '<title>Book Exchange - Books</title>'"
            );
            done();
          });
      });

      test("2)  No Password Field Test", (done) => {
        const data = {
          username: "shouldn'tBeSeen",
        };

        chai
          .request(app)
          .post("/login")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - Login<\/title>/),
              "response text should contain '<title>Book Exchange - Login</title>'"
            );
            done();
          });
      });

      test("3)  No Username Field Test", (done) => {
        const data = {
          password: "test4",
        };

        chai
          .request(app)
          .post("/login")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - Login<\/title>/),
              "response text should contain '<title>Book Exchange - Login</title>'"
            );
            done();
          });
      });
    });
  });

  suite("Testing /api/users", () => {
    test("1) GET Test", (done) => {
      chai
        .request(app)
        .get("/api/users")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");

          // Gets the recently added users
          const json = JSON.parse(res.text).sort(
            (a, b) => b.createdAt - a.createdAt
          );

          assert.isArray(json, "response should return an array");
          assert.equal(
            json.length,
            orgLength + 2,
            `response should return ${orgLength + 2} objects`
          );
          assert.property(
            json[0],
            "_id",
            "response should return objects with a property of '_id'"
          );
          assert.propertyVal(
            json[0],
            "username",
            "dummyUser1",
            "response should return an array containing an object with a property of 'name' that equals 'dummyUser1'"
          );
          assert.propertyVal(
            json[1],
            "username",
            "dummyUser2",
            "response should return an array containing an object with a property of 'name' that equals 'dummyUser2'"
          );
          assert.propertyVal(
            json[0],
            "city",
            "Big City",
            "response should return an array containing an object with a property of 'city' that equals 'Big City'"
          );
          assert.propertyVal(
            json[1],
            "city",
            "null",
            "response should return an array containing an object with a property of 'city' that equals 'null'"
          );
          assert.propertyVal(
            json[0],
            "state",
            "Iowa",
            "response should return an array containing an object with a property of 'state' that equals 'Iowa'"
          );
          assert.propertyVal(
            json[1],
            "state",
            "null",
            "response should return an array containing an object with a property of 'state' that equals 'null'"
          );
          assert.propertyVal(
            json[0],
            "country",
            "United States",
            "response should return an array containing an object with a property of 'country' that equals 'United States'"
          );
          assert.propertyVal(
            json[1],
            "country",
            "null",
            "response should return an array containing an object with a property of 'country' that equals 'null'"
          );
          assert.property(
            json[0],
            "books",
            "response should return objects with a property of 'books'"
          );
          assert.property(
            json[0],
            "incomingRequests",
            "response should return objects with a property of 'incomingRequests'"
          );
          done();

          // Saves user IDS
          ids.users.push(json[0]._id);
          ids.users.push(json[1]._id);
          console.log(ids);
        });
    });
  });

  suite("Testing /api/users/:id", () => {});

  suite("Testing /session/user", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/session/user")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          done();
        });
    });
  });

  // Done after all tests have been ran
  suiteTeardown((done) => {
    // Deletes all test users
    ids.users.forEach((id) => {
      crud
        .deleteUser(id)
        .then(secretKeys.removeKey(id))
        .catch((err) => console.log(err));
    });

    // Deletes all test books
    ids.books.forEach((id) => {
      crud.deleteBook(id).catch((err) => console.log(err));
    });

    // Deletes all test requests
    ids.requests.forEach((id) => {
      crud.deleteRequest(id).catch((err) => console.log(err));
    });
    done();
  });
});
