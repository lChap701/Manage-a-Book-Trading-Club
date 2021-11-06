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
});
