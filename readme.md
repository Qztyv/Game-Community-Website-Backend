# Game Community Website

This backend application was built using modern technologies: node.js, express, mongodb, mongoose. Authentication and authorization is in place and security has been tackled during creation - such as XSS attacks, NoSQL injection, DoS attacks, and parameter pollution.

Front-end URL: https://game-community-website-frontend.netlify.app/

Back-end URL: https://game-community-website-backend.herokuapp.com/

NOTE: Heroku backend turns off after 30 minutes. So when making a request to the backend via the frontend (or by postman), it may say no response from the server
as the server is turning on. Try making a request again and it should start working.

# Trello Kanban board (For both backend / front-end repositories)

https://trello.com/b/H8WifmRt/gaming-community-website-kanban

# Setup (Both Back-end and Front-end)

## LOCAL SETUP:

### BACK-END:

    NOTE: Backend repository on GitHub does not contain config.env (excluded in .gitignore for security reasons as it contains secret keys).
    FOR LOCAL SETUP TO WORK AFTER CLONING / FORKING THE BACKEND FROM GITHUB, YOU MUST PLACE THE CONFIG.ENV FILE
    INTO THE BASE LOCATION (SAME ROOT AS WHERE SERVER.JS AND PACKAGE.JSON IS LOCATED).
    Without this, the localhost does not know what the process.env._VariableName_ means as the file does
    not exist and so is not loaded from "dotenv.config({ path './config.env' })" - located in server.js.
    These config environment variables were also set in Heroku using: heroku config:set _variablename_:_variablevalue_.
    When adding environment variables to the local file "config.env", you must ensure that this variable is also
    added to Heroku using the above mentioned command or by accessing the Heroku project dashboard, otherwise it will not
    exist when deployed and so will error out.

    	Commands for local development on backend:
    		"npm install" - install required packages
    		"npm start" - PRODUCTION PURPOSES - not used for local development. Heroku utilizes this command to run the server.js with node - faster.
    		"npm run start:dev" - starts the server.js with nodemon, NODE_ENV is automatically set to "development". This results in
    				  more detailed errors if something goes wrong during development, and nodemon prints requests to the terminal.
    				  Also, emails sent from the backend will be sent to mailtrap for development purposes - preventing development
    				  spam emails to real emails.
    		"npm run start:prod" - starts the server.js with nodemon - setting NODE_ENV to "production". This results in less detailed errors
    				   for users (security purposes). nodemon is still used to log requests, as this command is used for development
    				   to see from the perspective of what happens when NODE_ENV is production.
    				   Also, emails sent from the backend are sent to the REAL EMAIL ADDRESS LISTED, using MAILGRID, with a GMAIL account.
    				   These emails include welcome emails and forgot password emails.
    		"npm run debug" - starts the server with ndb (a development tool for debugging, made by Google), with NODE_ENV set to "development".
    		"npm run debug:prod" - starts the server with ndb, with NODE_ENV set to "production". This is useful for accessing the production pathways
    				       that exist in the codebase. These areas include error handling in "errorController.js", and
    				       email sending in "email.js"
    	CORS Important Notes:
    		Request URLs from the browser are whitelisted in app.js, using the cors library. If a front-end / browser request is not:
    			       'https://localhost:8080',
      				       'https://127.0.0.1:8080',
      				       'https://game-community-website-frontend.netlify.app'
    		then CORS errors will result.
    			WHITELISTING URLS IS REQUIRED FOR THIS PROJECT as the FRONTEND utilizes COOKIES. Cookies can only be sent from a
    			back-end to a front-end (front-end being from a different domain, and so is cross-site), with the cookie being created with
    			the properties: secure=true; sameSite:None.
    				When these two properties are used, browser requests MUST (required otherwise errors) have their URL whitelisted
    				in the backend, otherwise they will be rejected.
    				This also means that the front-end will can only receive the cookie if the protocol is secure (https, not http).

    Summary of typical steps I take when setting up backend for local development (after fresh clone / fork):
    	1. ensure you have the config.env with the correct variables, and it is placed in the root folder of the project.
    	2. run "npm install".
    	3. run "npm run start:prod" - you can run "npm run start:dev" too if you want more detailed errors and dont want emails to be sent
    	   to a real email address but instead to mailtrap.
    	4. DONE. Front-end needs axios BaseURL changed to the backend localhost URL. This is: "http://127.0.0.1:3000/api/v1/"

    	Summary of steps when deploying:
    		1. Push changes to remote development branch
    		2. Open pull request to merge from development to master branch
    		3. When pull request is accepted and merged to master, Heroku will detect with GitHub Actions and build the website for deployment.
    		   This is Continuous Deployment.
    		4. (If deploying front-end at the same time too, ensure the axios BaseURL targets the deployed website url, not localhost).

### FRONT-END:

    	Commands for local development on front-end:
    		"npm install" - install the required packages
    		"npm run serve" - runs the application as http.
    		"npm run serve:secure" - runs the application as https. REQUIRED MOSTLY ALL THE TIME TO RECEIVE COOKIES FROM BACKEND.
    			This is because backend only sends cookies to a front-end whos protocol is secure (security reasons).
    		"npm run test:unit" - runs unit tests
    		"npm run test:e2e" - runs end to end tests.

    Summary of typical steps to take when setting up front-end for local development (after fresh clone / fork):
    	1. run "npm install"
    	2. Ensure you select the right baseURL in axios.
    		you can use the localhost backend URL: "http://127.0.0.1:3000/api/v1/" (after setting up),
    		or you could use the deployed backend URL: "https://game-community-website-backend.herokuapp.com/api/v1/".
    			If you will be editing the backend too, or want to see more detailed errors, or do not want real emails sending out every time,
    			use localhost.
    	3. run "npm run serve:secure".
    	4. Done. NOTE: When making changes to the code, the website does not automatically reflect that due to the setting "-https".
    		       So you must refresh the browser on each code change.

    	Summary of steps when deploying:
    		1. Ensure the axios BaseURL targets the deployed website url, not localhost.
    		2. Push changes to remote development branch
    		3. Open pull request to merge from development to master branch
    		4. When pull request is accepted and merged to master, Netlify will detect with GitHub Actions and build the website for deployment.
    		   This is Continuous Deployment.
