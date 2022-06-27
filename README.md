# [Manage-a-Book-Trading-Club](https://www.freecodecamp.org/learn/coding-interview-prep/take-home-projects/manage-a-book-trading-club)

A project that was created to earn a certificate from freeCodeCamp and allows users to trade books when they have an account.

## OAuth

[Passport](https://www.passportjs.org/) is used in order to use [OAuth](https://en.wikipedia.org/wiki/OAuth) for the following:

- GitHub
- Facebook
- Twitter
- Google

## Security

For security, this project uses:

- [CryptoJS](https://cryptojs.gitbook.io/docs/) to encrypt and decrypt users' addresses and zip/postal codes with [AES](https://cryptojs.gitbook.io/docs/#ciphers)
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

Here are all URL paths that are used in this website.

### Redirect Paths

- **/** - Redirects to **/books**
- **/logout** - Allows users to logout
  - Redirects to **/books**

### Books Paths

- **/books** - Shows all books
  - Displays the _index.html_ file
- **/books/:bookId/update** - Form handler for the Edit Book form
- **/books/:bookId/delete** - Form handler for the Delete Book form
- **/books/:bookId/requests** - Shows all requests for books
  - Displays the _bookRequests.html_ file
- **/books/my** - Shows the user their books
  - Displays the _myBooks.html_
  - Requires the user to be logged in
    - Redirects to **/books** when logged out

### Requests Paths

- **/requests** - Show all requests
  - Displays the _requests.html_ file
- **/requests/new** - Allows new requests to be created
  - Displays the _createRequests.html_ file
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
- **/requests/new/books** - Form handler for the main form in **/books** and **/books/my**
  - Redirects to **/requests/new**
- **/requests/new/books/select** - Gets books available to be given or taken during trades
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
- **/requests/:requestId/accept/:id** - Accepts requests/trades
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
  - When successful, redirects to **/requests**
- **/requests/:requestId/cancel** - Cancels requests/declines trades
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
  - When successful, redirects to **/requests**

### Trades Path

- **/trades** - Shows all trades that have occurred
  - Displays the _trades.html_ file

### Users Paths

- **/users** - Shows all users
  - Displays the _users.html_ file
- **/users/:id** - Shows a user's profile
  - Displays the _profile.html_ file
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
- **/users/:id/books** - Shows another user's books
  - Displays the _books.html_ file
- **/users/:id/unlink/:authId"** - Allows users to remove linked accounts
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
  - When successful, redirects to **/users/settings**
- **/users/edit** - Allows users to update their accounts
  - Displays the _editProfile.html_ file
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
- **/users/settings** - Allows the user to change their settings
  - Displays the _settings.html_ file
  - Requires the user to be logged in
    - Redirects to **/books** when logged out
- **/users/notifications** - Allows the user to view notifications
  - Displays the _notifications.html_ file
  - Requires the user to be logged in
    - Redirects to **/books** when logged out

### Login, Signup, and Password Paths

- **/login** - Allows users to login
  - Redirects to **/books** when the user is logged in
- **/signup** - Allows users to create accounts
  - Redirects to **/books** when the user is logged in or has signed up
- **/password/reset** - Allows users to reset their password
  - When successful, redirects to **/login** or **/users/settings**
- **/password/update** - Allows users to update their password

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
- **/session/success** - Allows success messages to be sent to the client
- **/session/auth/error** - Allows OAuth error messages to be sent to the client
- **/session/auth/accounts** - Allows the current user's linked accounts to be sent to the client
- **/session/notifications** - Allows notifications to be sent to the client

## Resources

[Favicon Generator](https://favicon.io/favicon-generator/) \
[Social Buttons for Bootstrap](https://lipis.github.io/bootstrap-social/) \
[React Router Setup](https://www.pluralsight.com/guides/using-react-router-with-cdn-links) \
[GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) \
[Facebook OAuth](https://www.twilio.com/blog/facebook-oauth-login-node-js-app-passport-js) \
[Twitter OAuth](https://medium.com/swlh/setting-up-twitter-oauth-with-node-and-passport-js-2298296b237c) \
[Google OAuth](https://dev.to/asim_ansari7/setting-up-social-logins-with-node-js-and-passport-js-1m16) \
[Country State City API](https://countrystatecity.in/docs/) \
[Zippopotamus API](https://docs.zippopotam.us/) \
[LocationIQ's Autocomplete API](https://locationiq.com/docs#autocomplete)
