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
} = ReactRouterDOM;
const Router = BrowserRouter;

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
      userId: "",
      username: "",
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
    this.getRequestedBooks = this.getRequestedBooks.bind(this);

    // Event Listeners
    window.addEventListener("load", this.getData);
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
   * Gets the books that were requested for trading from the server
   */
  getRequestedBooks() {
    let books = [];

    fetch(`${location.origin}/api/session/books`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return [];
        data.forEach((id) => {
          books.push(this.state.books.find((book) => book._id == id));
        });
      })
      .catch((e) => {
        alert(e);
        console.error(e);
      });

    return books;
  }

  /**
   * Determines if the user should be logged in or logged out
   */
  isLoggedIn() {
    fetch(`${location.origin}/api/session/user`)
      .then((res) => res.json())
      .then((data) => this.setState({ login: Boolean(data) }))
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  /**
   * Saves the username while the user is typing
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveUsername(e) {
    this.setState({ username: e.target.innerHTML });
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
                        dropLinkText={this.state.username}
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
                <Books books={this.state.books} users={this.state.users} />
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
    <form action="/requests/new/books" method="POST" className="panel">
      <div className="text-center panel-header">
        <h2>Books</h2>
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
          <Profile />
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
  return (
    <div className="panel">
      <div className="panel-header text-center">
        <h1>Create Request</h1>
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
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Login = (props) => {
  return <h1>Login</h1>;
};

/**
 * Component for displaying content on the Profile page
 * @param {*} props     Represents the props that were passed
 * @returns             Returns the content that should be displayed
 */
const Profile = (props) => {
  return <h1>Profile</h1>;
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

ReactDOM.render(<BookExchange />, document.querySelector("#root"));
