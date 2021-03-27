# Natours Application

This was built using modern technologies: node.js, express, mongodb, mongoose.

# Trello Kanban board

https://trello.com/b/H8WifmRt/gaming-community-website-kanban

# Setup

npm install - This will install all of the dependencies within package.json

npm start - This will start the server with node, with "node server.js". This is set this way as Heroku is used for the deployment website and it utilizes npm start, so we do not want to run in any development mode (NODE_ENV=production is set in heroku config online)

npm run start:dev - This will run the server with nodemon, so any changes made to the code will automatically restart the server, allowing for easier development

npm run start:prod - This will run the server with nodemon but with "NODE_ENV=production", stopping morgans console output and changing the error output returned on operational errors (errors we expect such as: invalid paths accessed, invalid user inputs (and the errors returned by ODM's like mongoose), failure to connect to servers or databases, and more), and programming errors (errors that developers caused by bugs such as undefined variables for example); this is useful as it allows the developer to see what a normal user would see - real world production applications should not leak any information through stack errors.

npm run debug - This will run Google's debugging application ndb - this runs the server as well as the application that can be used for debugging.

npm run debug:prod - This is the same as "npm run debug", except it also sets the "NODE_ENV" to production so that the developer can more easily test how production will be (mainly for error testing for example, as the developer errors vs production errors are different)
