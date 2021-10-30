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
      userId: "",
      username: "",
    };
  }

  checkLoggedIn() {}

  getUserId(username) {
    fetch(`${window.location.origin}/users?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          userId: data._id,
          username: data.username,
        });
      })
      .catch((e) => {
        alert(e);
        console.error(e);
      });
  }

  render() {
    return (
      <div id="container">
        <Router>
          <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-info">
              <div class="container">
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
                        profile={"/users/" + this.state.userId}
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
                            path: "/users/" + this.state.userId,
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
                        profile={"/users/" + this.state.userId}
                      />
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </header>

          <Switch>
            <Route path="/books">
              <Books />
            </Route>
            <Route path="/requests">
              <Requests />
            </Route>
            <Route path="/trades">
              <Trades />
            </Route>
            <Route path="/users">
              <Users />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
          </Switch>
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
          <Requests />
        </Route>
        <Route path="/requests/new">
          <CreateRequest />
        </Route>
        <Route path={props.profile}>
          <Profile />
        </Route>
        <Route path="/users/edit">
          <EditProfile />
        </Route>
        <Route path="/books/my">
          <MyBooks />
        </Route>
        <Route path="/logout">
          <Logout />
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

const Trades = (props) => {
  return <h1>Trades</h1>;
};

const Users = (props) => {
  return <h1>Users</h1>;
};

const Login = (props) => {
  return <h1>Login</h1>;
};

const Profile = (props) => {
  return <h1>Profile</h1>;
};

const EditProfile = (props) => {
  return <h1>Edit Profile</h1>;
};

const MyBooks = (props) => {
  return <h1>My Books</h1>;
};

const Logout = (props) => {
  return <h1>Logout</h1>;
};

ReactDOM.render(<BookExchange />, document.querySelector("#root"));
