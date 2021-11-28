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
 * @returns               Returns the result
 */
async function callApi(url) {
  try {
    let res = await fetch(url);

    // Displays a special error message
    if (!res.ok) throw Error(`Response ${res.status}: ${res.statusText}`);

    return await res.json();
  } catch (e) {
    alert(e);
    console.error(e);
  }
}

/**
 * Validates input fields in the form and determines if the form is valid
 * @returns     Returns a boolean value that determines if the form should be submitted
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
    if (!res.ok) {
      // Allows for redirects to the user's profile
      if (method != "PUT") {
        throw new Error(`Request failed: ${res.status}`);
      } else if (res.url != `${location.origin}/users/${data._id}`) {
        throw new Error(`Request failed: ${res.status}`);
      }
    }

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
                />
              </Route>
              <Route path="/books/my">
                <MyBooks userId={this.state.user._id} />
              </Route>
              <Route exact path="/requests" component={Requests} />
              <Route path="/requests/new" component={CreateRequest} />
              <Route path="/trades" component={Trades} />
              <Route exact path="/users" component={Users} />
              <Route exact path="/users/edit">
                <EditProfile userId={this.state.user._id} />
              </Route>
              <Route exact path="/users/:id">
                <Profile myId={this.state.user._id} />
              </Route>
              <Route path="/users/:id/books" component={UserBooks} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/logout">
                <Redirect to="/books" />
              </Route>
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

  // Gets all books
  const getBooks = useCallback(async () => {
    setBooks(await callApi(`${location.origin}/api/books`));
  }, []);
  useEffect(() => getBooks(), []);

  return (
    <form
      action="/requests/new/books"
      method="POST"
      className="panel scroll shadow-lg"
    >
      <div className="panel-header text-white p-1 mx-auto">
        <h2 className="text-center">Books</h2>
      </div>

      <div className="panel-body">
        {books.length == 0 ? (
          <div className="item border-top-0 border-bottom-0 p-5">
            <h4 className="text-muted text-center mt-1">
              No books are available at this time
            </h4>
          </div>
        ) : (
          books.map((book) => {
            return (
              <div className="item border-top-0 border-bottom-0">
                <div className="form-group">
                  <input
                    id={`book${book._id}`}
                    name={`book${book._id}`}
                    type="checkbox"
                  />
                  <label for={`book${book._id}`}></label>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="panel-footer p-2">
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
            <Link className="btn btn-success" to="/books/my">
              My Books
            </Link>
          </div>
        )}
      </div>
    </form>
  );
};

/**
 * Component for displaying content on the Requests page
 * @returns   Returns the content that should be displayed
 */
const Requests = () => {
  let [requests, setRequests] = useState([]);

  // Gets all requests
  const getRequests = useCallback(async () => {
    setRequests(await callApi(`${location.origin}/api/requests`));
  }, []);
  useEffect(() => getRequests(), []);

  return <h2>All Requests</h2>;
};

/**
 * Component for displaying content on the Request for (book) page
 * @returns   Returns the content that should be displayed
 */
const BookRequests = () => {
  const { bookId } = useParams();
  let [takeBooks, setTakeBooks] = useState([]);
  let [giveBooks, setGiveBooks] = useState([]);

  // Gets all requests for the book
  const getRequestsForBook = useCallback(async () => {
    let data = await callApi(`${location.origin}/api/books/${bookId}/requests`);
    setTakeBooks(takeBooks.push([...data.take.books]));
    setGiveBooks(giveBooks.push([...data.give.books]));
  }, []);
  useEffect(() => getRequestsForBook(), []);

  return (
    <h2>Requests for {takeBooks.find((book) => book._id == bookId).title}</h2>
  );
};

/**
 * Component for displaying content on the Create Request page
 * @returns   Returns the content that should be displayed
 */
const CreateRequest = () => {
  let [requestedBooks, setRequestedBooks] = useState([]);

  // Gets all requested books
  const getRequestedBooks = useCallback(async () => {
    setRequestedBooks(await callApi(`${location.origin}/session/books`));
  }, []);
  useEffect(() => getRequestedBooks(), []);

  return (
    <div>
      <div className="panel shadow-lg">
        <div className="panel-header text-center">
          <h2>Create Request</h2>
        </div>

        <div className="panel-body">
          {requestedBooks.map((book) => {
            <div className="item" id={book._id}>
              {book.name}
            </div>;
          })}
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

  // Gets all trades
  const getTrades = useCallback(async () => {
    setTrades(await callApi(`${location.origin}/api/requests?trades=true`));
  }, []);
  useEffect(() => getTrades(), []);

  return <h2>Trades</h2>;
};

/**
 * Component for displaying content on the Users page
 * @returns   Returns the content that should be displayed
 */
const Users = () => {
  let [users, setUsers] = useState([]);

  // Gets all users
  const getUsers = useCallback(async () => {
    setUsers(await callApi(`${location.origin}/api/users`));
  }, []);
  useEffect(() => getUsers(), []);

  return <h2>All Users</h2>;
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
    let json = await callApi(`${location.origin}/api/users/${id}`);

    // Updates the document
    updateTitleAndMetaTags(
      `Book Exchange - ${json.username}'s Profile`,
      `View ${json.username}'s profile`,
      `https://Manage-a-Book-Trading-Club.lchap701.repl.co/users/${id}`
    );

    // Gets the full country and state names
    if (json.country.length > 0) {
      if (json.state.length > 0) {
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
    let json = await callApi(`${location.origin}/api/countries/${country}`);
    return json.name;
  };

  /**
   * Gets the full name of a state
   * @param {String} country    Represents the abbreviated country
   * @param {String} state      Represents the abbreviated state
   */
  const getState = async (country, state) => {
    let json = await callApi(
      `${location.origin}/api/countries/${country}/states/${state}`
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
          <div className="panel-header text-white p-1 mx-auto">
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
              <Link className="btn btn-success ml-1" to="/users/edit">
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
      callApi(`${location.origin}/api/users/${props.userId}`).then((data) => {
        setUser(data);
        setUpdated(true);
      });
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
  console.log(props.userId);
  return <h2>My Books</h2>;
};

/**
 * Component for displaying content on the (username)'s Books page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const UserBooks = (props) => {
  return <h2>{props.user.username}'s Books</h2>;
};

/**
 * Component for displaying and handling forms on the Login, Sign Up, and Edit Profile pages
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
      errs: [
        "Username is required",
        "Password is required",
        "Invalid email address",
        "",
      ],
      options: {
        addresses: [],
        cities: [],
        states: [],
        countries: [],
        zipPostalCodes: [],
      },
    };

    // Functions
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
    this.submitForm = this.submitForm.bind(this);
  }

  /**
   * Gets initial data for country and state input fields
   */
  componentDidMount() {
    this.getStates();
    this.getCountries();
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
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveUsername(e) {
    this.setState({ username: e.target.value });
  }

  /**
   * Saves the password while the user is typing
   * @param {InputEvent} e    Represents the event that occurred
   */
  savePassword(e) {
    this.setState({ password: e.target.value });
  }
  /**
   * Saves the user's email while the user is typing
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveEmail(e) {
    this.setState({ email: e.target.value });
  }

  /**
   * Saves the user's full name while the user is typing
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveName(e) {
    this.setState({ name: e.target.value });
  }

  /**
   * Saves the user's address while the user is typing
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveAddress(e) {
    this.setState({ address: e.target.value });
    this.getAddresses(e.target.value);
  }

  /**
   * Saves the city that the user lives at enters while they type
   * @param {InputEvent} e    Represents the event that occurred
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
   * @param {InputEvent} e    Represents the event that occurred
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
   * @param {InputEvent} e    Represents the event that occurred
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
   * @param {InputEvent} e    Represents the event that occurred
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
    if (this.props.formName != "Login") {
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
      this.props.formName == "Edit Profile"
        ? await sendData(data, "PUT")
        : await sendData(data);

    // Checks if a new page should be displayed or if an error occurred
    if (res.includes("http")) {
      location.href = res;
    } else {
      let { errs } = this.state;
      errs[3] = res;
      this.setState({ errs: errs });
    }
  }

  render() {
    return (
      <form
        onSubmit={this.submitForm}
        className="panel shadow-lg"
        name={this.props.formName}
        novalidate="true"
      >
        {this.state.errs[3] != "" ? (
          <Alert class="alert alert-danger" msg={this.state.errs[3]} />
        ) : (
          ""
        )}

        <div className="panel-header text-white p-1 mx-auto">
          <h2 className="text-center">{this.props.formName}</h2>
        </div>

        {this.props.formName == "Login" ? (
          <LoginFormLayout
            username={this.state.username}
            saveUsername={this.saveUsername}
            password={this.state.password}
            savePassword={this.savePassword}
            errs={this.state.errs}
          />
        ) : (
          <AccountFormLayout
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
          this.props.formName == "Login" ? (
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
                Sign Up
              </Link>
            </div>
          ) : (
            ""
          )}
        </div>
      </form>
    );
  }
}

/**
 * Component for handling the layout of the Login form
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const LoginFormLayout = (props) => {
  return (
    <div className="panel-body border-top-0 border-bottom-0 p-3">
      <Input
        containerClass="form-group"
        id="uname"
        label="Username"
        type="text"
        required={true}
        value={props.username}
        onChange={props.saveUsername}
        validator="unameFeedback"
        err={props.errs[0]}
      />

      <Input
        containerClass="form-group"
        id="psw"
        label="Password"
        type="password"
        required={true}
        value={props.password}
        onChange={props.savePassword}
        validator="pswFeedback"
        err={props.errs[1]}
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
      <div className="row">
        {props.loaded ? (
          <Input
            containerClass="form-group col"
            id="uname"
            label="Username"
            type="text"
            required={!Boolean(props.readonly)}
            value={props.username}
            readonly={Boolean(props.readonly)}
            onChange={props.saveUsername || null}
            validator={!Boolean(props.readonly) ? "unameFeedback" : null}
            err={props.errs ? props.errs[0] : null}
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" required />
        )}

        {!props.hidePassword ? (
          props.loaded ? (
            <Input
              containerClass="form-group col"
              id="psw"
              label="Password"
              type="password"
              required={true}
              value={props.password}
              onChange={props.savePassword}
              validator="pswFeedback"
              err={props.errs[1]}
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
          <Input
            containerClass="form-group col"
            id="email"
            label="Email"
            type="email"
            value={props.email}
            readonly={Boolean(props.readonly)}
            onChange={props.saveEmail || null}
            validator={!props.readonly ? "emailFeedback" : null}
            err={props.errs ? props.errs[2] : null}
          />
        ) : (
          <SkeletonFormControl containerClass="form-group col" />
        )}

        {props.loaded ? (
          <Input
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
          <Input
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
          <Input
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
          <Input
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
          <Input
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
          <Input
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
 * Component for handling the layout of the forms on the My Books and the (username)'s Books pages
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const UserBooksFormLayout = (props) => {
  return;
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

      <div className="dropdown-menu" aria-labelledby={props.id}>
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
 * Component for displaying input fields
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Input = (props) => {
  return (
    <div className={props.containerClass}>
      <label for={props.id}>
        {props.label}
        {!props.required && !props.readonly ? <small> (Optional)</small> : ""}
      </label>
      <input
        id={props.id}
        name={props.id}
        type={props.type}
        list={props.list || null}
        className={`form-control${
          props.readonly && props.value ? "-plaintext" : ""
        }`}
        required={Boolean(props.required)}
        value={props.value}
        autocomplete={props.list && !props.readonly ? "off" : "on"}
        onChange={props.onChange || null}
        aria-describedby={props.validator || null}
        readOnly={Boolean(props.readonly)}
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
