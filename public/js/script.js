const { useState, useEffect, useCallback, useRef } = React;
const {
  BrowserRouter,
  Route,
  NavLink,
  Link,
  Prompt,
  Switch,
  Redirect,
  useParams,
} = ReactRouterDOM;
const Router = BrowserRouter;

/**
 * Makes an API call
 * @param {string} url    Represents the API URL path
 * @param {string} type   Represents the type of data that is returned (default is 'text')
 * @returns               Returns the result
 */
async function callApi(url, type = "text") {
  try {
    let res = await fetch(url);

    // Displays a special error message
    if (!res.ok) throw Error(`Response ${res.status}: ${res.statusText}`);

    return type == "text" ? await res.text() : await res.json();
  } catch (e) {
    alert(e);
    console.error(e);
  }
}

/**
 * Validates input fields in the form and determines if the form is valid
 * @returns   Returns a boolean value that determines if the form should be submitted
 */
function validateForm() {
  let valid = true;

  // Validates input fields
  document.querySelectorAll("input:not([type='submit']").forEach((input) => {
    if (
      !input.checkValidity() ||
      (input.value.trim().length == 0 && input.required)
    ) {
      input.classList.add("is-invalid");
      valid = false;
    } else if (input.classList.contains("is-invalid")) {
      input.classList.remove("is-invalid");
    }
  });

  return valid;
}

/**
 * Submits the form using the specified HTTP method
 * @param {*} data            Represents the data that should be submitted
 * @param {String} method     Represents the HTTP method to use (defaults to 'POST')
 * @returns                   Returns the new URL to redirect to or an error message
 */
async function sendData(data, method = "POST") {
  try {
    const res = await fetch(location.href, {
      method: method,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(res);

    // Ensures that an error message is displayed
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    // Determines if an error message or a new URL was returned
    return location.href == res.url ? await res.text() : res.url;
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}

/**
 * Updates a document's title and the description, og:title, and og:url meta tags
 * @param {String} title          Represents the new document title and content for the og:title meta tag
 * @param {String} description    Represents the new description meta tag's content
 * @param {String} url            Represents the new og:url meta tag's content
 */
function updateTitleAndMetaTags(title, description, url) {
  // Updates the document's title
  document.title = title;

  // Updates the document's meta tags
  document.querySelector("meta[name='description'").content = description;
  document.querySelector("meta[property='og:title'").content = document.title;
  document.querySelector("meta[property='og:url'").content = url;
}

/**
 * Main Component
 */
class BookExchange extends React.Component {
  constructor(props) {
    super(props);

    // States
    this.state = {
      login: false,
      user: {
        _id: "",
        username: "",
      },
      checkedLogin: false,
    };
  }

  /**
   * Determines if the user should be logged in or logged out
   */
  componentDidMount() {
    fetch(`${location.origin}/session/user`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({ login: Boolean(data), checkedLogin: true });

        // Determines if session should be passed to client
        if (data) this.setState({ user: data });
        console.log(data);
      })
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  render() {
    return (
      <div>
        {/* 'forceRefresh' is set to true in order to allow the browser to reload */}
        <Router forceRefresh>
          <Prompt
            message={(location, action) => {
              if (action === "POP") {
                return `Are you sure you want to go to ${location.pathname}? You may need to reload the page.`;
              }
            }}
          />

          <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-info">
              <div className="container">
                <Link className="navbar-brand" to="/books">
                  Book Exchange
                </Link>

                <button
                  className="navbar-toggler"
                  type="button"
                  data-toggle="collapse"
                  data-target="#navbarNavAltMarkup"
                  aria-controls="navbarNavAltMarkup"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div
                  className="collapse navbar-collapse"
                  id="navbarNavAltMarkup"
                >
                  <div className="navbar-nav">
                    <NavLink className="nav-item nav-link" exact to="/books">
                      Books
                    </NavLink>
                    {!this.state.login ? (
                      <NavLink className="nav-item nav-link" to="/requests">
                        Requests
                      </NavLink>
                    ) : (
                      <Dropdown
                        id="requestsDropdownMenuLink"
                        dropLinkText="Requests"
                        links={[
                          {
                            path: "/requests",
                            exact: true,
                            text: "All Requests",
                          },
                          {
                            path: "/requests/new",
                            text: "Create Request",
                          },
                        ]}
                      />
                    )}
                    <NavLink className="nav-item nav-link" to="/trades">
                      Trades
                    </NavLink>
                    <NavLink className="nav-item nav-link" exact to="/users">
                      Users
                    </NavLink>
                  </div>

                  <div className="navbar-nav ml-auto">
                    {!this.state.checkedLogin ? (
                      ""
                    ) : !this.state.login ? (
                      <NavLink className="nav-item nav-link" to="/login">
                        Login
                      </NavLink>
                    ) : (
                      <Dropdown
                        id="userDropdownMenuLink"
                        dropLinkText={this.state.user.username}
                        links={[
                          {
                            path: "/users/" + this.state.user._id,
                            text: "Profile",
                          },
                          {
                            path: "/users/edit",
                            text: "Edit Profile",
                          },
                          {
                            path: "/books/my",
                            text: "My Books",
                          },
                          {
                            path: "/users/notifications",
                            text: "Notifications",
                          },
                          {
                            path: "/users/settings",
                            text: "Settings",
                          },
                          {
                            path: "/logout",
                            text: "Logout",
                          },
                        ]}
                      />
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </header>

          <div className="container">
            <Switch>
              <Route exact path="/books">
                <Books
                  login={this.state.login}
                  ready={this.state.checkedLogin}
                  userId={this.state.user._id}
                />
              </Route>
              <Route path="/books/my">
                <MyBooks userId={this.state.user._id} />
              </Route>
              <Route path="/books/:bookId/requests">
                <BookRequests
                  login={this.state.login}
                  userId={this.state.user._id}
                />
              </Route>
              <Route exact path="/requests">
                <Requests
                  login={this.state.login}
                  userId={this.state.user._id}
                />
              </Route>
              <Route path="/requests/new" component={CreateRequest} />
              <Route path="/trades" component={Trades} />
              <Route exact path="/users" component={Users} />
              <Route exact path="/users/edit">
                <EditProfile userId={this.state.user._id} />
              </Route>
              <Route
                exact
                path="/users/notifications"
                component={Notifications}
              />
              <Route exact path="/users/settings">
                <Settings
                  userId={this.state.user._id}
                  hasPassword={this.state.user.hasPassword}
                  preciseLocation={this.state.user.preciseLocation}
                  emailNotifications={this.state.user.emailNotifications}
                />
              </Route>
              <Route exact path="/users/:id">
                <Profile myId={this.state.user._id} />
              </Route>
              <Route path="/users/:id/books">
                <UserBooks login={this.state.login} />
              </Route>
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/password/reset" component={ResetPassword} />
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

/**
 * Component for displaying content on the Books page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Books = (props) => {
  let [books, setBooks] = useState([]);
  let [msg, setMsg] = useState("");
  let [success, setSuccess] = useState("");

  /**
   * Gets all books
   */
  const getBooks = useCallback(async () => {
    let data = await callApi(`${location.origin}/api/books`);

    try {
      setBooks(JSON.parse(data));
    } catch (e) {
      setMsg(data);
    }
  }, []);

  // Calls the getBooks() function once
  useEffect(() => getBooks(), []);

  // Gets a success message or ""
  useEffect(() => {
    callApi(`${location.origin}/session/success`).then((data) => {
      setSuccess(data);
    });
  }, []);

  return (
    <div>
      {success ? <Alert class="alert alert-success" msg={success} /> : ""}

      <form
        action="/requests/new/books"
        method="POST"
        className="panel shadow-lg"
      >
        <div className="panel-header text-white p-1">
          <h2 className="text-center">Books</h2>
        </div>

        <div className="panel-body">
          {msg.length > 0 ? (
            <div className="p-5">
              <h4 className="text-muted text-center mt-1">{msg}</h4>
            </div>
          ) : (
            <BookListGroup flush={true} myId={props.userId} books={books} />
          )}
        </div>

        <div className="panel-footer px-3 py-2">
          {!props.ready ? (
            <SpinnerButton class="btn btn-success w-25" />
          ) : !props.login ? (
            <Link className="btn btn-success" to="/login">
              Login to Add Books and Submit Requests
            </Link>
          ) : (
            <div className="buttons">
              <input
                className="btn btn-success"
                type="submit"
                value="New Request"
              />
              <Link className="btn btn-primary" to="/books/my">
                Add Books
              </Link>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

/**
 * Component for displaying content on the Requests page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Requests = (props) => {
  let [requests, setRequests] = useState([]);
  let [msg, setMsg] = useState("");
  let [success, setSuccess] = useState("");

  /**
   * Gets all requests
   */
  const getRequests = useCallback(async () => {
    let data = await callApi(`${location.origin}/api/requests`);

    try {
      setRequests(JSON.parse(data));
      getSuccess();
    } catch (e) {
      setMsg(data);
    }
  }, []);

  /**
   * Gets success messages
   */
  const getSuccess = async () => {
    let data = await callApi(`${location.origin}/session/success`);
    setSuccess(data);
  };

  // Calls the getRequests() function once
  useEffect(() => getRequests(), []);

  return (
    <div>
      {success.length > 0 ? (
        <Alert class="alert alert-success" msg={success} />
      ) : (
        ""
      )}
      <div className="panel shadow-lg">
        <div className="panel-header text-white p-1">
          <h2 className="text-center">All Requests</h2>
        </div>

        <div className="panel-body p-4">
          {msg.length > 0 ? (
            <h4 className="text-muted text-center mt-2">{msg}</h4>
          ) : (
            <RequestListGroup requests={requests} myId={props.userId} />
          )}
        </div>

        <div className="panel-footer px-3 py-2">
          {props.login ? (
            <Link className="btn btn-success" to="/requests/new">
              New Request
            </Link>
          ) : (
            <Link className="btn btn-success" to="/login">
              Login to Submit Requests
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Component for displaying content on the Request for (book) page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const BookRequests = (props) => {
  const { bookId } = useParams();
  let [requests, setRequests] = useState([]);
  let [bookTitle, setBookTitle] = useState("");
  let [msg, setMsg] = useState("");

  /**
   * Gets all requests for the book
   */
  const getRequestsForBook = useCallback(async () => {
    let data = await callApi(`${location.origin}/api/books/${bookId}/requests`);

    try {
      const json = JSON.parse(data);

      // Checks if any requests were found
      if (json.hasOwnProperty("msg")) {
        // Updates the document
        updateTitleAndMetaTags(
          `Book Exchange - Requests for ${json.bookTitle}`,
          `View all requests for the book ${json.bookTitle}`,
          `https://Manage-a-Book-Trading-Club.lchap701.repl.co/books/${bookId}/requests`
        );

        setMsg(json.msg);
        setBookTitle(json.bookTitle);
      } else {
        // Gets the title of the book
        let title = "";
        json.forEach((obj) => {
          let result = obj.takes.find((b) => b.book._id == bookId);
          if (result) title = result.book.title;
        });

        // Updates the document
        updateTitleAndMetaTags(
          `Book Exchange - Requests for ${title}`,
          `View all requests for the book ${title}`,
          `https://Manage-a-Book-Trading-Club.lchap701.repl.co/books/${bookId}/requests`
        );

        setRequests(json);
        setBookTitle(title);
      }
    } catch (e) {
      setMsg(data);
      setBookTitle("Unknown Book");
    }
  }, []);

  // Calls the getRequestsForBook() function once
  useEffect(() => getRequestsForBook(), []);

  return (
    <div>
      {props.userId.length == 0 && bookTitle.length == 0 ? (
        <Spinner />
      ) : (
        <div className="panel shadow-lg">
          <div className="panel-header text-white p-1">
            <h2 className="text-center">Requests for {bookTitle}</h2>
          </div>

          <div className="panel-body p-4">
            {msg.length > 0 ? (
              <h4 className="text-muted text-center mt-2">{msg}</h4>
            ) : (
              <RequestListGroup requests={requests} myId={props.userId} />
            )}
          </div>

          <div className="panel-footer px-3 py-2">
            {props.login ? (
              <Link className="btn btn-success" to="/requests/new">
                New Request
              </Link>
            ) : (
              <Link className="btn btn-success" to="/login">
                Login to Submit Requests
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Component for displaying content on the Create Request page
 * @returns   Returns the content that should be displayed
 */
const CreateRequest = () => {
  let [requestedBooks, setRequestedBooks] = useState({});
  let [err, setErr] = useState("");

  /**
   * Gets all requested books
   */
  const getRequestedBooks = useCallback(async () => {
    setRequestedBooks(
      await callApi(`${location.origin}/session/books`, "JSON")
    );
  }, []);

  // Calls the getRequestedBooks() function once
  useEffect(() => getRequestedBooks(), []);

  /**
   * Handles form validation and form submission
   * @param {SubmitEvent} e   Represents the event that occurred
   * @returns                 Returns nothing or is void
   */
  const submitForm = async (e) => {
    e.preventDefault();

    // Submits the form and gets the result
    let res = await sendData({
      gives: JSON.parse(document.querySelector("input#gives").value),
      takes: JSON.parse(document.querySelector("input#takes").value),
    });

    // Checks if a new page should be displayed or if an error occurred
    if (res.includes("http")) {
      location.href = res;
    } else {
      setErr(res);
    }
  };

  return (
    <div>
      {err.length > 0 ? <Alert class="alert alert-danger" msg={err} /> : ""}

      <div className="panel shadow-lg">
        <div className="panel-header text-white p-1">
          <h2 className="text-center">Create Request</h2>
        </div>

        <div className="panel-body px-2 py-3">
          {requestedBooks.gives && requestedBooks.takes ? (
            <div className="row w-100">
              <div className="col-6">
                <h5>
                  <Link to={`/users/${requestedBooks.gives[0].user._id}`}>
                    {requestedBooks.gives[0].user.username}
                  </Link>
                  {" wants to give:"}
                </h5>
                <ul className="list-group">
                  {requestedBooks.gives.map((give) => {
                    return give._id ? (
                      <GiveTakeBooks
                        _id={give._id}
                        title={give.title}
                        description={give.description}
                      />
                    ) : (
                      ""
                    );
                  })}
                </ul>
                <button
                  className="btn btn-info mt-2"
                  data-toggle="modal"
                  data-target="#giveBooksModal"
                >
                  Edit Books to Give
                </button>
                <SelectBooksForm
                  id="giveBooksModal"
                  formName="Select Books to Give"
                  booksInUse={requestedBooks.gives}
                  to="give"
                />
              </div>
              <div className="col-6">
                <h5>and wants to take:</h5>
                <ul className="list-group">
                  {requestedBooks.takes.map((take) => (
                    <GiveTakeBooks
                      _id={take._id}
                      title={take.title}
                      description={take.description}
                      user={requestedBooks.takes[0].user}
                    />
                  ))}
                </ul>
                <button
                  className="btn btn-info mt-2"
                  data-toggle="modal"
                  data-target="#takeBooksModal"
                >
                  Edit Books to Take
                </button>
                <SelectBooksForm
                  id="takeBooksModal"
                  formName="Select Books to Take"
                  booksInUse={requestedBooks.takes}
                  to="take"
                />
              </div>
            </div>
          ) : (
            ""
          )}
        </div>

        <div className="panel-footer p-2">
          {requestedBooks.gives && requestedBooks.takes ? (
            <form name="Create Request" onSubmit={submitForm}>
              <input
                id="takes"
                name="takes"
                type="text"
                hidden
                value={JSON.stringify(
                  requestedBooks.takes.map((b) => b._id) || []
                )}
              />
              <input
                id="gives"
                name="gives"
                type="text"
                hidden
                value={JSON.stringify(
                  requestedBooks.gives
                    .filter((b) => b.hasOwnProperty("_id"))
                    .map((b) => b._id) || []
                )}
              />
              <input
                type="submit"
                class="btn btn-success w-100"
                value="Submit Request"
              />
            </form>
          ) : (
            <SpinnerButton class="btn btn-success w-100" />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Component for displaying content on the Trades page
 * @returns   Returns the content that should be displayed
 */
const Trades = () => {
  let [trades, setTrades] = useState([]);
  let [msg, setMsg] = useState("");

  /**
   * Gets all trades
   */
  const getTrades = useCallback(async () => {
    let data = await callApi(`${location.origin}/api/requests?traded=true`);

    try {
      setTrades(JSON.parse(data));
    } catch (e) {
      setMsg(data);
    }
  }, []);

  // Calls the getTrades() function once
  useEffect(() => getTrades(), []);

  return (
    <div className="panel shadow-lg">
      <div className="panel-header text-white p-1">
        <h2 className="text-center">All Trades</h2>
      </div>

      <div className="panel-body p-4">
        {msg.length > 0 && trades.length == 0 ? (
          <h4 className="text-muted text-center mt-2">{msg}</h4>
        ) : (
          <TradeListGroup trades={trades} />
        )}
      </div>
    </div>
  );
};

/**
 * Component for displaying content on the Users page
 * @returns   Returns the content that should be displayed
 */
const Users = () => {
  let [users, setUsers] = useState([]);
  let [msg, setMsg] = useState("");

  /**
   * Gets all users
   */
  const getUsers = useCallback(async () => {
    let data = await callApi(`${location.origin}/api/users`);

    try {
      setUsers(JSON.parse(data));
    } catch (e) {
      setMsg(data);
    }
  }, []);

  // Calls the getUsers() function once
  useEffect(() => getUsers(), []);

  return (
    <div className="panel shadow-lg my-3">
      <div className="panel-header text-white p-2">
        <h2>Users</h2>
      </div>

      <div className="panel-body p-4">
        {msg.length > 0 ? (
          <h4 className="text-center text-muted p-5">{msg}</h4>
        ) : users.length > 0 ? (
          <ul className="list-group">
            {users.map((user) => (
              <li className="list-group-item">
                <h4>
                  <Link to={`${location.pathname}/${user._id}`}>
                    {user.username}
                  </Link>
                </h4>
                <p className="mb-2">
                  <b>City:</b> {user.city}
                  <br />
                  <b>State:</b> {user.state}
                  <br />
                  <b>Country:</b> {user.country}
                  <br />
                  <b>Joined:</b> {new Date(user.createdAt).toLocaleString()}
                </p>
                {user.books > 0 ? (
                  <span className="badge badge-info badge-pill p-2 mr-2">
                    {user.books == 1
                      ? `${user.books} Book`
                      : `${user.books} Books`}
                  </span>
                ) : (
                  ""
                )}
                {user.incomingRequests > 0 ? (
                  <span className="badge badge-warning badge-pill p-2">
                    {user.incomingRequests == 1
                      ? `${user.incomingRequests} Incoming Request`
                      : `${user.incomingRequests} Incoming Requests`}
                  </span>
                ) : (
                  ""
                )}
              </li>
            ))}
          </ul>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

/**
 * Component for displaying content on the Login page
 * @returns     Returns the content that should be displayed
 */
const Login = () => {
  return <AccountForm formName="Login" />;
};

/**
 * Component for displaying content on the Sign Up page
 * @returns     Returns the content that should be displayed
 */
const Signup = () => {
  return <AccountForm formName="Sign Up" />;
};

/**
 * Component for displaying content on the Reset Password page
 * @returns     Returns the content that should be displayed
 */
const ResetPassword = () => {
  return <AccountForm formName="Reset Password" />;
};

/**
 * Component for displaying content on the (username)'s Profile page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Profile = (props) => {
  const { id } = useParams();
  let [user, setUser] = useState({});

  /**
   * Gets the user's profile information
   */
  const getUser = useCallback(async () => {
    let json = await callApi(`${location.origin}/api/users/${id}`, "JSON");

    // Updates the document
    updateTitleAndMetaTags(
      `Book Exchange - ${json.username}'s Profile`,
      `View ${json.username}'s profile`,
      `https://Manage-a-Book-Trading-Club.lchap701.repl.co/users/${id}`
    );

    // Gets the full country and state names
    if (json.country && json.country.length > 0) {
      if (json.state && json.state.length > 0) {
        json.state = await getState(json.country, json.state);
      }
      json.country = await getCountry(json.country);
    }

    // Stores the user
    setUser(json);
  }, []);

  /**
   * Gets the full name of a country
   * @param {String} country    Represents the abbreviated country
   */
  const getCountry = async (country) => {
    let json = await callApi(
      `${location.origin}/api/countries/${country}`,
      "JSON"
    );
    return json.name;
  };

  /**
   * Gets the full name of a state
   * @param {String} country    Represents the abbreviated country
   * @param {String} state      Represents the abbreviated state
   */
  const getState = async (country, state) => {
    let json = await callApi(
      `${location.origin}/api/countries/${country}/states/${state}`,
      "JSON"
    );
    return json.name;
  };

  // Calls the getUser() function once
  useEffect(() => getUser(), []);

  return (
    <div>
      {!user.username ? (
        <Spinner />
      ) : (
        <form className="panel shadow-lg">
          <div className="panel-header text-white p-1">
            <h2 className="text-center">{user.username}'s Profile</h2>
          </div>

          <AccountFormLayout
            username={user.username}
            password={null}
            email={user.email}
            name={user.fullName}
            address={user.address || ""}
            city={user.city}
            state={user.state}
            country={user.country}
            zipPostal={user.zipPostalCode || ""}
            readonly
            hidePassword
            loaded
          />

          <div className="panel-footer px-3 py-2">
            <Link
              className="btn btn-success"
              to={props.myId == id ? "/books/my" : `${location.pathname}/books`}
            >
              {props.myId == id ? "My Books" : `${user.username}'s Books`}
            </Link>

            {props.myId == id ? (
              <Link className="btn btn-primary ml-2" to="/users/edit">
                Edit Profile
              </Link>
            ) : (
              ""
            )}
          </div>
        </form>
      )}
    </div>
  );
};

/**
 * Component for displaying content on the Edit Profile page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const EditProfile = (props) => {
  let [user, setUser] = useState({});
  let [updated, setUpdated] = useState(false);
  let mounted = useRef();

  // Gets the user's profile information
  useEffect(() => {
    // Checks if component was mounted and updates component once
    if (!mounted.current) {
      mounted.current = true;
    } else if (!updated && props.userId.length > 0) {
      callApi(`${location.origin}/api/users/${props.userId}`, "JSON").then(
        (data) => {
          setUser(data);
          setUpdated(true);
        }
      );
    }
  });

  return (
    <div>
      {!user.username ? (
        <Spinner />
      ) : (
        <AccountForm
          formName="Edit Profile"
          _id={user._id}
          username={user.username}
          email={user.email}
          name={user.fullName}
          address={user.address}
          city={user.city}
          state={user.state}
          country={user.country}
          zipPostalCode={user.zipPostalCode}
        />
      )}
    </div>
  );
};

/**
 * Component for displaying content on the My Books page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const MyBooks = (props) => {
  let [books, setBooks] = useState([]);
  let [msg, setMsg] = useState("");
  let [updated, setUpdated] = useState(false);
  let mounted = useRef();

  // Gets the user's books
  useEffect(() => {
    let text = "";

    // Checks if component was mounted and updates component once
    if (!mounted.current) {
      mounted.current = true;
    } else if (!updated && props.userId.length > 0) {
      callApi(`${location.origin}/api/users/${props.userId}/books`)
        .then((data) => {
          text = data;
          setBooks(JSON.parse(data));
          setUpdated(true);
        })
        .catch(() => {
          setMsg(text);
          setUpdated(true);
        });
    }
  });

  return (
    <form
      className="panel shadow-lg"
      method="POST"
      action="/requests/new/books"
    >
      <div className="panel-header text-white p-1">
        <h2 className="text-center">My Books</h2>
      </div>
      <div className="panel-body">
        {msg.length > 0 ? (
          <div className="p-5">
            <h4 className="text-muted text-center mt-1">{msg}</h4>
          </div>
        ) : (
          <BookListGroup flush={true} myId={props.userId} books={books} />
        )}
      </div>
      <div className="panel-footer px-3 py-2">
        <input type="submit" className="btn btn-success" value="New Request" />
        <input
          type="button"
          className="btn btn-primary ml-2"
          data-toggle="modal"
          data-target="#addBookModal"
          value="Add Book To Exchange"
        />
        <BookForm id="addBookModal" formName="Add Book" userId={props.userId} />
      </div>
    </form>
  );
};

/**
 * Component for displaying content on the (username)'s Books page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const UserBooks = (props) => {
  const { id } = useParams();
  let [books, setBooks] = useState([]);
  let [msg, setMsg] = useState("");
  let [username, setUsername] = useState("");

  /**
   * Gets all of the user's books
   */
  const getUserBooks = useCallback(async () => {
    let data = await callApi(`${location.origin}/api/users/${id}/books`);

    try {
      const json = JSON.parse(data);

      // Updates the document
      updateTitleAndMetaTags(
        `Book Exchange - ${json[0].user.username}'s Books`,
        `View ${json[0].user.username}'s books`,
        `https://Manage-a-Book-Trading-Club.lchap701.repl.co/users/${id}/books`
      );

      setUsername(json[0].user.username);
      setBooks(json);
    } catch (e) {
      // Updates the document and gets the username of the user
      const json = await callApi(`${location.origin}/api/users/${id}`, "JSON");
      updateTitleAndMetaTags(
        `Book Exchange - ${json.username}'s Books`,
        `View ${json.username}'s books`,
        `https://Manage-a-Book-Trading-Club.lchap701.repl.co/users/${id}/books`
      );

      setUsername(json.username);
      setMsg(data);
    }
  });

  // Calls getUserBooks() function once
  useEffect(() => getUserBooks(), []);

  return (
    <div>
      {msg.length == 0 && books.length == 0 ? (
        <Spinner />
      ) : (
        <form
          className="panel shadow-lg"
          method="POST"
          action="/requests/new/books"
        >
          <div className="panel-header text-white p-1">
            <h2 className="text-center">{username}'s Books</h2>
          </div>
          <div className="panel-body">
            {msg.length > 0 ? (
              <div className="p-5">
                <h4 className="text-muted text-center mt-1">{msg}</h4>
              </div>
            ) : (
              <BookListGroup books={books} />
            )}
          </div>
          <div className="panel-footer px-3 py-2">
            {props.login ? (
              <input
                type="submit"
                className="btn btn-success"
                value="New Request"
              />
            ) : (
              <Link className="btn btn-success" to="/login">
                Login to Add Books and Submit Requests
              </Link>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

/**
 * Component for displaying content on the Notifications page
 * @returns   Returns the content that should be displayed
 */
const Notifications = () => {
  let [msg, setMsg] = useState("");
  let [notifications, setNotifications] = useState([]);

  /**
   * Gets all notifications
   */
  const getNotifications = useCallback(async () => {
    let data = await callApi(`${location.origin}/session/notifications`);
    console.log(data);

    try {
      setNotifications(JSON.parse(data));
    } catch (e) {
      setMsg(data);
    }
  });

  // Calls the getNotifications() function once
  useEffect(() => getNotifications(), []);

  return (
    <div className="panel shadow-lg my-3">
      <div className="panel-header text-white p-2">
        <h2>Notifications</h2>
      </div>

      <div className="panel-body p-4">
        {msg ? (
          <div className="p-5">
            <h4 className="text-muted text-center mt-1">{msg}</h4>
          </div>
        ) : (
          <ul className="list-group">
            {notifications.map((notification) => (
              <li className="list-group-item notification">
                <small className="float-right text-muted">
                  {notification.old}
                </small>
                {notification.link ? (
                  <a href={notification.link} className="d-block">
                    {notification.message}
                  </a>
                ) : (
                  <div>{notification.message}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * Component for displaying content on the Settings page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Settings = (props) => {
  let [err, setErr] = useState("");
  let [successMsg, setSuccessMsg] = useState("");
  let [accounts, setAccounts] = useState([]);
  let [usePreciseLocation, setUsePreciseLocation] = useState(
    props.preciseLocation
  );
  let [emailNotifications, setEmailNotifications] = useState(
    props.emailNotifications
  );
  let [password, setPassword] = useState({
    old: { text: "", err: "Password is required" },
    new: { text: "", err: "Password is required" },
    confirm: { text: "", err: "Password is required" },
  });
  const socialLinks = [
    {
      path: "/auth/google",
      btn: "btn-outline-primary",
      icon: "bi bi-google",
      for: "Google",
    },
    {
      path: "/auth/facebook",
      btn: "btn-facebook",
      icon: "bi bi-facebook",
      for: "Facebook",
    },
    {
      path: "/auth/twitter",
      btn: "btn-twitter",
      icon: "bi bi-twitter",
      for: "Twitter",
    },
    {
      path: "/auth/github",
      btn: "btn-github",
      icon: "bi bi-github",
      for: "GitHub",
    },
  ];

  // Gets an OAuth error message, success message, or """ and gets all linked accounts
  useEffect(() => {
    callApi(`${location.origin}/session/auth/error`).then((data) => {
      setErr(data);
    });

    callApi(`${location.origin}/session/success`).then((data) => {
      setSuccessMsg(data);
    });

    callApi(`${location.origin}/session/auth/accounts`, "JSON").then((data) => {
      setAccounts(data);
    });
  }, []);

  // Ensures that 'usePreciseLocation' is always updated
  useEffect(() => {
    setUsePreciseLocation(props.preciseLocation);
  }, [props.preciseLocation]);

  // Ensures that 'emailNotifications' is always updated
  useEffect(() => {
    setEmailNotifications(props.emailNotifications);
  }, [props.emailNotifications]);

  /**
   * Saves changes to password fields while the user is typing
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  const updatePasswordFields = (e) => {
    if (e.target.id == "psw") {
      setPassword({
        ...password,
        old: { text: e.target.value, err: password.old.err },
      });
    } else if (e.target.id == "newPsw") {
      setPassword({
        ...password,
        new: { text: e.target.value, err: password.new.err },
      });
    } else {
      setPassword({
        ...password,
        confirm: { text: e.target.value, err: password.confirm.err },
      });
    }
  };

  /**
   * Handles form validation and form submission
   * @param {SubmitEvent} e   Represents the event that occurred
   * @returns                 Returns nothing or is void
   */
  const submitForm = async (e) => {
    e.preventDefault();
    const FORM = e.target.name;

    // Determines if the form should be submitted
    if (FORM == "Change Password" && !validateThisForm()) {
      setSuccessMsg("");
      return;
    }

    const data = { _id: props.userId };

    // Checks what data should be submitted
    if (FORM == "Change Password") {
      data.password = password.old.text;
      data.newPassword = password.new.text;
    } else {
      data.preciseLocation = usePreciseLocation;
      data.emailNotifications = emailNotifications;
    }

    // Submits the form and gets the result
    let res =
      FORM == "Change Password"
        ? await sendToUrl(data)
        : await sendData(data, "PUT");

    // Checks if a new page should be displayed or if an error occurred
    if (res.includes("change")) {
      if (FORM == "Change Password") {
        setPassword({
          ...password,
          old: { text: "", err: password.old.err },
          new: { text: "", err: password.new.err },
          confirm: { text: "", err: password.confirm.err },
        });
      }
      setSuccessMsg(res);
      setErr("");
    } else {
      setErr(res);
    }
  };

  /**
   * Validates the 'Change Password' form is being submitted
   * @returns   Returns a boolean value that determines if the form should be submitted
   */
  const validateThisForm = () => {
    let valid = true;
    const confirmPsw = document.querySelector("input#confirmPsw");

    // Validates input fields
    document
      .querySelectorAll(
        "form[name='Change Password'] input:not([type='submit'])"
      )
      .forEach((input) => {
        if (
          !input.checkValidity() ||
          (input.value.trim().length == 0 && input.required)
        ) {
          input.classList.add("is-invalid");
          valid = false;
        } else if (input.classList.contains("is-invalid")) {
          input.classList.remove("is-invalid");
        }
      });

    if (!valid) return false;

    // Compares the password
    if (password.new.text != password.confirm.text) {
      setPassword({
        ...password,
        confirm: {
          text: password.confirm.text,
          err: "Password does not match",
        },
      });
      confirmPsw.classList.add("is-invalid");
    } else {
      setPassword({
        ...password,
        confirm: {
          text: password.confirm.text,
          err: "Password is required",
        },
      });
      confirmPsw.classList.remove("is-invalid");
    }

    return valid;
  };

  /**
   * Sends data to form handler for the Change Password form
   * @param {*} data    Represents the data that should be submitted
   * @returns           Returns a message
   */
  const sendToUrl = async (data) => {
    try {
      const res = await fetch("/password/update", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Ensures that an error message is displayed
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      return await res.text();
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  return (
    <div>
      {err ? (
        <Alert class="alert alert-danger" msg={err} />
      ) : successMsg ? (
        <Alert class="alert alert-info" msg={successMsg} />
      ) : (
        ""
      )}

      <div className="panel shadow-lg my-3">
        <div className="panel-header text-white p-2">
          <h2>Settings</h2>
        </div>

        <div className="panel-body p-4">
          <ul className="list-group">
            <li className="list-group-item">
              <details open>
                <summary className="h4">Profile</summary>
                <ul className="list-group list-group-flush ml-4">
                  <li className="list-group-item px-2">
                    <form
                      name="Change Password"
                      novalidate="true"
                      onSubmit={submitForm}
                    >
                      <h5>Change Password</h5>
                      <hr />
                      {props.hasPassword ? (
                        <InputControl
                          containerClass="form-group"
                          id="psw"
                          label="Old Password"
                          type="password"
                          required
                          value={password.old.text}
                          onChange={updatePasswordFields}
                          validator="pswFeedback"
                          err={password.old.err}
                        />
                      ) : (
                        ""
                      )}

                      <div className="row">
                        <InputControl
                          containerClass="form-group col"
                          id="newPsw"
                          label={
                            props.hasPassword ? "New Password" : "Password"
                          }
                          type="password"
                          required
                          value={password.new.text}
                          onChange={updatePasswordFields}
                          validator="newPswFeedback"
                          err={password.new.err}
                        />

                        <InputControl
                          containerClass="form-group col"
                          id="confirmPsw"
                          label="Confirm Password"
                          type="password"
                          required
                          value={password.confirm.text}
                          onChange={updatePasswordFields}
                          validator="confirmPswFeedback"
                          err={password.confirm.err}
                        />
                      </div>

                      <input
                        type="submit"
                        className="btn btn-success"
                        value="Update Password"
                      />
                    </form>
                  </li>
                  <li className="list-group-item px-2">
                    <h5 className="text-danger font-weight-bold">
                      Delete Account
                    </h5>
                    <hr />
                    <p className="text-danger">
                      Please keep in mind that this action cannot be undone.
                    </p>
                    <DeleteAccountForm
                      formName="Delete Account"
                      id="deleteAccountModal"
                      userId={props.userId}
                      setErr={setErr}
                    />
                  </li>
                </ul>
              </details>
            </li>
            <li className="list-group-item">
              <details>
                <summary className="h4">Privacy</summary>
                <div className="list-group list-group-flush ml-4">
                  <div className="list-group-item px-2">
                    <form
                      name="Privacy"
                      novalidate="true"
                      onSubmit={submitForm}
                    >
                      <div className="form-check-inline">
                        <input
                          type="checkbox"
                          id="preciseLocation"
                          name="preciseLocation"
                          className="form-check-input"
                          checked={usePreciseLocation}
                          onChange={() =>
                            setUsePreciseLocation(!usePreciseLocation)
                          }
                        />
                        <label
                          for="preciseLocation"
                          className="form-check-label font-weight-bold"
                        >
                          Keep your exact location public
                        </label>
                      </div>
                      <br />
                      <small className="form-check-info">
                        Your address and zip code/postal code will be displayed
                        on your profile.
                      </small>

                      <div className="form-check-inline">
                        <input
                          type="checkbox"
                          id="notifications"
                          name="notifications"
                          className="form-check-input"
                          checked={emailNotifications}
                          onChange={() =>
                            setEmailNotifications(!emailNotifications)
                          }
                        />
                        <label
                          for="usePreciseLocation"
                          className="form-check-label font-weight-bold"
                        >
                          Recieve notification emails
                        </label>
                      </div>
                      <br />
                      <small className="form-check-info">
                        Your email address will be shared with us to email
                        notifications to you.
                      </small>
                      <hr />
                      <input
                        type="submit"
                        className="btn btn-success"
                        value="Save Changes"
                      />
                    </form>
                  </div>
                </div>
              </details>
            </li>
            <li className="list-group-item">
              <details>
                <summary className="h4">Linked Accounts</summary>
                <div className="list-group list-group-flush ml-4">
                  <div className="list-group-item px-2">
                    {socialLinks.map((link, i) => (
                      <Link
                        to={
                          accounts.find(
                            (account) =>
                              account.provider == link.for.toLocaleLowerCase()
                          )
                            ? `/users/${props.userId}/unlink/${
                                accounts.find(
                                  (account) =>
                                    account.provider ==
                                    link.for.toLocaleLowerCase()
                                )._id
                              }`
                            : link.path
                        }
                        className={`btn btn-lg btn-block btn-social ${link.btn}`}
                      >
                        <i className={link.icon}></i>
                        {accounts.find(
                          (account) =>
                            account.provider == link.for.toLocaleLowerCase()
                        )
                          ? `Unlink ${link.for}`
                          : `Link ${link.for}`}
                      </Link>
                    ))}
                  </div>
                </div>
              </details>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Component for displaying and handling forms on the Login, Sign Up, Reset Password, and Edit Profile pages
 */
class AccountForm extends React.Component {
  constructor(props) {
    super(props);

    // States
    this.state = {
      _id: props._id || "",
      username: props.username || "",
      password: "",
      email: props.email || "",
      name: props.name || "",
      address: props.address || "",
      city: props.city || "",
      state: props.state || "",
      country: props.country || "",
      zipPostal: props.zipPostalCode || "",
      errs: {
        username: "Username is required",
        password: "Password is required",
        email: "Invalid email address",
        msg: "",
      },
      options: {
        addresses: [],
        cities: [],
        states: [],
        countries: [],
        zipPostalCodes: [],
      },
      rememberMe: true,
      success: "",
    };

    // Functions
    this.getSuccessMsg = this.getSuccessMsg.bind(this);
    this.getAuthErrMsg = this.getAuthErrMsg.bind(this);
    this.getAddresses = this.getAddresses.bind(this);
    this.getCities = this.getCities.bind(this);
    this.getStates = this.getStates.bind(this);
    this.getCountries = this.getCountries.bind(this);
    this.getZipPostalCodes = this.getZipPostalCodes.bind(this);
    this.saveUsername = this.saveUsername.bind(this);
    this.savePassword = this.savePassword.bind(this);
    this.saveEmail = this.saveEmail.bind(this);
    this.saveName = this.saveName.bind(this);
    this.saveAddress = this.saveAddress.bind(this);
    this.saveCity = this.saveCity.bind(this);
    this.saveState = this.saveState.bind(this);
    this.saveCountry = this.saveCountry.bind(this);
    this.saveZipPostalCode = this.saveZipPostalCode.bind(this);
    this.updateRememberMe = this.updateRememberMe.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  /**
   * Gets initial data for country and state input fields and any messages (depending on the page)
   */
  componentDidMount() {
    if (this.props.formName == "Login") this.getSuccessMsg();
    if (this.props.formName == "Login" || this.props.formName == "Sign Up") {
      this.getAuthErrMsg();
    }

    if (
      this.props.formName != "Login" &&
      this.props.formName != "Reset Password"
    ) {
      this.getStates();
      this.getCountries();
    }
  }

  /**
   * Gets an OAuth error message or ""
   */
  getAuthErrMsg() {
    callApi(`${location.origin}/session/auth/error`).then((data) => {
      this.setState({
        errs: { ...this.state.errs, msg: data },
      });
    });
  }

  /**
   * Gets a success message or ""
   */
  getSuccessMsg() {
    callApi(`${location.origin}/session/success`).then((data) => {
      this.setState({
        success: data,
      });
    });
  }

  /**
   * Gets all possible addresses based on user input
   * @param {String} text     Represents the value of the address input field
   */
  getAddresses(text) {
    const { options, country, state, city } = this.state;

    if (text.length == 0) return;

    text +=
      city.length > 0
        ? state.length > 0
          ? " " + city + ", " + state
          : " " + city
        : "";

    console.log(text);

    const URL =
      country.length > 0
        ? `${location.origin}/api/countries/${country}/addresses/${text}`
        : `${location.origin}/api/addresses/${text}`;

    fetch(URL)
      .then((res) => res.json())
      .then((data) => {
        options.addresses = data;
        this.setState({ options: options });
      });
  }

  /**
   * Gets all possible cities based on user input
   * @returns   Returns nothing or is void
   */
  getCities() {
    const { options, country, state, zipPostal } = this.state;

    if (!country) return;

    const URL =
      zipPostal.length > 0
        ? `${location.origin}/api/countries/${country}zipPostalCodes/${zipPostal}/cities`
        : state.length > 0
        ? `${location.origin}/api/countries/${country}/states/${state}/cities`
        : `${location.origin}/api/countries/${country}/cities`;

    fetch(URL)
      .then((res) => res.json())
      .then((data) => {
        options.cities = data.map((obj) => obj.name);
        this.setState({ options: options });
      });
  }

  /**
   * Gets all possible states based on user input
   */
  getStates() {
    const { options, country, zipPostal } = this.state;
    const URL =
      country.length > 0
        ? zipPostal.length > 0
          ? `${location.origin}/api/countries/${country}/zipPostalCodes/${zipPostal}/states`
          : `${location.origin}/api/countries/${country}/states`
        : `${location.origin}/api/states`;

    fetch(URL)
      .then((res) => res.json())
      .then((data) => {
        options.states = [];
        options.states.push({ text: "Choose a state", value: "" });
        const states = data.map((state) => {
          return {
            text: state.name,
            value: state.abbr,
          };
        });
        options.states.push(...states);
        this.setState({ options: options });
      });
  }

  /**
   * Gets all possible countries
   */
  getCountries() {
    const { options } = this.state;

    fetch(`${location.origin}/api/countries`)
      .then((res) => res.json())
      .then((data) => {
        options.countries.push({ text: "Choose a country", value: "" });
        const countries = data.map((country) => {
          return {
            text: country.name,
            value: country.abbr,
          };
        });
        options.countries.push(...countries);
        this.setState({ options: options });
      });
  }

  /**
   * Gets all possible zip/postal codes based on country, state, and city
   * @returns   Returns nothing or is void
   */
  getZipPostalCodes() {
    const { options, country, state, city } = this.state;

    if (country.length == 0 || state.length == 0 || city.length == 0) return;

    fetch(
      `${location.origin}/api/countries/${country}/states/${state}/cities/${city}/zipPostalCodes`
    )
      .then((res) => res.json())
      .then((data) => {
        options.zipPostalCodes = data;
        this.setState({ options: options });
      });
  }

  /**
   * Saves the username while the user is typing
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  saveUsername(e) {
    this.setState({ username: e.target.value });
  }

  /**
   * Saves the password while the user is typing
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  savePassword(e) {
    this.setState({ password: e.target.value });
  }

  /**
   * Saves the user's email while the user is typing
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  saveEmail(e) {
    this.setState({ email: e.target.value });
  }

  /**
   * Saves the user's full name while the user is typing
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  saveName(e) {
    this.setState({ name: e.target.value });
  }

  /**
   * Saves the user's address while the user is typing
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  saveAddress(e) {
    this.setState({ address: e.target.value });
    this.getAddresses(e.target.value);
  }

  /**
   * Saves the city that the user lives at enters while they type
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  saveCity(e) {
    this.setState({ city: e.target.value });
    setTimeout(() => {
      this.getAddresses(this.state.address);
      this.getZipPostalCodes();
    }, 100);
  }

  /**
   * Saves the state that the user lives at enters while they type
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  saveState(e) {
    this.setState({ state: e.target.value });
    setTimeout(() => {
      this.getAddresses(this.state.address);
      this.getCities();
      this.getZipPostalCodes();
    }, 100);
  }

  /**
   * Saves the country that the user lives at enters while they type
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  saveCountry(e) {
    this.setState({ country: e.target.value });
    setTimeout(() => {
      this.getAddresses(this.state.address);
      this.getCities();
      this.getStates();
      this.getZipPostalCodes();
    }, 100);
  }

  /**
   * Saves the zip/postal code of the user's location while they type
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  saveZipPostalCode(e) {
    this.setState({ zipPostal: e.target.value });
    setTimeout(() => {
      this.getAddresses(this.state.address);
      this.getCities();
      this.getStates();
    }, 100);
  }

  /**
   * Updates the 'Remember me' checkbox
   * @param {InputControlEvent} e    Represents the event that occurred
   */
  updateRememberMe(e) {
    this.setState({
      rememberMe: e.target.checked,
    });
  }

  /**
   * Handles form validation and form submission
   * @param {SubmitEvent} e   Represents the event that occurred
   * @returns                 Returns nothing or is void
   */
  async submitForm(e) {
    e.preventDefault();

    // Determines if form should be submitted
    if (!validateForm()) return;

    const data =
      this.props.formName != "Edit Profile"
        ? {
            username: this.state.username,
            password: this.state.password,
          }
        : { _id: this.state._id, username: this.state.username };

    // For when users try to sign up or update their account
    if (
      this.props.formName != "Login" &&
      this.props.formName != "Reset Password"
    ) {
      data.email = this.state.email;
      data.name = this.state.name;
      data.address = this.state.address;
      data.city = this.state.city;
      data.state = this.state.state;
      data.country = this.state.country;
      data.zipPostal = this.state.zipPostal;
    }

    // Submits the form and gets the result
    let res =
      this.props.formName == "Edit Profile" ||
      this.props.formName == "Reset Password"
        ? await sendData(data, "PUT")
        : await sendData(data);

    // Checks if a new page should be displayed or if an error occurred
    if (res.includes("http")) {
      location.href = res;
    } else {
      this.setState({ errs: { ...this.state.errs, msg: res } });
    }
  }

  render() {
    return (
      <div>
        {this.state.errs.msg != "" ? (
          <Alert class="alert alert-danger" msg={this.state.errs.msg} />
        ) : this.state.success != "" ? (
          <Alert class="alert alert-success" msg={this.state.success} />
        ) : (
          ""
        )}

        <form
          onSubmit={this.submitForm}
          className="panel shadow-lg"
          name={this.props.formName}
          novalidate="true"
        >
          <div className="panel-header text-white p-1">
            <h2 className="text-center">{this.props.formName}</h2>
          </div>

          {this.props.formName == "Login" ? (
            <LoginFormLayout
              username={this.state.username}
              saveUsername={this.saveUsername}
              password={this.state.password}
              savePassword={this.savePassword}
              errs={this.state.errs}
              remember={this.state.rememberMe}
              updateRemember={this.updateRememberMe}
            />
          ) : this.props.formName == "Reset Password" ? (
            <ResetPasswordFormLayout
              username={this.state.username}
              saveUsername={this.saveUsername}
              newPassword={this.state.password}
              saveNewPassword={this.savePassword}
              errs={this.state.errs}
            />
          ) : (
            <AccountFormLayout
              allowSocialMedia={this.props.formName == "Sign Up"}
              username={this.state.username}
              saveUsername={this.saveUsername}
              password={this.state.password}
              savePassword={this.savePassword}
              errs={this.state.errs}
              email={this.state.email}
              saveEmail={this.saveEmail}
              name={this.state.name}
              saveName={this.saveName}
              address={this.state.address}
              addressOpts={this.state.options.addresses}
              saveAddress={this.saveAddress}
              city={this.state.city}
              cityOpts={this.state.options.cities}
              saveCity={this.saveCity}
              state={this.state.state}
              stateOpts={this.state.options.states}
              saveState={this.saveState}
              country={this.state.country}
              countryOpts={this.state.options.countries}
              saveCountry={this.saveCountry}
              zipPostal={this.state.zipPostal}
              zipPostalOpts={this.state.options.zipPostalCodes}
              saveZipPostalCode={this.saveZipPostalCode}
              hidePassword={this.props.formName == "Edit Profile"}
              loaded={
                this.state.options.states.length > 0 &&
                this.state.options.countries.length > 0
              }
            />
          )}

          <div className="panel-footer px-3 py-2">
            {(this.state.options.states.length > 0 &&
              this.state.options.countries.length > 0) ||
            this.props.formName == "Login" ||
            this.props.formName == "Reset Password" ? (
              <input
                className="btn btn-success w-100"
                type="submit"
                value={
                  this.props.formName == "Edit Profile"
                    ? "Update Profile"
                    : this.props.formName
                }
              />
            ) : (
              <SpinnerButton class="btn btn-success w-100" />
            )}

            {this.props.formName == "Login" ? (
              <div className="mt-2">
                <Link className="text-white" to="/signup">
                  Don't have an account?
                </Link>
                <Link className="text-white float-right" to="/password/reset">
                  Forgot Password?
                </Link>
              </div>
            ) : this.props.formName == "Reset Password" ||
              this.props.formName == "Sign Up" ? (
              <div className="mt-2">
                <Link className="text-white" to="/login">
                  {this.props.formName == "Reset Password"
                    ? "Remember Password?"
                    : "Have an account?"}
                </Link>
              </div>
            ) : this.props.formName == "Edit Profile" ? (
              <div className="mt-2">
                <Link className="text-white" to={`/users/${this.state._id}`}>
                  Cancel
                </Link>
              </div>
            ) : (
              ""
            )}
          </div>
        </form>
      </div>
    );
  }
}

/**
 * Component for displaying and handling forms on the home page and the My Books page
 */
class BookForm extends React.Component {
  constructor(props) {
    super(props);

    // States
    this.state = {
      _id: props._id || "",
      title: props.title || "",
      description: props.description || "",
      errs: ["Title is required", "Description is required"],
    };

    // Functions
    this.saveTitle = this.saveTitle.bind(this);
    this.saveDescription = this.saveDescription.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.validateThisForm = this.validateThisForm.bind(this);
    this.sendToUrl = this.sendToUrl.bind(this);
  }

  /**
   * Saves the title of a book
   * @param {InputControlEvent} e   Represents the event that occurred
   */
  saveTitle(e) {
    this.setState({ title: e.target.value });
  }

  /**
   * Saves the description provided by the user
   * @param {InputControlEvent} e   Represents the event that occurred
   */
  saveDescription(e) {
    this.setState({ description: e.target.value });
  }

  /**
   * Handles form validation and form submission
   * @param {SubmitEvent} e   Represents the event that occurred
   * @returns                 Returns nothing or is void
   */
  async submitForm(e) {
    e.preventDefault();

    // Determines if form should be submitted
    if (!this.validateThisForm()) return;

    const data = { user: this.props.userId };

    if (this.props.formName != "Delete Book") {
      data.title = this.state.title;
      data.description = this.state.description;
    }

    // Submits the form and gets the result
    let res =
      this.props.formName == "Edit Book"
        ? await this.sendToUrl(data, "PUT")
        : this.props.formName == "Delete Book"
        ? await this.sendToUrl(data, "DELETE")
        : await sendData(data);

    // Checks if the page should reload
    if (res == "success") {
      location.reload();
    } else {
      let { errs } = this.state;
      errs[0] = res;
      this.setState({ errs: errs });
    }
  }

  /**
   * Validates the form that is being submitted
   * @returns   Returns a boolean value that determines if the form should be submitted
   */
  validateThisForm() {
    let valid = true;

    // Validates input fields
    document
      .querySelectorAll(
        `form[name='${this.props.formName}'] input:not([type='submit'])`
      )
      .forEach((input) => {
        if (
          !input.checkValidity() ||
          (input.value.trim().length == 0 && input.required)
        ) {
          input.classList.add("is-invalid");
          valid = false;
        } else if (input.classList.contains("is-invalid")) {
          input.classList.remove("is-invalid");
        }
      });

    return valid;
  }

  /**
   * Sends data to form handlers for the Edit Book and Delete Book forms
   * @param {*} data            Represents the data that should be submitted
   * @param {String} method     Represents the HTTP method to use
   * @returns                   Returns a message
   */
  async sendToUrl(data, method) {
    try {
      const URL =
        method == "PUT"
          ? `${location.origin}/books/${this.state._id}/update`
          : `${location.origin}/books/${this.state._id}/delete`;
      console.log(URL);

      const res = await fetch(URL, {
        method: method,
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(res);

      // Ensures that an error message is displayed
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      return await res.text();
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  }

  render() {
    return (
      <form
        name={this.props.formName}
        className="modal fade"
        tabindex="-1"
        id={this.props.id}
        role="dialog"
        aria-labelledby={`${this.props.id}Label`}
        aria-hidden="true"
        onSubmit={this.submitForm}
        novalidate="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={`${this.props.id}Label`}>
                {this.props.formName}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <InputControl
                containerClass="form-group"
                id="title"
                label="Title"
                type="text"
                required={!Boolean(this.props.readonly)}
                readonly={Boolean(this.props.readonly)}
                value={this.state.title}
                onChange={this.saveTitle}
                validator="titleFeedback"
                err={this.state.errs[0]}
              />

              <InputControl
                containerClass="form-group"
                id="desc"
                label="Description"
                type="text"
                placeholder="Author, condition..."
                required={!Boolean(this.props.readonly)}
                readonly={Boolean(this.props.readonly)}
                value={this.state.description}
                onChange={this.saveDescription}
                validator="descFeedback"
                err={this.state.errs[1]}
              />
            </div>

            <div className="modal-footer">
              <input
                type="submit"
                className="btn btn-primary"
                value={
                  this.props.formName == "Edit Book"
                    ? "Update Book"
                    : this.props.formName
                }
              />
              <input
                type="button"
                className="btn btn-danger"
                data-dismiss="modal"
                value="Cancel"
              />
            </div>
          </div>
        </div>
      </form>
    );
  }
}

/**
 * Component for displaying a form for selecting books to use for trades
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const SelectBooksForm = (props) => {
  let [books, setBooks] = useState([]);

  /**
   * Gets books to give/take during trades and selects books that are in use
   */
  const getBooksToUse = useCallback(async () => {
    let json = await callApi(
      `${location.origin}/requests/new/books/select?to=${props.to}`,
      "JSON"
    );
    setBooks(json);
  }, []);

  // Calls getBooksToUse() function once
  useEffect(() => getBooksToUse(), []);

  return (
    <form
      action="/requests/new/books"
      method="POST"
      name={props.formName}
      className="modal fade"
      tabindex="-1"
      id={props.id}
      role="dialog"
      aria-labelledby={`${props.id}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${props.id}Label`}>
              {`${props.formName}`}
            </h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <BookListGroup
              books={books}
              booksInUse={JSON.stringify(
                props.booksInUse.map((sb) => `${sb._id}`)
              )}
            />
          </div>

          <div className="modal-footer">
            <input type="submit" className="btn btn-primary" value="Continue" />
            <input
              type="button"
              className="btn btn-danger"
              data-dismiss="modal"
              value="Cancel"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

/**
 * Component for displaying a form for deleting accounts on the Settings page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const DeleteAccountForm = (props) => {
  /**
   * Handles form validation and form submission
   * @param {SubmitEvent} e   Represents the event that occurred
   * @returns                 Returns nothing or is void
   */
  const submitForm = async (e) => {
    e.preventDefault();

    // Submits the form and gets the result
    let res = await sendData({ _id: props.userId }, "DELETE");

    // Checks if a new page should be displayed or if an error occurred
    if (res.includes("http")) {
      location.href = res;
    } else {
      props.setErr(res);
    }
  };

  return (
    <div>
      <button
        className="btn btn-danger"
        type="button"
        data-toggle="modal"
        data-target={`#${props.id}`}
      >
        {props.formName}
      </button>

      <form
        className="modal fade"
        name={props.formName}
        onSubmit={submitForm}
        tabindex="-1"
        id={props.id}
        role="dialog"
        aria-labelledby={`${props.id}Label`}
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={`${props.id}Label`}>
                {props.formName}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <h4 className="text-center">
                Do you wish to delete your account?
              </h4>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                Yes
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-dismiss="modal"
              >
                No
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

/**
 * Component for handling the layout of the Login form
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const LoginFormLayout = (props) => {
  return (
    <div className="panel-body border-top-0 border-bottom-0 p-3">
      <SocialMedia btnText="Login with social media" />

      <InputControl
        containerClass="form-group"
        id="uname"
        label="Username"
        type="text"
        required
        value={props.username}
        onChange={props.saveUsername}
        validator="unameFeedback"
        err={props.errs.username}
      />

      <InputControl
        containerClass="form-group"
        id="psw"
        label="Password"
        type="password"
        required
        value={props.password}
        onChange={props.savePassword}
        validator="pswFeedback"
        err={props.errs.password}
      />

      <div className="form-check-inline">
        <input
          name="remember-me"
          id="remember-me"
          className="form-check-input"
          type="checkbox"
          checked={props.remember}
          onClick={props.updateRemember}
        />
        <label for="remember-me" className="form-check-label">
          Remember me
        </label>
      </div>
    </div>
  );
};

/**
 * Component for handling the layout of the Reset Password form
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const ResetPasswordFormLayout = (props) => {
  return (
    <div className="panel-body border-top-0 border-bottom-0 p-3">
      <InputControl
        containerClass="form-group"
        id="uname"
        label="Username"
        type="text"
        required
        value={props.username}
        onChange={props.saveUsername}
        validator="unameFeedback"
        err={props.errs.username}
      />

      <InputControl
        containerClass="form-group"
        id="newPsw"
        label="New Password"
        type="password"
        required
        value={props.newPassword}
        onChange={props.saveNewPassword}
        validator="newPswFeedback"
        err={props.errs.password}
      />
    </div>
  );
};

/**
 * Component for handling the layout of the forms on the Sign Up, Profile, and Edit Profile pages
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const AccountFormLayout = (props) => {
  return (
    <div className="panel-body border-top-0 border-bottom-0 p-3">
      {props.allowSocialMedia ? (
        props.loaded ? (
          <SocialMedia btnText="Sign up with social media" />
        ) : (
          <div>
            <SpinnerButton class="btn btn-info w-100" />
            <div className="seperator text-secondary">
              <span>or</span>
            </div>
          </div>
        )
      ) : (
        ""
      )}

      <div className="row">
        {props.loaded ? (
          <InputControl
            containerClass="form-group col"
            id="uname"
            label="Username"
            type="text"
            required={!Boolean(props.readonly)}
            value={props.username}
            readonly={Boolean(props.readonly)}
            onChange={props.saveUsername || null}
            validator={!Boolean(props.readonly) ? "unameFeedback" : null}
            err={props.errs ? props.errs.username : null}
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" required />
        )}

        {!props.hidePassword ? (
          props.loaded ? (
            <InputControl
              containerClass="form-group col"
              id="psw"
              label="Password"
              type="password"
              required
              value={props.password}
              onChange={props.savePassword}
              validator="pswFeedback"
              err={props.errs.password}
            />
          ) : (
            <SkeletonFormControl containerClass="form-group col" required />
          )
        ) : (
          ""
        )}
      </div>

      <div className="row">
        {props.loaded ? (
          <InputControl
            containerClass="form-group col"
            id="email"
            label="Email"
            type="email"
            value={props.email}
            readonly={Boolean(props.readonly)}
            onChange={props.saveEmail || null}
            validator={!props.readonly ? "emailFeedback" : null}
            err={props.errs ? props.errs.email : null}
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" />
        )}

        {props.loaded ? (
          <InputControl
            containerClass="form-group col"
            id="name"
            label="Full Name"
            type="text"
            value={props.name}
            readonly={Boolean(props.readonly)}
            onChange={props.saveName || null}
            validator=""
            err=""
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" />
        )}
      </div>

      <div className="row">
        {props.loaded ? (
          <InputControl
            containerClass="form-group col-7"
            id="addr"
            label="Address"
            list={!props.readonly ? "addresses" : null}
            type="text"
            value={props.address}
            readonly={Boolean(props.readonly)}
            onChange={props.saveAddress || null}
            validator=""
            err=""
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" />
        )}
        {!props.readonly && props.loaded ? (
          <Datalist id="addresses" options={props.addressOpts} />
        ) : (
          ""
        )}

        {props.loaded ? (
          <InputControl
            containerClass="form-group col"
            id="city"
            label="City"
            list={!props.readonly ? "cities" : null}
            type="text"
            value={props.city}
            readonly={Boolean(props.readonly)}
            onChange={props.saveCity || null}
            validator=""
            err=""
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" />
        )}
        {!props.readonly && props.loaded ? (
          <Datalist id="cities" options={props.cityOpts} />
        ) : (
          ""
        )}
      </div>

      <div className="row">
        {props.readonly ? (
          <InputControl
            containerClass="form-group col"
            id="state"
            label="State"
            type="text"
            value={props.state}
            readonly={props.readonly}
            validator=""
            err=""
          />
        ) : props.loaded ? (
          <Select
            containerClass="form-group col"
            id="state"
            label="State"
            options={props.stateOpts}
            value={props.state}
            onChange={props.saveState}
            validator=""
            err=""
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" />
        )}

        {props.readonly ? (
          <InputControl
            containerClass="form-group col"
            id="country"
            label="Country"
            type="text"
            readonly={props.readonly}
            value={props.country}
            validator=""
            err=""
          />
        ) : props.loaded ? (
          <Select
            containerClass="form-group col"
            id="country"
            label="Country"
            value={props.country}
            options={props.countryOpts}
            onChange={props.saveCountry}
            validator=""
            err=""
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" />
        )}

        {props.loaded ? (
          <InputControl
            containerClass="form-group col-4"
            id="zipPostal"
            label="Zip/Postal"
            list={!props.readonly ? "zipPostalCodes" : null}
            type="text"
            value={props.zipPostal}
            readonly={Boolean(props.readonly)}
            onChange={props.saveZipPostalCode || null}
            validator=""
            err=""
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" />
        )}
        {!props.readonly && props.loaded ? (
          <Datalist id="zipPostalCodes" options={props.zipPostalOpts} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

/**
 * Component for displaying and handling the Social Media modal
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const SocialMedia = (props) => {
  return (
    <div>
      <button
        className="btn btn-info w-100"
        type="button"
        data-toggle="modal"
        data-target="#socialMediaModal"
      >
        {props.btnText}
      </button>

      <div className="seperator text-secondary">
        <span>or</span>
      </div>

      <div
        className="modal fade"
        tabindex="-1"
        id="socialMediaModal"
        role="dialog"
        aria-labelledby="socialMediaLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="socialMediaLabel">
                {props.btnText.includes("Login")
                  ? "Login with..."
                  : "Sign up with..."}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <Link
                to="/auth/google"
                className="btn btn-lg btn-block btn-social btn-outline-primary"
              >
                <i className="bi bi-google"></i>
                Google
              </Link>
              <Link
                to="/auth/facebook"
                className="btn btn-lg btn-block btn-social btn-facebook"
              >
                <i className="bi bi-facebook"></i>
                Facebook
              </Link>
              <Link
                to="/auth/twitter"
                className="btn btn-lg btn-block btn-social btn-twitter"
              >
                <i className="bi bi-twitter"></i>
                Twitter
              </Link>

              <div className="seperator text-secondary">
                <span>Developers</span>
              </div>

              <Link
                to="/auth/github"
                className="btn btn-lg btn-block btn-social btn-github"
              >
                <i className="bi bi-github"></i>
                GitHub
              </Link>
            </div>

            <div className="modal-footer">
              <button type="button" class="btn btn-danger" data-dismiss="modal">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Component for displaying a list group for books
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const BookListGroup = (props) => {
  let [selectedBooks, setSelectedBooks] = useState(props.booksInUse || "[]");

  /**
   * Gets the selected books and adds them to the form
   * @returns   Returns the selected books in JSON
   */
  const getSelectedBooks = () => {
    let books = [
      ...document.querySelectorAll("input[type='checkbox']:checked"),
    ].map((input) => input.id);
    return JSON.stringify(books);
  };

  return (
    <div>
      <ul className={`list-group${props.flush ? " list-group-flush" : ""}`}>
        {props.books.map((book) => {
          let location = book.user.city == "N/A" ? "" : book.user.city;
          location += book.user.state == "N/A" ? "" : " " + book.user.state;
          location +=
            book.user.country != "N/A"
              ? book.user.state != "N/A"
                ? ", " + book.user.country
                : book.user.city != "N/A"
                ? " " + book.user.country
                : book.user.country
              : book.user.state == "N/A" && book.user.city == "N/A"
              ? book.user.country
              : "";
          return (
            <li className="list-group-item">
              <div className="row align-items-center">
                <input
                  className="col-2"
                  id={`book${book._id}`}
                  name={`book${book._id}`}
                  type="checkbox"
                  checked={Boolean(
                    JSON.parse(selectedBooks).find((sb) =>
                      sb.includes(book._id)
                    )
                  )}
                  onChange={() => setSelectedBooks(getSelectedBooks())}
                />
                <label for={`book${book._id}`} className="col-10">
                  {book.requests.count > 0 ? (
                    <span className="float-right">
                      <Link
                        className="float-right"
                        to={`/books/${book._id}/requests`}
                      >
                        <b>Requests </b>
                        <span className="badge badge-primary">
                          {book.requests.count}
                        </span>
                      </Link>
                      <br />
                      {"("}
                      {book.requests.users.map((user, i) => {
                        return (
                          <span>
                            <b>
                              <Link to={`/users/${user._id}`}>
                                {user.username}
                              </Link>
                            </b>
                            {i < book.requests.users.length - 1 ? ", " : ""}
                          </span>
                        );
                      })}
                      {")"}
                    </span>
                  ) : (
                    ""
                  )}
                  <h5 className="my-1">{book.title}</h5>
                  <b className="d-block">{book.description}</b>
                  <small className="text-muted">
                    from
                    <Link to={`/users/${book.user._id}`}>
                      {` ${book.user.username} `}
                    </Link>
                    {`in ${location}`}
                    {!book.createdAt && !book.addedAt ? (
                      ""
                    ) : (
                      <span>
                        <br />
                        {"added "}
                        {book.createdAt
                          ? new Date(book.createdAt).toLocaleString()
                          : new Date(book.addedAt).toLocaleString()}
                      </span>
                    )}
                  </small>
                </label>
              </div>
              {props.myId == book.user._id ? (
                <Options
                  myId={props.myId}
                  _id={book._id}
                  title={book.title}
                  description={book.description}
                />
              ) : (
                ""
              )}
            </li>
          );
        })}
      </ul>
      <input id="books" name="books" type="text" hidden value={selectedBooks} />
    </div>
  );
};

/**
 * Component for displaying a list group for requests
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const RequestListGroup = (props) => {
  return (
    <ul className="list-group">
      {props.requests.map((request) => (
        <li className="list-group-item no-bg pb-4">
          <small className="d-block mb-2">
            <b>Requested</b>: {new Date(request.requestedAt).toLocaleString()}
          </small>
          <div className="row">
            {request.gives[0].user._id == props.myId ? (
              <Link
                className="text-danger request-link"
                to={`/requests/${request._id}/cancel`}
              >
                Cancel Request
              </Link>
            ) : request.takes.find((take) => take.user._id == props.myId) ? (
              <Link
                className="text-success request-link"
                to={`/requests/${request._id}/accept/${props.myId}`}
              >
                Accept Request
              </Link>
            ) : (
              ""
            )}
            <div className="col-6">
              <h6>
                <Link to={`/users/${request.gives[0].user._id}`}>
                  {request.gives[0].user.username}
                </Link>
                {" wants to give:"}
              </h6>
              <ul className="list-group">
                {request.gives.map((give) => (
                  <GiveTakeBooks
                    _id={give.book._id}
                    title={give.book.title}
                    description={give.book.description}
                    requests={give.book.requests}
                  />
                ))}
              </ul>
            </div>
            <div className="col-6">
              <h6>and wants to take:</h6>
              <ul className="list-group">
                {request.takes.map((take) => (
                  <GiveTakeBooks
                    _id={take.book._id}
                    title={take.book.title}
                    description={take.book.description}
                    requests={take.book.requests}
                    user={request.takes[0].user}
                  />
                ))}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

/**
 * Component for displaying completed trades
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const TradeListGroup = (props) => {
  return (
    <ul className="list-group">
      {props.trades.map((trade) => {
        return (
          <li className="list-group-item no-bg pb-4">
            <small className="d-block mb-2">
              <b>Traded</b>: {new Date(trade.tradedAt).toLocaleString()}
            </small>
            <div className="row">
              <div className="col-6">
                <h6>
                  <Link to={`/users/${trade.takes[0].user._id}`}>
                    {trade.takes[0].user.username}
                  </Link>
                  {" received:"}
                </h6>
                <ul className="list-group">
                  {trade.takes.map((take) => (
                    <GiveTakeBooks
                      _id={take.book._id}
                      title={take.book.title}
                      description={take.book.description}
                      requests={take.book.requests}
                    />
                  ))}
                </ul>
              </div>
              <div className="col-6">
                <h6>
                  <Link to={`/users/${trade.gives[0].user._id}`}>
                    {trade.gives[0].user.username}
                  </Link>
                  {" received:"}
                </h6>
                <ul className="list-group">
                  {trade.gives.map((give) => (
                    <GiveTakeBooks
                      _id={give.book._id}
                      title={give.book.title}
                      description={give.book.description}
                      requests={give.book.requests}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

/**
 * Component for displaying options for editing or deleting a book
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Options = (props) => {
  return (
    <div className="options">
      <button
        type="button"
        className="btn btn-primary"
        data-toggle="modal"
        data-target="#editBookModal"
      >
        <i className="bi bi-pencil-fill"></i>
      </button>
      <BookForm
        id="editBookModal"
        formName="Edit Book"
        userId={props.myId}
        _id={props._id}
        title={props.title}
        description={props.description}
      />
      <button
        type="button"
        className="btn btn-danger"
        data-toggle="modal"
        data-target="#deleteBookModal"
      >
        <i className="bi bi-trash-fill"></i>
      </button>
      <BookForm
        id="deleteBookModal"
        formName="Delete Book"
        userId={props.myId}
        _id={props._id}
        title={props.title}
        description={props.description}
        readonly={true}
      />
    </div>
  );
};

/**
 * Component for display books that were or are to be given/taken
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const GiveTakeBooks = (props) => {
  return (
    <li className="list-group-item">
      {props.requests > 0 ? (
        <small>
          <Link className="float-right" to={`/books/${props._id}/requests`}>
            Requests{" "}
            <span className="badge badge-primary">{props.requests}</span>
          </Link>
        </small>
      ) : (
        ""
      )}
      <h5 className="my-1">
        {props.title}
        {props.user ? (
          <small>
            <span className="text-muted"> from</span>
            <Link to={`/users/${props.user._id}`}> {props.user.username}</Link>
          </small>
        ) : (
          ""
        )}
      </h5>
      <b>{props.description}</b>
    </li>
  );
};

/**
 * Component for displaying input form controls with label
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const InputControl = (props) => {
  return (
    <div className={props.containerClass}>
      {!props.hidden ? (
        <label for={props.id}>
          {props.label}
          {!props.required && !props.readonly ? <small> (Optional)</small> : ""}
        </label>
      ) : (
        ""
      )}
      <Input
        id={props.id}
        name={props.id}
        type={props.type}
        list={props.list || null}
        required={Boolean(props.required)}
        value={props.value}
        placeholder={props.placeholder || null}
        autocomplete={props.list || props.readonly ? "off" : "on"}
        onChange={props.onChange || null}
        aria-describedby={props.validator || null}
        readonly={Boolean(props.readonly)}
      />
      {props.validator ? (
        <div id={props.validator} className="invalid-feedback">
          {props.err}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

/**
 * Component for displaying input fields
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Input = (props) => {
  return (
    <input
      id={props.id}
      name={props.id}
      type={props.type}
      list={props.list}
      className={`form-control${
        props.readonly && props.value ? "-plaintext" : ""
      }`}
      required={Boolean(props.required)}
      placeholder={props.placeholder}
      value={props.value}
      autocomplete={props.autocomplete || null}
      onChange={props.onChange}
      aria-describedby={props.validator}
      readOnly={Boolean(props.readonly)}
    />
  );
};

/**
 * Component for displaying datalists
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Datalist = (props) => {
  return (
    <datalist id={props.id}>
      {props.options.map((option) => {
        return <option value={option} />;
      })}
    </datalist>
  );
};

/**
 * Component for displaying select form controls
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Select = (props) => {
  return (
    <div className={props.containerClass}>
      <label for={props.id}>
        {props.label}
        {!props.required ? <small> (Optional)</small> : ""}
      </label>
      <select
        id={props.id}
        name={props.id}
        className="form-control"
        required={props.required || false}
        value={props.value}
        onChange={props.onChange || null}
        aria-describedby={props.validator}
      >
        {props.options.map((option) => {
          return <option value={option.value}>{option.text}</option>;
        })}
      </select>
      {props.validator ? (
        <div id={props.validator} className="invalid-feedback">
          {props.err}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

/**
 * Component for creating dropdown menus in the navbar
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the dropdown menu that should be displayed
 */
const Dropdown = (props) => {
  return (
    <div className="dropdown">
      <a
        className="nav-link dropdown-toggle"
        href="#"
        id={props.id}
        role="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {props.dropLinkText}
      </a>

      <div
        className={`dropdown-menu${
          props.id == "userDropdownMenuLink" ? " dropdown-menu-right" : ""
        }`}
        aria-labelledby={props.id}
      >
        {props.links.map((link) => {
          return (
            <NavLink
              className="dropdown-item nav-item"
              exact={Boolean(link.exact)}
              to={link.path}
            >
              {link.text}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Component for displaying alerts
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Alert = (props) => {
  return (
    <div className={props.class} role="alert">
      {props.msg}
    </div>
  );
};

/**
 * Component for displaying a spinner loading animation
 * @returns   Returns the content that should be displayed
 */
const Spinner = () => {
  return (
    <div className="overlay d-flex justify-content-center align-items-center">
      <div className="spinner-border text-light" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

/**
 * Component for displaying a spinner loading animation for buttons
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the dropdown menu that should be displayed
 */
const SpinnerButton = (props) => {
  return (
    <button className={props.class} type="button" disabled>
      <span
        className="spinner-grow spinner-grow-sm"
        role="status"
        aria-hidden="true"
      ></span>
      <span class="sr-only">Loading...</span>
    </button>
  );
};

/**
 * Component for displaying a skeleton loading animation
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Skeleton = (props) => {
  return (
    <div className="skeleton-wrapper ">
      <div className="skeleton">
        <div className={props.type}></div>
      </div>
      <div className="shimmer-wrapper">
        <div className="shimmer"></div>
      </div>
    </div>
  );
};

/**
 * Component for displaying a skeleton loading animation for form controls
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const SkeletonFormControl = (props) => {
  return (
    <div className={props.containerClass}>
      <Skeleton type={`text-${!props.required ? "md" : "sm"}`} />
      <Skeleton type="form-control" />
    </div>
  );
};

ReactDOM.render(<BookExchange />, document.querySelector("#root"));
