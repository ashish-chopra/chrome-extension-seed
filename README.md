# chrome-extension-seed
This is a starter project scaffolded for setting up Google Chrome extension development enviromment built with Gulp.

# How to use?

Run the following commands:

1. Clone the repo:
    
        git clone https://github.com/ashish-chopra/chrome-extension-seed.git

2. Move inside root folder `chrome-extension-seed`  and run:
    
        npm install

3. Use following commands to run development lifecyle events:

        npm run clean       // to clean the ouput directory
        npm run build:dev   // build the source code inside 'dist' directory.
        npm run serve       // host the 'dist' on a web server at port 3000 (default)
        npm start           // start the development cycle (build t he code, serve it and watch for changes)

NOTE: In order to live reload the extension in chrome, the project used `chromereload.js` script which makes a
websocket connection with livereload server running and watch for 'reload' command. Make sure to remove this file
from `manifest.json` before releasing a production builds. 

# License

MIT 


