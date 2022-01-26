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
  let orgLength = { users: 0, books: 0, requests: 0, trades: 0 };

  // Done before any tests are ran
  suiteSetup(() => {
    crud.getUsers().then((users) => (orgLength.users = users.length));
    crud.getAllBooks().then((books) => (orgLength.books = books.length));
    crud
      .getRequests()
      .where("traded")
      .equals(false)
      .then((requests) => (orgLength.requests = requests.length));
    crud
      .getRequests()
      .where("traded")
      .equals(true)
      .then((trades) => (orgLength.trades = trades.length));
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
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.equal(
            JSON.parse(res.text).length,
            orgLength.users + 2,
            `response should return ${orgLength.users + 2} objects`
          );
          assert.property(
            JSON.parse(res.text)[0],
            "_id",
            "response should return an array containing objects with a property of '_id'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "username",
            "dummyUser1",
            "response should return an array containing an object with a property of 'username' that equals 'dummyUser1'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "username",
            "dummyUser2",
            "response should return an array containing an object with a property of 'username' that equals 'dummyUser2'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "city",
            "Big City",
            "response should return an array containing an object with a property of 'city' that equals 'Big City'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "city",
            "N/A",
            "response should return an array containing an object with a property of 'city' that equals 'N/A'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "state",
            "IA",
            "response should return an array containing an object with a property of 'state' that equals 'IA'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "state",
            "N/A",
            "response should return an array containing an object with a property of 'state' that equals 'N/A'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "country",
            "US",
            "response should return an array containing an object with a property of 'country' that equals 'US'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "country",
            "N/A",
            "response should return an array containing an object with a property of 'country' that equals 'N/A'"
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

          // Saves user IDS
          ids.users.push(JSON.parse(res.text)[1]._id);
          ids.users.push(JSON.parse(res.text)[0]._id);
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
            "response text should not contain '<title>Book Exchange - Books</title>'"
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
            assert(
              !res.text.match(/<title>Book Exchange - Edit Profile<\/title>/),
              "response text should not contain '<title>Book Exchange - Edit Profile</title>'"
            );
            done();
          });
      });
    });
  });

  suite("Testing /api/users/:id", () => {
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
            "response should return an object with a property of 'state' that equals 'NY'"
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

  suite("Testing /api/addresses/:text", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/addresses/South Street")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          done();
        });
    });
  });

  suite("Testing /api/countries/:cntry/addresses/:text", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/countries/us/addresses/South Street")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          done();
        });
    });
  });

  suite("Testing /books/my", () => {
    suite("GET Tests", () => {
      test("1)  Loaded Test", (done) => {
        agent.get("/books/my").end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert(
            res.text.match(/<title>Book Exchange - My Books<\/title>/),
            "response text should contain '<title>Book Exchange - My Books</title>'"
          );
          done();
        });
      });
    });

    suite("POST Tests", () => {
      test("1)  All Data Test", (done) => {
        const data = {
          title: "Dummy Book #1",
          description: "Dummy Text",
          user: ids.users[0],
        };
        agent
          .post("/books/my")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.equal(
              res.text,
              "success",
              "response should return 'success'"
            );
            done();
          });
      });

      test("2)  Repeat Book Title Test", (done) => {
        const data = {
          title: "Dummy Book #1",
          description: "Dummy Text",
          user: ids.users[1],
        };
        agent
          .post("/books/my")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.equal(
              res.text,
              "Title must be unique",
              "response should return 'Title must be unique'"
            );
            done();
          });
      });

      test("3)  Repeat Book Description Test", (done) => {
        const data = {
          title: "Dummy Book #2",
          description: "Dummy Text",
          user: ids.users[1],
        };
        agent
          .post("/books/my")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.equal(
              res.text,
              "success",
              "response should return 'success'"
            );
            done();
          });
      });

      test("4)  No Title Test", (done) => {
        const data = {
          title: "",
          description: "Dummy Text",
          user: ids.users[1],
        };
        agent
          .post("/books/my")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.notEqual(
              res.text,
              "success",
              "response should not return 'success'"
            );
            done();
          });
      });

      test("5)  No Description Test", (done) => {
        const data = {
          title: "doesn't matter",
          description: "",
          user: ids.users[1],
        };
        agent
          .post("/books/my")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.notEqual(
              res.text,
              "success",
              "response should not return 'success'"
            );
            done();
          });
      });

      test("6)  New Description Test", (done) => {
        const data = {
          title: "Dummy Book #3",
          description: "Dummy Description",
          user: ids.users[1],
        };

        agent
          .post("/books/my")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.equal(
              res.text,
              "success",
              "response should return 'success'"
            );
            done();
          });
      });
    });
  });

  suite("Testing /api/books (No Requests)", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/books")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.equal(
            JSON.parse(res.text).length,
            orgLength.books + 3,
            `response should return ${orgLength.books + 3} objects`
          );
          assert.property(
            JSON.parse(res.text)[0],
            "_id",
            "response should return an array containing objects with a property of '_id'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[2],
            "title",
            "Dummy Book #1",
            "response should return an array containing an object with a property of 'title' that equals 'Dummy Book #1'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "title",
            "Dummy Book #2",
            "response should return an array containing an object with a property of 'title' that equals 'Dummy Book #2'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "title",
            "Dummy Book #3",
            "response should return an array containing an object with a property of 'title' that equals 'Dummy Book #3'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "description",
            "Dummy Description",
            "response should return an array containing objects with a property of 'description' that equals 'Dummy Description'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[1],
            "description",
            "Dummy Text",
            "response should return an array containing objects with a property of 'description' that equals 'Dummy Text'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "requests",
            "response should return an array containing objects with a nested object called 'requests'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "user",
            "response should return an array containing objects with a nested object called 'user'"
          );
          done();
          ids.books.push(JSON.parse(res.text)[2]._id);
          ids.books.push(JSON.parse(res.text)[1]._id);
          ids.books.push(JSON.parse(res.text)[0]._id);
        });
    });
  });

  suite("Testing /api/users/:id/books", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get(`/api/users/${ids.users[0]}/books`)
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "_id",
            "response should return an array of objects with a property of '_id'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "title",
            "Dummy Book #1",
            "response should contain an object with a property of 'title' that equals 'Dummy Book #1'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "description",
            "Dummy Text",
            "response should contain an object with a property of 'description' that equals 'Dummy Text'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "requests",
            "response should return an array of objects with a property of 'requests'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "user",
            "response should return an array of objects with a property of 'user'"
          );
          done();
        });
    });
  });

  suite("Testing /requests/new", () => {
    suite("GET Tests", () => {
      test("1)  Loaded Test", (done) => {
        agent.get("/requests/new").end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert(
            res.text.match(/<title>Book Exchange - Create Requests<\/title>/),
            "response text should contain '<title>Book Exchange - Create Requests</title>'"
          );
          done();
        });
      });
    });

    suite("POST Tests", () => {
      test("1)  One Book to Give/Take Test", (done) => {
        const data = {
          gives: [ids.books[0]],
          takes: [ids.books[1]],
        };

        agent
          .post("/requests/new")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - All Requests<\/title>/),
              "response text should contain '<title>Book Exchange - All Requests</title>'"
            );
            done();
          });
      });

      test("2)  No Books to Give Test", (done) => {
        const data = {
          takes: [ids.books[0]],
        };

        agent
          .post("/requests/new")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              !res.text.match(/<title>Book Exchange - All Requests<\/title>/),
              "response text should contain '<title>Book Exchange - All Requests</title>'"
            );
            done();
          });
      });

      test("3)  No Books to Take Test", (done) => {
        const data = {
          gives: [ids.books[1]],
        };

        agent
          .post("/requests/new")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              !res.text.match(/<title>Book Exchange - All Requests<\/title>/),
              "response text should contain '<title>Book Exchange - All Requests</title>'"
            );
            done();
          });
      });

      test("4)  Multiple Books to Give Test", (done) => {
        const data = {
          gives: [ids.books[1], ids.books[2]],
          takes: [ids.books[0]],
        };

        agent
          .post("/requests/new")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - All Requests<\/title>/),
              "response text should contain '<title>Book Exchange - All Requests</title>'"
            );
            done();
          });
      });

      test("5)  Multiple Books to Take Test", (done) => {
        const data = {
          gives: [ids.books[0]],
          takes: [ids.books[1], ids.books[2]],
        };

        agent
          .post("/requests/new")
          .send(data)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              res.text.match(/<title>Book Exchange - All Requests<\/title>/),
              "response text should contain '<title>Book Exchange - All Requests</title>'"
            );
            done();
          });
      });
    });
  });

  suite("Testing /api/requests (No Queries)", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/requests")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "_id",
            "response should return an array containing an object with a property of '_id'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "gives",
            "response should return an array containing an object with a property of 'gives'"
          );
          assert.isArray(
            JSON.parse(res.text)[0].gives,
            "the 'gives' property should be an array"
          );
          assert.property(
            JSON.parse(res.text)[0].gives[0],
            "book",
            "the 'gives' property should contain an object with a property of 'book'"
          );
          assert.property(
            JSON.parse(res.text)[0].gives[0].book,
            "_id",
            "the 'book' object/property should contain a property of '_id'"
          );
          assert.property(
            JSON.parse(res.text)[0].gives[0].book,
            "title",
            "the 'book' object/property should contain a property of 'title'"
          );
          assert.property(
            JSON.parse(res.text)[0].gives[0].book,
            "description",
            "the 'book' object/property should contain a property of 'description'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0].gives[0].book,
            "requests",
            1,
            "the 'book' object/property should contain a property of 'requests' that equals '1'"
          );
          assert.property(
            JSON.parse(res.text)[0].gives[0],
            "user",
            "the 'gives' property should contain an object with a property of 'user'"
          );
          assert.property(
            JSON.parse(res.text)[0].gives[0].user,
            "_id",
            "the 'user' object/property should contain a property of '_id'"
          );
          assert.property(
            JSON.parse(res.text)[0].gives[0].user,
            "username",
            "the 'user' object/property should contain a property of 'username'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "gives",
            "response should return an array containing an object with a property of 'gives'"
          );
          assert.isArray(
            JSON.parse(res.text)[0].takes,
            "the 'takes' property should be an array"
          );
          assert.property(
            JSON.parse(res.text)[0].takes[0],
            "book",
            "the 'takes' property should contain an object with a property of 'book'"
          );
          assert.property(
            JSON.parse(res.text)[0].takes[0].book,
            "_id",
            "the 'book' object/property should contain a property of '_id'"
          );
          assert.property(
            JSON.parse(res.text)[0].takes[0].book,
            "title",
            "the 'book' object/property should contain a property of 'title'"
          );
          assert.property(
            JSON.parse(res.text)[0].takes[0].book,
            "description",
            "the 'book' object/property should contain a property of 'description'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0].takes[0].book,
            "requests",
            2,
            "the 'book' object/property should contain a property of 'requests' that equals '2'"
          );
          assert.property(
            JSON.parse(res.text)[0].takes[0],
            "user",
            "the 'takes' property should contain an object with a property of 'user'"
          );
          assert.property(
            JSON.parse(res.text)[0].takes[0].user,
            "_id",
            "the 'user' object/property should contain a property of '_id'"
          );
          assert.property(
            JSON.parse(res.text)[0].takes[0].user,
            "username",
            "the 'user' object/property should contain a property of 'username'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "requestedAt",
            "response should return an array containing an object with a property of 'requestedAt'"
          );
          done();
          ids.requests.push(JSON.parse(res.text)[2]._id);
          ids.requests.push(JSON.parse(res.text)[1]._id);
          ids.requests.push(JSON.parse(res.text)[0]._id);
        });
    });
  });

  suite("Testing /books/:bookId/requests", () => {
    suite("GET Tests", () => {
      test("1) Loaded Tests", (done) => {
        chai
          .request(app)
          .get(`/books/${ids.books[0]}/requests`)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert(
              !res.text.match(/<title>Book Exchange - Books<\/title>/),
              "response text should not contain '<title>Book Exchange - Books</title>'"
            );
            done();
          });
      });
    });
  });

  suite("Testing /requests/:requestId/cancel", () => {
    test("1)  GET Test", (done) => {
      agent.get(`/requests/${ids.requests[2]}/cancel`).end((err, res) => {
        assert.equal(res.status, 200, "response status should be 200");
        assert(
          res.text.match(/<title>Book Exchange - All Requests<\/title>/),
          "response text should contain '<title>Book Exchange - All Requests</title>'"
        );
        done();
      });
    });
  });

  suite("Testing /api/books/:bookId/requests", () => {
    suite("GET Tests", () => {
      test("1)  Book Requested To Take Test", (done) => {
        chai
          .request(app)
          .get(`/api/books/${ids.books[1]}/requests`)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.isArray(
              JSON.parse(res.text),
              "response should return an array"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "_id",
              "response should return an array containing an object with a property of '_id'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "gives",
              "response should return an array containing an object with a property of 'gives'"
            );
            assert.isArray(
              JSON.parse(res.text)[0].gives,
              "the 'gives' property should be an array"
            );
            assert.property(
              JSON.parse(res.text)[0].gives[0],
              "book",
              "the 'gives' property should contain an object with a property of 'book'"
            );
            assert.property(
              JSON.parse(res.text)[0].gives[0],
              "user",
              "the 'gives' property should contain an object with a property of 'user'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "takes",
              "response should return an array containing an object with a property of 'takes'"
            );
            assert.isArray(
              JSON.parse(res.text)[0].takes,
              "the 'takes' property should be an array"
            );
            assert.property(
              JSON.parse(res.text)[0].takes[0],
              "book",
              "the 'takes' property should contain an object with a property of 'book'"
            );
            assert.property(
              JSON.parse(res.text)[0].takes[0],
              "user",
              "the 'takes' property should contain an object with a property of 'user'"
            );
            done();
          });
      });

      test("2)  Book With No Requests Test", (done) => {
        chai
          .request(app)
          .get(`/api/books/${ids.books[2]}/requests`)
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.propertyVal(
              JSON.parse(res.text),
              "msg",
              "There are currently no requests at this time",
              "response should return an object with a property of 'msg' that equals 'There are currently no requests at this time'"
            );
            assert.propertyVal(
              JSON.parse(res.text),
              "bookTitle",
              "Dummy Book #3",
              "response should return an object with a property of 'bookTitle' that equals 'Dummy Book #3'"
            );
            done();
          });
      });

      test("3)  Unknown Book Test", (done) => {
        chai
          .request(app)
          .get("/api/books/71792ae9cd5ad940788652af/requests")
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.equal(
              res.text,
              "Unknown book",
              "response text should return 'Unknown book'"
            );
            done();
          });
      });
    });
  });

  suite("Testing /requests/:requestId/accept/:id", () => {
    test("1)  GET Test", (done) => {
      agent
        .get(`/requests/${ids.requests[0]}/accept/${ids.users[1]}`)
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert(
            res.text.match(/<title>Book Exchange - All Requests<\/title>/),
            "response text should contain '<title>Book Exchange - All Requests</title>'"
          );
          done();
        });
    });
  });

  suite("Testing /api/requests (With Queries)", () => {
    suite("GET Tests", () => {
      test("1)  Traded Books Test", (done) => {
        chai
          .request(app)
          .get("/api/requests?traded=true")
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.isArray(
              JSON.parse(res.text),
              "response should return an array"
            );
            assert.equal(
              JSON.parse(res.text).length,
              orgLength.trades + 1,
              `response should return an array with a length of ${
                orgLength.trades + 1
              }`
            );
            assert.property(
              JSON.parse(res.text)[0],
              "_id",
              "response should return an array containing an object with a property of '_id'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "gives",
              "response should return an array containing an object with a property of 'gives'"
            );
            assert.isArray(
              JSON.parse(res.text)[0].gives,
              "the 'gives' property should be an array"
            );
            assert.property(
              JSON.parse(res.text)[0].gives[0],
              "book",
              "the 'gives' property should contain an object with a property of 'book'"
            );
            assert.property(
              JSON.parse(res.text)[0].gives[0].book,
              "_id",
              "the 'book' object/property should contain a property of '_id'"
            );
            assert.propertyVal(
              JSON.parse(res.text)[0].gives[0].book,
              "title",
              "Dummy Book #1",
              "the 'book' object/property should contain a property of 'title' that equals 'Dummy Book #1'"
            );
            assert.propertyVal(
              JSON.parse(res.text)[0].gives[0].book,
              "description",
              "Dummy Text",
              "the 'book' object/property should contain a property of 'description' that equals 'Dummy Text'"
            );
            assert.propertyVal(
              JSON.parse(res.text)[0].gives[0].book,
              "requests",
              1,
              "the 'book' object/property should contain a property of 'requests' that equals '1'"
            );
            assert.property(
              JSON.parse(res.text)[0].gives[0],
              "user",
              "the 'gives' property should contain an object with a property of 'user'"
            );
            assert.property(
              JSON.parse(res.text)[0].gives[0].user,
              "_id",
              "the 'user' object/property should contain a property of '_id'"
            );
            assert.propertyVal(
              JSON.parse(res.text)[0].gives[0].user,
              "username",
              "dummyUser2",
              "the 'user' object/property should contain a property of 'username' that equals 'dummyUser2'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "takes",
              "response should return an array containing an object with a property of 'takes'"
            );
            assert.isArray(
              JSON.parse(res.text)[0].takes,
              "the 'takes' property should be an array"
            );
            assert.property(
              JSON.parse(res.text)[0].takes[0],
              "book",
              "the 'takes' property should contain an object with a property of 'book'"
            );
            assert.property(
              JSON.parse(res.text)[0].takes[0].book,
              "_id",
              "the 'book' object/property should contain a property of '_id'"
            );
            assert.propertyVal(
              JSON.parse(res.text)[0].takes[0].book,
              "title",
              "Dummy Book #2",
              "the 'book' object/property should contain a property of 'title' that equals 'Dummy Book #2'"
            );
            assert.propertyVal(
              JSON.parse(res.text)[0].takes[0].book,
              "description",
              "Dummy Text",
              "the 'book' object/property should contain a property of 'description' that equals 'Dummy Text'"
            );
            assert.propertyVal(
              JSON.parse(res.text)[0].takes[0].book,
              "requests",
              0,
              "the 'book' object/property should contain a property of 'requests' that equals '0'"
            );
            assert.property(
              JSON.parse(res.text)[0].takes[0],
              "user",
              "the 'takes' property should contain an object with a property of 'user'"
            );
            assert.property(
              JSON.parse(res.text)[0].takes[0].user,
              "_id",
              "the 'user' object/property should contain a property of '_id'"
            );
            assert.propertyVal(
              JSON.parse(res.text)[0].takes[0].user,
              "username",
              "dummyUser1",
              "the 'user' object/property should contain a property of 'username' that equals 'dummyUser1'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "requestedAt",
              "response should return an array containing an object with a property of 'requestedAt'"
            );
            assert.property(
              JSON.parse(res.text)[0],
              "tradedAt",
              "response should return an array containing an object with a property of 'tradedAt'"
            );
            done();
          });
      });

      test("2)  Requested Books Test", (done) => {
        chai
          .request(app)
          .get("/api/requests?traded=false")
          .end((err, res) => {
            assert.equal(res.status, 200, "response status should be 200");
            assert.isArray(
              JSON.parse(res.text),
              "response should return an array"
            );
            assert.equal(
              JSON.parse(res.text).length,
              orgLength.requests + 1,
              `response should return an array with a length of ${
                orgLength.requests + 1
              }`
            );
            done();
          });
      });
    });
  });

  suite("Testing /api/books (With Requests)", () => {
    test("1)  GET Test", (done) => {
      chai
        .request(app)
        .get("/api/books")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );

          // Sorts array by the largest number of requests for testing
          const json = JSON.parse(res.text).sort(
            (a, b) => b.requests.count - a.requests.count
          );
          assert.property(
            json[0],
            "requests",
            "response should return an array of objects with a property of 'requests'"
          );
          assert.property(
            json[0].requests,
            "count",
            "the 'requests' object/property should contain a property of 'count'"
          );
          assert.property(
            json[0].requests,
            "users",
            "the 'requests' object/property should contain a property of 'users'"
          );
          assert.isArray(
            json[0].requests.users,
            "the 'users' property should be an array"
          );
          assert.isAbove(
            json[0].requests.users.length,
            0,
            "the 'users' property should contain at least one object"
          );
          done();
        });
    });
  });

  // Done after all tests have been ran
  suiteTeardown((done) => {
    // Allows each test to start off fresh
    agent.close();

    // Deletes all test users
    ids.users.forEach((id) => {
      crud
        .deleteUser(id)
        .then(() => {
          secretKeys.removeKey(id);
          crud.deleteNotifications(id).catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    });

    // Deletes all test books
    ids.books.forEach((id) => {
      crud.deleteBook(id).catch((err) => console.log(err));
    });

    // Deletes all test requests
    ids.requests.forEach((id) => {
      crud
        .deleteRequest(id)
        .then(() => {
          crud.deleteTrades(id).catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    });

    // Gives enough time for the code above to be executed
    setTimeout(() => done(), 3000);
  });
});
