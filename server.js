const path = require('path');
const express = require('express');
const session	= require('client-sessions');
const nunjucks = require('nunjucks');
require('dotenv').config();

const morgan = require('morgan');
const favicon = require('serve-favicon');

const app = express();

const port = process.env.PORT || 3100;
const dev = process.env.NODE_ENV !== 'production';

app.use(express.urlencoded({extended: true}));

app.use(session({
  cookieName: 'session',
  secret: process.env.COOKIE_SECRET,
  duration: 180 * 60 * 1000, // 180 min
  activeDuration: 180 * 60 * 1000, // 180 min
  maxAge: 8*60*60*1000, // 8 hour
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

// Views & Nunjucks
app.set('view engine', 'html');
nunjucks.configure(__dirname + '/app/views', {
    autoescape: true,
	trimBlocks: true, 
	lstripBlocks: true, 
	watch: true,
    express: app
});

app.use(morgan('dev'));

if (dev) {
  var webpack = require('webpack');
  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackConfig = require('./webpack.config');

  var compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath
  }));
  console.log('Webpack compilation enabled');
  
  var chokidar = require('chokidar');
  chokidar.watch('./app', {ignoreInitial: true}).on('all', (event, path) => {
    console.log("Clearing /app/ module cache from server");
    Object.keys(require.cache).forEach(function(id) {
      if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id];
    });
  });
}

// Middleware to serve static assets
[
  '/public',
  '/app/assets',
  '/node_modules/govuk_template_mustache/assets',
  '/node_modules/govuk_frontend_toolkit'
].forEach((folder) => {
  app.use('/public', express.static(path.join(__dirname, folder)));
});

// send assetPath to all views
app.use(function (req, res, next) {
  res.locals.asset_path = "/public/";
  next();
});

app.use("/", function(req, res, next) {
  require('./app/routes.js')(req, res, next);
});

// start the app
app.listen(port, () => {
  console.log('Listening on port ' + port);
});

