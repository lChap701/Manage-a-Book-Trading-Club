const {
  BrowserRouter,
  Route,
  NavLink,
  Link,
  Prompt,
  Switch,
  Redirect,
  useParams,
  useRouteMatch,
  useLocation,
  withRouter,
} = ReactRouterDOM;
const Router = BrowserRouter;

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
 * Submits the form
 * @param {*} data    Represents the data that should be submitted
 */
async function postData(data) {
  try {
    const res = await fetch(location.pathname, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Ensures that an error message is displayed
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  } catch (err) {
    alert(err.message);
    console.error(err.message);
  }
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
      users: [],
      user: {
        username: "",
      },
      urlUser: {},
      books: [],
      takeBooks: [],
      requests: [],
      trades: [],
    };

    // Functions
    this.getData = this.getData.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getBooks = this.getBooks.bind(this);
    this.getRequests = this.getRequests.bind(this);
    this.getTrades = this.getTrades.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.getUser = this.getUser.bind(this);
    this.getRequestedBooks = this.getRequestedBooks.bind(this);

    // Event Listeners
    window.addEventListener("load", this.getData, true);
    window.addEventListener("load", this.isLoggedIn, true);
  }

  /**
   * Gets all users, books, and requests that have been made
   */
  getData() {
    this.getUsers();
    this.getBooks();
    this.getRequests();
    this.getTrades();
    /* console.log(this.state.users); */
    /* console.log(this.state.books); */
    /* console.log(this.state.requests); */
    /* console.log(this.state.trades); */
  }

  /**
   * Gets all users
   */
  getUsers() {
    fetch(`${location.origin}/api/users`)
      .then((res) => res.json())
      .then((data) => this.setState({ users: data }))
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  /**
   * Gets all books
   */
  getBooks() {
    fetch(`${location.origin}/api/books`)
      .then((res) => res.json())
      .then((data) => this.setState({ books: data }))
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  /**
   * Gets all requests that have been made
   */
  getRequests() {
    fetch(`${location.origin}/api/requests`)
      .then((res) => res.json())
      .then((data) => this.setState({ requests: data }))
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  /**
   * Gets all trades
   */
  getTrades() {
    fetch(`${location.origin}/api/requests?trades=true`)
      .then((res) => res.json())
      .then((data) => this.setState({ trades: data }))
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  /**
   * Determines if the user should be logged in or logged out
   */
  isLoggedIn() {
    fetch(`${location.origin}/api/session/user`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({ login: Boolean(data) });

        // Determines if session should be passed to client
        if (data) this.setState((state) => ({ user: { ...state.user, data } }));
        console.log(this.state.user);
      })
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  /**
   * Gets information for the user's profile
   * @param {String} id   Represents the user's ID
   */
  getUser(id) {
    fetch(`${location.origin}/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          urlUser: data,
        });
      })
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  /**
   * Gets the books that were requested for trading from the server
   */
  getRequestedBooks() {
    let books = [];

    fetch(`${location.origin}/api/session/books`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return [];
        data.forEach((id) => {
          let el = this.state.books.find((book) => book._id == id);
          if (el) books.push(el);
        });
      })
      .catch((e) => {
        alert(e);
        console.error(e);
      });

    return books;
  }

  render() {
    return (
      <div>
        {/* 'forceRefresh' is set to true in order to allow the browser to reload */}
        <Router forceRefresh>
          <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-info">
              <div className="container">
                <a className="navbar-brand" href="/books">
                  Book Exchange
                </a>

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
                    <NavLink className="nav-item nav-link" to="/books">
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
                            text: "All Requests",
                          },
                          {
                            path: "/requests/new",
                            text: "Create Request",
                          },
                        ]}
                        requests={this.state.requests}
                        takeBooks={this.getRequestedBooks()}
                      />
                    )}
                    <NavLink className="nav-item nav-link" to="/trades">
                      Trades
                    </NavLink>
                    <NavLink className="nav-item nav-link" to="/users">
                      Users
                    </NavLink>
                  </div>

                  <div className="navbar-nav ml-auto">
                    {!this.state.login ? (
                      <NavLink className="nav-item nav-link" to="/login">
                        Login
                      </NavLink>
                    ) : (
                      <Dropdown
                        id="userDropdownMenuLink"
                        dropLinkText={this.state.user.username}
                        links={[
                          {
                            path: "/users/:id",
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
                        requests={this.state.requests}
                        takeBooks={this.getRequestedBooks()}
                      />
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </header>

          <div className="container">
            <Switch>
              <Route path="/books">
                <Books books={this.state.books} login={this.state.login} />
              </Route>
              <Route path="/requests">
                <Requests requests={this.state.requests} />
              </Route>
              <Route path="/trades">
                <Trades />
              </Route>
              <Route path="/users">
                <Users />
              </Route>
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
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
  return (
    <form action="/requests/new/books" method="POST" className="panel scroll">
      <div className="panel-header text-white p-1 mx-auto">
        <h2 className="text-center">Books</h2>
      </div>

      <div className="panel-body">
        {props.books.length == 0 ? (
          <div className="item border border-secondary border-top-0 border-bottom-0 p-5">
            <h4 className="text-muted text-center mt-1">
              No books are available at this time
            </h4>
          </div>
        ) : (
          props.books.map((book) => {
            return (
              <div className="item border border-secondary border-top-0 border-bottom-0">
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
        {!props.login ? (
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
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Requests = (props) => {
  return <h1>All Requests</h1>;
};

/**
 * Component for displaying content on the Request for (book) page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const BookRequests = (props) => {
  return <h1>Requests for {props.book}</h1>;
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
            <NavLink className="dropdown-item nav-item nav-link" to={link.path}>
              {link.text}
            </NavLink>
          );
        })}
      </div>

      <Switch>
        <Route path="/requests">
          <Requests requests={props.requests} />
        </Route>
        <Route path="/requests/books/new">
          <Redirect to="/requests/new" />
        </Route>
        <Route path="/requests/new">
          <CreateRequest takeBooks={props.takeBooks} />
        </Route>
        <Route path="/users/:id">
          <Profile
            getUser={this.getUser}
            user={this.state.urlUser}
            myId={this.state.user._id}
          />
        </Route>
        <Route path="/users/edit">
          <EditProfile />
        </Route>
        <Route path="/books/my">
          <MyBooks />
        </Route>
        <Route path="/logout">
          <Redirect to="/books" />
        </Route>
      </Switch>
    </div>
  );
};

/**
 * Component for displaying content on the Create Request page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const CreateRequest = (props) => {
  console.log(props.takeBooks);
  return (
    <div className="panel">
      <div className="panel-header text-center">
        <h2>Create Request</h2>
      </div>

      <div className="panel-body">
        {props.takeBooks.map((book) => {
          <div className="item" id={book._id}>
            {book.name}
          </div>;
        })}
      </div>
    </div>
  );
};

/**
 * Component for displaying content on the Trades page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Trades = (props) => {
  return <h1>Trades</h1>;
};

/**
 * Component for displaying content on the Users page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Users = (props) => {
  return <h1>Users</h1>;
};

/**
 * Component for displaying content on the Login page
 * @returns     Returns the content that should be displayed
 */
const Login = () => {
  return <AccountForm name="Login" />;
};

/**
 * Component for displaying and handling forms on the Login, Sign Up, Profile, and Edit Profile pages
 */
class AccountForm extends React.Component {
  constructor(props) {
    super(props);

    // States
    this.state = {
      username: "",
      password: "",
      email: "",
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipPostal: "",
      errs: ["Username is required", "Password is required"],
    };

    // Functions
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
  }

  /**
   * Saves the city that the user lives at enters while they type
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveCity(e) {
    this.setState({ city: e.target.value });
  }

  /**
   * Saves the state that the user lives at enters while they type
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveState(e) {
    this.setState({ state: e.target.value });
  }

  /**
   * Saves the country that the user lives at enters while they type
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveCountry(e) {
    this.setState({ country: e.target.value });
  }

  /**
   * Saves the zip/postal code of the user's location while they type
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveZipPostalCode(e) {
    this.setState({ zipPostal: e.target.value });
  }

  /**
   * Handles form validation and form submission
   * @param {SubmitEvent} e   Represents the event that occurred
   */
  async submitForm(e) {
    e.preventDefault();

    // Checks if form should be submitted
    if (validateForm()) {
      const data = {
        username: this.state.username,
        password: this.state.password,
      };

      // For when users try to sign up or update their account
      if (this.props.name != "Login") {
        data.email = this.state.email;
        data.name = this.state.name;
        data.address = this.state.address;
        data.city = this.state.city;
        data.state = this.state.state;
        data.country = this.state.country;
        data.zipPostal = this.state.zipPostal;
      }

      await postData(data);
    }
  }

  render() {
    return (
      <form
        onSubmit={this.submitForm}
        className="panel"
        name={this.props.name}
        novalidate="true"
      >
        <div className="panel-header text-white p-1 mx-auto">
          <h2 className="text-center">{this.props.name}</h2>
        </div>

        {this.props.name == "Login" ? (
          <LoginFormLayout
            username={this.state.username}
            saveUsername={this.saveUsername}
            password={this.state.password}
            savePassword={this.savePassword}
            errs={this.state.errs}
          />
        ) : this.props.name == "Profile" ? (
          <AccountFormLayout
            readonly={true}
            username={this.state.username}
            password={this.state.password}
            email={this.state.email}
            name={this.state.name}
            address={this.state.address}
            city={this.city}
            state={this.state.state}
            country={this.state.country}
            zipPostal={this.state.zipPostal}
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
            saveAddress={this.address}
            city={this.state.city}
            saveCity={this.saveCity}
            state={this.state.state}
            saveState={this.saveState}
            country={this.state.country}
            saveCountry={this.saveCountry}
            zipPostal={this.state.zipPostal}
            saveZipPostalCode={this.saveZipPostalCode}
          />
        )}

        <div className="panel-footer px-3 py-2">
          <input
            className="btn btn-success w-100"
            type="submit"
            value={
              this.props.name == "Edit Profile"
                ? "Update Profile"
                : this.props.name
            }
          />
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
    <div className="panel-body border border-secondary border-top-0 border-bottom-0 p-3">
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
 * Component for displaying input fields
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Input = (props) => {
  return (
    <div className={props.containerClass}>
      <label for={props.id}>
        {props.label}
        {!props.required ? <small> (Optional)</small> : ""}
      </label>
      <input
        id={props.id}
        name={props.id}
        type={props.type}
        list={props.list || null}
        className="form-control"
        required={props.required || false}
        value={props.value}
        autocomplete={props.list ? "off" : "on"}
        onChange={props.onChange || null}
        aria-describedby={props.validator || null}
        readonly={!Boolean(props.readonly)}
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
 * Component for handling the layout of the forms on the Sign Up, Profile, and Edit Profile pages
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const AccountFormLayout = (props) => {
  return (
    <div className="panel-body border border-secondary border-top-0 border-bottom-0 p-3">
      <div className="row">
        <Input
          containerClass="form-group col"
          id="uname"
          label="Username"
          type="text"
          required={!Boolean(props.readonly)}
          value={props.username}
          readonly={!Boolean(props.readonly)}
          onChange={props.saveUsername || null}
          validator="unameFeedback"
          err={props.errs[0]}
        />

        <Input
          containerClass="form-group col"
          id="psw"
          label="Password"
          type="password"
          required={!Boolean(props.readonly)}
          readonly={!Boolean(props.readonly)}
          value={props.password}
          onChange={props.savePassword || null}
          validator="pswFeedback"
          err={props.errs[1] || null}
        />
      </div>

      <div className="row">
        <Input
          containerClass="form-group col"
          id="email"
          label="Email"
          type="email"
          value={props.email}
          readonly={!Boolean(props.readonly)}
          onChange={props.saveEmail || null}
          validator=""
          err=""
        />

        <Input
          containerClass="form-group col"
          id="name"
          label="Full Name"
          type="text"
          value={props.name}
          readonly={!Boolean(props.readonly)}
          onChange={props.saveName || null}
          validator=""
          err=""
        />
      </div>

      <div className="row">
        <Input
          containerClass="form-group col-7"
          id="addr"
          label="Address"
          list={!props.readonly ? "addresses" : null}
          type="text"
          value={props.address}
          readonly={!Boolean(props.readonly)}
          onChange={props.saveAddress || null}
          validator=""
          err=""
        />
        {!props.readonly ? <Datalist id="addresses" options={["test"]} /> : ""}

        <Input
          containerClass="form-group col"
          id="city"
          label="City"
          list={!props.readonly ? "cities" : null}
          type="text"
          value={props.city}
          readonly={!Boolean(props.readonly)}
          onChange={props.saveCity || null}
          validator=""
          err=""
        />
        {!props.readonly ? <Datalist id="cities" options={["test"]} /> : ""}
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
        ) : (
          <Select
            containerClass="form-group col"
            id="state"
            label="State"
            options={[{ text: "Choose a state", value: "" }]}
            value={props.state}
            onChange={props.saveState}
            validator=""
            err=""
          />
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
        ) : (
          <Select
            containerClass="form-group col"
            id="country"
            label="Country"
            value={props.country}
            options={[{ text: "Choose a country", value: "" }]}
            onChange={props.saveState || null}
            validator=""
            err=""
          />
        )}

        <Input
          containerClass="form-group col-4"
          id="zipPostal"
          label="Zip/Postal"
          list={!props.readonly ? "zipPostalCodes" : null}
          type="text"
          value={props.zipPostal}
          readonly={!Boolean(props.readonly)}
          onChange={props.saveZipPostalCode || null}
          validator=""
          err=""
        />
        {!props.readonly ? (
          <Datalist id="zipPostalCodes" options={["test"]} />
        ) : (
          ""
        )}
      </div>
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
 * Component for displaying select input fields
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Select = (props) => {
  console.log(props);
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
 * Component for displaying content on the Sign Up page
 * @returns     Returns the content that should be displayed
 */
const Signup = () => {
  return <AccountForm name="Sign Up" />;
};

/**
 * Component for displaying content on the (username)'s Profile page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Profile = (props) => {
  const params = useParams();
  window.addEventListener(
    "load",
    () => {
      props.getUser(params.id);
      console.log(props.user);
    },
    true
  );
  return (
    <form className="panel">
      <div className="panel-header text-white p-1 mx-auto">
        <h2 className="text-center">{props.user.username}'s Profile</h2>
      </div>

      <AccountFormLayout
        username={props.user.username}
        password={props.user.password}
        email={props.user.email || ""}
        name={props.user.name || ""}
        address={props.user.address || ""}
        city={props.user.city || ""}
        state={props.user.state || ""}
        country={props.user.country || ""}
        zipPostal={props.user.zipPostal || ""}
      />

      <div className="panel-footer px-3 py-2">
        <Link
          className="btn btn-success w-100"
          to={
            props.myId == params.id ? "/books/my" : `/users/${params.id}/books`
          }
        ></Link>
      </div>
    </form>
  );
};

/**
 * Component for displaying content on the Edit Profile page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const EditProfile = (props) => {
  return <h1>Edit Profile</h1>;
};

/**
 * Component for displaying content on the My Books page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const MyBooks = (props) => {
  return <h1>My Books</h1>;
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
 * Component for displaying content on the (username)'s Books page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const UserBooks = (props) => {
  return <h1>{props.user.username}'s Books</h1>;
};

ReactDOM.render(<BookExchange />, document.querySelector("#root"));
