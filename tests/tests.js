// Chai Setup
const chai = require("chai");
const { assert } = chai;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const app = require("../index");
const crud = require("../crud");
const secretKeys = require("../secretKeys");

// Agent setup
const agent = chai.request.agent(app);

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
        agent.get("/signup").end((err, res) => {
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
          state: "IA",
          country: "US",
          zipPostal: "52061",
        };

        agent
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

        agent
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

  suite("Testing /logout", () => {
    suite("GET Tests", () => {
      test("1)  Loaded Test", (done) => {
        agent.get("/logout").end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert(
            res.text.match(/<title>Book Exchange - Books<\/title>/),
            "response text should contain '<title>Book Exchange - Books</title>'"
          );
          done();
        });
      });
    });
  });

  suite("Testing /login", () => {
    suite("GET Tests", () => {
      test("1)  Loaded Test", (done) => {
        agent.get("/login").end((err, res) => {
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

        agent
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

          // For the recently added users
          const json = JSON.parse(res.text).sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
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
            json[1],
            "username",
            "dummyUser1",
            "response should return an array containing an object with a property of 'username' that equals 'dummyUser1'"
          );
          assert.propertyVal(
            json[0],
            "username",
            "dummyUser2",
            "response should return an array containing an object with a property of 'username' that equals 'dummyUser2'"
          );
          assert.propertyVal(
            json[1],
            "city",
            "Big City",
            "response should return an array containing an object with a property of 'city' that equals 'Big City'"
          );
          assert.propertyVal(
            json[0],
            "city",
            "null",
            "response should return an array containing an object with a property of 'city' that equals 'null'"
          );
          assert.propertyVal(
            json[1],
            "state",
            "IA",
            "response should return an array containing an object with a property of 'state' that equals 'IA'"
          );
          assert.propertyVal(
            json[0],
            "state",
            "null",
            "response should return an array containing an object with a property of 'state' that equals 'null'"
          );
          assert.propertyVal(
            json[1],
            "country",
            "US",
            "response should return an array containing an object with a property of 'country' that equals 'US'"
          );
          assert.propertyVal(
            json[0],
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
          ids.users.push(json[1]._id);
          ids.users.push(json[0]._id);
        });
    });
  });

  suite("Testing /users/:id", () => {
    suite("GET Tests", () => {
      test("1)  Loaded Test", (done) => {
        agent.get("/users/" + ids.users[1]).end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert(
            !res.text.match(/<title>Book Exchange - Books<\/title>/),
            "response text should contain '<title>Book Exchange - Books</title>'"
          );
          done();
        });
      });
    });
  });

  suite("Testing /users/edit", () => {
    suite("GET Tests", () => {
      test("1)  Loaded Test", (done) => {
        agent.get("/users/edit").end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert(
            res.text.match(/<title>Book Exchange - Edit Profile<\/title>/),
            "response text should contain '<title>Book Exchange - Edit Profile</title>'"
          );
          done();
        });
      });
    });

    suite("PUT Tests", () => {
      test("1)  Send Data Test", (done) => {
        agent
          .put("/users/edit")
          .send({
            _id: ids.users[1],
            username: "dummyUser2",
            email: "email@gmail.com",
            name: "Allen Smith",
            address: "123 ABC Street",
            city: "New York City",
            state: "NY",
            country: "US",
            zipPostal: "11111",
          })
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            done();
          });
      });
    });
  });

  suite("Testing /api/users/:id", () => {a
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/users/" + ids.users[1])
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.property(
            JSON.parse(res.text),
            "_id",
            "response should return an object with the '_id' property"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "username",
            "dummyUser2",
            "response should return an object with a property of 'username' that equals 'dummyUser2'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "fullName",
            "Allen Smith",
            "response should return an object with a property of 'fullName' that equals 'Allen Smith'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "email",
            "email@gmail.com",
            "response should return an object with a property of 'email' that equals 'email@gmail.com'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "address",
            "123 ABC Street",
            "response should return an object with a property of 'address' that equals '123 ABC Street'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "city",
            "New York City",
            "response should return an object with a property of 'city' that equals 'New York City'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "state",
            "NY",
            "response should return an object with a property of 'state' that equals 'MY'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "country",
            "US",
            "response should return an object with a property of 'country' that equals 'US'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "zipPostalCode",
            "11111",
            "response should return an object with a property of 'zipPostalCode' that equals '11111'"
          );
          done();
        });
    });
  });

  suite("Testing /session/user", () => {
    test("1)  GET Test", (done) => {
      agent.get("/session/user").end((err, res) => {
        assert.equal(res.status, 200, "response status should be 200");
        assert.isObject(
          JSON.parse(res.text),
          "response should return an object"
        );
        assert.propertyVal(
          JSON.parse(res.text),
          "_id",
          ids.users[0],
          `response should return an object with a property of '_id' that equals '${ids.users[0]}'`
        );
        assert.propertyVal(
          JSON.parse(res.text),
          "username",
          "dummyUser1",
          "response should return an object with a property of 'username' that equals 'dummyUser1'"
        );
        done();
      });
    });
  });

  suite("Testing /api/countries", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/countries")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.notEqual(
            JSON.parse(res.text).length,
            0,
            "response should return an array that contains countries"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "name",
            "response should contain objects with a property of 'name'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "abbr",
            "response should contain objects with a property of 'abbr'"
          );
          done();
        });
    });
  });

  suite("Testing /api/countries/:cntry", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/countries/us")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isObject(
            JSON.parse(res.text),
            "response should return an object"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "name",
            "United States",
            "response should return an object with a property of 'name' that equals 'United States'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "abbr",
            "US",
            "response should return an object with a property of 'abbr' that equals 'US'"
          );
          done();
        });
    });
  });

  suite("Testing /api/states", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/states")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.notEqual(
            JSON.parse(res.text).length,
            0,
            "response should return an array that contains states"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "name",
            "response should contain objects with a property of 'name'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "abbr",
            "response should contain objects with a property of 'abbr'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "country",
            "response should contain objects with a property of 'country'"
          );
          done();
        });
    });
  });

  suite("Testing /api/countries/:cntry/states", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/countries/us/states")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.notEqual(
            JSON.parse(res.text).length,
            0,
            "response should return an array that contains states"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "name",
            "response should contain objects with a property of 'name'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "abbr",
            "response should contain objects with a property of 'abbr'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "country",
            "response should contain objects with a property of 'country'"
          );
          done();
        });
    });
  });

  suite(
    "Testing /api/countries/:cntry/zipPostalCodes/:zipPostal/states",
    () => {
      test("1)  GET Test", (done) => {
        chai
          .request(app)
          .get("/api/countries/us/zipPostalCodes/52531/states")
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.isArray(
              JSON.parse(res.text),
              "response should return an array"
            );
            assert.notEqual(
              JSON.parse(res.text).length,
              0,
              "response should return an array that contains states"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "name",
              "response should contain objects with a property of 'name'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "abbr",
              "response should contain objects with a property of 'abbr'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "country",
              "response should contain objects with a property of 'country'"
            );
            done();
          });
      });
    }
  );

  suite("Testing /api/countries/:cntry/cities", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/countries/us/cities")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.notEqual(
            JSON.parse(res.text).length,
            0,
            "response should return an array that contains cities"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "name",
            "response should contain objects with a property of 'name'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "country",
            "response should contain objects with a property of 'country'"
          );
          done();
        });
    });
  });

  suite("Testing /api/countries/:cntry/states/:st/cities", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/countries/us/states/ia/cities")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.notEqual(
            JSON.parse(res.text).length,
            0,
            "response should return an array that contains cities"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "name",
            "response should contain objects with a property of 'name'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "state",
            "response should contain objects with a property of 'state'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "country",
            "response should contain objects with a property of 'country'"
          );
          done();
        });
    });
  });

  suite(
    "Testing /api/countries/:cntry/zipPostalCodes/:zipPostal/cities",
    () => {
      test("1)  GET Test", (done) => {
        chai
          .request(app)
          .get("/api/countries/us/zipPostalCodes/52531/cities")
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.isArray(
              JSON.parse(res.text),
              "response should return an array"
            );
            assert.notEqual(
              JSON.parse(res.text).length,
              0,
              "response should return an array that contains cities"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "name",
              "response should contain objects with a property of 'name'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "state",
              "response should contain objects with a property of 'state'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "country",
              "response should contain objects with a property of 'country'"
            );
            done();
          });
      });
    }
  );

  suite(
    "Testing /api/countries/:cntry/states/:st/cities/:city/zipPostalCodes",
    () => {
      test("1)  GET Test", (done) => {
        chai
          .request(app)
          .get("/api/countries/us/states/ia/cities/Albia/zipPostalCodes")
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.isArray(
              JSON.parse(res.text),
              "response should return an array"
            );
            assert.notEqual(
              JSON.parse(res.text).length,
              0,
              "response should return an array that contains zip/postal codes"
            );
            done();
          });
      });
    }
  );

  // Done after all tests have been ran
  suiteTeardown((done) => {
    // Allows each test to start off fresh
    agent.close();

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
