# [Manage-a-Book-Trading-Club](https://www.freecodecamp.org/learn/coding-interview-prep/take-home-projects/manage-a-book-trading-club)

A project that was created to earn a certificate from freeCodeCamp and allows users to trade books when they have an account.

## OAuth

[Passport](https://www.passportjs.org/) is used in order to use [OAuth](https://en.wikipedia.org/wiki/OAuth) for the following:

- GitHub
- Facebook
- Twitter
- Microsoft
- Google

## Security

For security, this project uses:

- [CryptoJS](https://cryptojs.gitbook.io/docs/) for encrypt and decrypt users' addresses and zip/postal codes with [AES](https://cryptojs.gitbook.io/docs/#ciphers)
  - **NOTE:** All **[KEYS](<https://en.wikipedia.org/wiki/Key_(cryptography)>)** are **STORED** in _**keys.xml**_
- [bcrypt](https://www.npmjs.com/package/bcrypt) to hash and verify passwords
- [Helmet](https://www.npmjs.com/package/helmet) for extra protection

## Privacy

For privacy, this project protects users' privacy by:

- Giving users control over the profile data that is shared
  - **NOTE:** All **PROFILE DATA** is **PUBLIC** by **DEFAULT**
- Not requiring users to share accounts via OAuth
- Only requiring accounts to have a username and password

## Location APIs

Three location APIs are used to display menu options:

1. **[LocationIQ's Autocomplete API](https://locationiq.com/sandbox/geocoding/autocomplete)**
2. **[Country State City API](https://countrystatecity.in/)**
3. **[Zippopotamus](https://zippopotam.us/)**

## URL Paths

All URL paths part of this project.

### Redirect Paths

- **/** - Redirects to **/books**
- **/logout** - Allows users to logout
  - Redirects to **/books**

### Books Path

- **/books** - Shows all books
  - Displays the _index.html_ file
- **/books/:bookId/requests** - Shows all requests for books
  - Displays the _books.html_ file
- **/books/my** - Shows the user their books
  - Displays the same file as **/books/:bookId/requests**
  - Requires the user to be logged in
    - Redirects to **/books** when logged out

### Requests Path

- **/requests** - Show all requests
  - Displays the _requests.html_ file
- **/requests/new** - Allows new requests to be created
  - Displays the _createRequests.html_ file
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
- **/requests/new/books** - Form handler for the form in **/books**
  - Redirects to **/requests/new**

### Trades Path

- **/trades** - Shows all trades that have occurred
  - Displays the _trades.html_ file

### Users Path

- **/users** - Shows all users
  - Displays the _users.html_ file
- **/users/:id** - Shows a user's profile
  - Displays the _profile.html_ file
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
- **/users/:id/books** - Shows another user's books
  - Displays the _books.html_ file
- **/users/edit** - Allows users to update their accounts
  - Displays the _editProfile.html_ file
  - Requires the user to be logged in
    - Redirects to **/books** when logged out

### Login and Signup Paths

- **/login** - Allows users to login
- **/signup** - Allows users to create accounts

### OAuth Paths

- **/auth/github** - Where GitHub OAuth to take place
- **/auth/github/callback** - Callback URL path during OAuth
  - Redirects to **/books** when successful
  - Redirects to **/login** or **/signup** when unsuccessful
- **/auth/facebook** - Where Facebook OAuth to take place
- **/auth/facebook/callback** - Callback URL path during OAuth
  - Redirects to **/books** when successful
  - Redirects to **/login** or **/signup** when unsuccessful
- **/auth/twitter** - Where Twitter OAuth to take place
- **/auth/twitter/callback** - Callback URL path during OAuth
  - Redirects to **/books** when successful
  - Redirects to **/login** or **/signup** when unsuccessful
- **/auth/microsoft** - Where Microsoft OAuth to take place
- **/auth/microsoft/callback** - Callback URL path during OAuth
  - Redirects to **/books** when successful
  - Redirects to **/login** or **/signup** when unsuccessful
- **/auth/google** - Where Google OAuth to take place
- **/auth/google/callback** - Callback URL path during OAuth
  - Redirects to **/books** when successful
  - Redirects to **/login** or **/signup** when unsuccessful

### API Paths

- **/api/users** - Allows all users to be sent to the client
- **/api/users/:id** - Allows a specific user to be sent to the client
- **/api/users/:id/books** - Allows the user's books to be sent to the client
- **/api/books** - Allows all books to be sent to the client
- **/api/books/:bookId/requests** - Allows all requests for a book to be sent to the client
- **/api/requests** - Allows all requests or trades to be sent to the client
- **/api/countries** - Allows all countries to be sent to the client
- **/api/countries/:cntry** - Allows a country to be sent to the client
- **/api/countries/:cntry/addresses/:text** - Allows all addresses in a country to be sent to the client
- **/api/countries/:cntry/states** - Allows all states in a country to be sent to the client
- **/api/countries/:cntry/cities** - Allows all cities in a country to be sent to the client
- **/api/countries/:cntry/states/:st/cities** - Allows all cities in a state to be sent to the client
- **/api/countries/:cntry/zipPostalCodes/:zipPostal/states** - Allows all states to be sent to the client based on country and zip/postal code
- **/api/countries/:cntry/zipPostalCodes/:zipPostal/cities** - Allows all cities to be sent to the client based on country and zip/postal code
- **/api/countries/:cntry/states/:st/cities/:city/zipPostalCodes** - Allows all zip/postal codes to be sent to the client based on country, state, and city
- **/api/states** - Allows states from around the world to be sent to the client
- **/api/addresses/:text** - Allows addresses from around the world to be sent to the client

### Session Paths

- **/session/user** - Allows the current user's data to be sent to the client
- **/session/books** - Allows the book IDs part of requests to be sent to the client

## Resources

[Favicon Generator](https://favicon.io/favicon-generator/) \
[React Router Setup](https://www.pluralsight.com/guides/using-react-router-with-cdn-links) \
[GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) \
[Facebook OAuth](https://www.twilio.com/blog/facebook-oauth-login-node-js-app-passport-js) \
[Twitter OAuth](https://medium.com/swlh/setting-up-twitter-oauth-with-node-and-passport-js-2298296b237c) \
[Microsoft/Google OAuth](https://dev.to/asim_ansari7/setting-up-social-logins-with-node-js-and-passport-js-1m16) \
[Country State City API](https://countrystatecity.in/docs/) \
[Zippopotamus API](https://docs.zippopotam.us/) \
[LocationIQ's Autocomplete API](https://locationiq.com/docs#autocomplete)
