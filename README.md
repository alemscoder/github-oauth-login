# Github OAuth Login

This project is a web application that use the GitHub API to perform various actions such as user authentication, displaying user information, repository creation, and uploading files to existing repositories.

## Install

1. Clone this repository to your local machine.
2. Make sure you have Node.js installed on your system.
3. Open a terminal in the project directory and run the following command to install dependencies and run the project:

### Frontend
   ```bash
   cd github-oauth-login-frontend
   npm install
   npm run dev
   ```

### Backend
   ```bash
   cd github-oauth-login-backend
   npm install
   npm run start
   ```

## Setting Up the Project

1. Read the GitHub documentation for OAuth Apps [here](https://docs.github.com/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
2. Create a new OAuth App [here](https://github.com/settings/applications/new)
3. Obtain the `Client ID` and `Client Secret` generated for your OAuth App.

### Frontend
- Create a `.env.production` file in the root directory.
- Add the following variables to the .env file:
   - `CLIENT_ID`=your_client_id_here
   - `BACKEND_URL`=your_backend_url_here
   - `REDIRECT_URI`=your_redirect_uri_here

### Backend
- Create a `.env` file in the root directory.
- Add the following variables to the .env file:
   - `CLIENT_ID`=your_client_id_here
   - `CLIENT_SECRET`=your_client_secret_here
   - `REDIRECT_URI`=your_redirect_uri_here
   - `PORT`=your_port_backend_here

## Use

### User Authentication

The application allows users to authenticate using their GitHub account. To do this, users must follow the authentication process in the application, which includes exchanging authorization codes with the GitHub API.

### Get User Data

Show the data of the authenticated user in the application after they have successfully logged in using their GitHub account.

### Repository Creation

Once authenticated, the user can create new repositories in their GitHub account. The application provides a form where the repository name, URL (optional), description (optional), and privacy (public or private) can be entered.

### File Upload to Repositories

Additionally, the application allows the user to upload files to existing repositories in their GitHub account. The user can specify the repository name, the directory to which the files should be uploaded, the commit title, and the files to be uploaded.

## Project Purpose

This project was created with the goal of learning and improving skills in various areas, including:
- Working with Lit for creating dynamic web components.
- Developing using vanilla JavaScript to handle client-side functionality.
- Implementing best practices in coding and project organization.
- Gaining proficiency in web development techniques.

## Used Technology

- JavaScript Vanilla: Vanilla JavaScript refers to the use of plain JavaScript without any additional libraries or frameworks. In this project, vanilla JavaScript is used for handling logic and interactions.
- HTML5: HyperText Markup Language (HTML) is the standard markup language for creating web pages and web applications. It is used to structure the content of the application.
- CSS3: Cascading Style Sheets (CSS) is used for styling the HTML elements and components, enhancing the visual presentation and layout of the application.
- [Lit:](https://lit.dev) Lit is a lightweight library for building web components with modern JavaScript syntax. It provides efficient and reactive rendering, making it ideal for creating fast and dynamic user interfaces.
- [Shoelace:](https://shoelace.style) Shoelace is a collection of web components built with modern CSS Custom Properties and the latest web standards. It provides customizable UI components that are easy to use and style.
- [Vite.js:](https://vitejs.dev/) & [Node.js:](https://nodejs.org/) Vite.js is a rapid build tool utilized for swift web development, offering a blazing-fast development server with hot module replacement (HMR) and an optimized production build. Meanwhile, Node.js serves as a JavaScript runtime environment facilitating server-side logic and API request handling, leveraging its extensive library ecosystem for scalable backend development.
- [npm:](https://www.npmjs.com/) NPM (Node Package Manager) is a widely-used package manager for Node.js, enabling developers to easily install, manage, and share reusable code packages. It provides access to a vast repository of open-source packages, simplifying dependency management and accelerating the development process.
- [ChatGPT 3.5](https://chat.openai.com) Used for doubts, consultations, and solving occasional errors :wink:

## Contribución

Contributions are welcome. If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push your branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).

## Disclaimer
The trademarks, logos, and any other third-party materials used in this project belong to their respective owners. This project is not endorsed by or affiliated with GitHub or any other third-party service providers mentioned herein.