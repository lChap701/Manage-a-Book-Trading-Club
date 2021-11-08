// Chai Setup
const chai = require("chai");
const { assert } = chai;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const app = require("../index");

suite("Unit Tests", () => {
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
              res.text.match(/<title>Book Exchange - Login<\/title>/),
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
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.equal(
            JSON.parse(res.text).length,
            2,
            "response should return two objects"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "_id",
            "response should return objects with a property of '_id'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "username",
            "dummyUser1",
            "response should return an array containing an object with a property of 'name' that equals 'dummyUser1'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "username",
            "dummyUser2",
            "response should return an array containing an object with a property of 'name' that equals 'dummyUser2'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "city",
            "Big City",
            "response should return an array containing an object with a property of 'city' that equals 'Big City'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "city",
            "null",
            "response should return an array containing an object with a property of 'city' that equals 'null'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "state",
            "Iowa",
            "response should return an array containing an object with a property of 'state' that equals 'Iowa'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "state",
            "null",
            "response should return an array containing an object with a property of 'state' that equals 'null'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "country",
            "United States",
            "response should return an array containing an object with a property of 'country' that equals 'United States'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "country",
            "null",
            "response should return an array containing an object with a property of 'country' that equals 'null'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "books",
            "response should return objects with a property of 'books'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "incomingRequests",
            "response should return objects with a property of 'incomingRequests'"
          );
          done();
        });
    });
  });
});
