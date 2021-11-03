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
} = window.ReactRouterDOM;
const Router = BrowserRouter;

/**
 * Main Component
 */
class BookExchange extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      login: true,
      users: [],
      userId: "",
      username: "",
      books: [],
      requests: [],
    };

    this.getData = this.getData.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);

    window.addEventListener("load", this.getData);
  }

  /**
   * Gets all users, books, and requests that have been made
   */
  getData() {
    fetch(`${window.location.origin}/api/users`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          this.setState({
            users: data.users,
            books: data.books,
            requests: data.requests,
          });
        }
      })
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  /**
   * Determines if the user should be logged in or logged out
   */
  isLoggedIn() {
    this.setState((state) => ({
      login: !state.login,
    }));
  }

  /**
   * Saves the username while the user is typing
   * @param {InputEvent} e    Represents the event that occurred
   */
  saveUsername(e) {
    this.setState({
      username: e.target.innerHTML,
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
                    {this.state.login ? (
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
                    {this.state.login ? (
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
  return <h1>Books</h1>;
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
        <Route path="/requests/new">
          <CreateRequest />
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
  return <h1>Create Request</h1>;
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
