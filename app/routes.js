const express 			= require('express');
const { check } 		= require('express-validator');
const _ 				= require('lodash');
const multer			= require('multer');
const jwt 				= require('jsonwebtoken');

// Custom modules
const config 			= require('./config');
const queries 			= require('./queries');

const add_project 		= require('./render_add_project');
const update_portfolio 	= require('./update_portfolio');
const delete_portfolio	= require('./delete_portfolio');
const update_odd 		= require('./update_odd');
const handle_form 		= require('./handle_add_update');
const handle_delete		= require('./handle_delete');
const bulk				= require('./bulk');
const login 			= require('./login');
const filter_view 		= require('./filter_view');
const project_view 		= require('./project_view');
const odd_view			= require('./oddleads_view');

const router 			= express.Router();

// Add timestamps to logs
require('log-timestamp');
console.log("User entry (timestamp 1hr behind)");

// Prep data for summary views
function nestedGroupBy(data, keys) {
  var grouped = {};
  data.forEach((item) => {
    _.update(grouped,
      keys.map((k) => item[k]).join('.'),
      (val) => val ? (val.push(item), val) : [item]
    );
  });
  
 return grouped;
}

// Redirect not logged in users to the login page
function requireLogin (req, res, next) {console.log("Login"); console.log(req.session.user); console.log(req.session.group); if (req.session.login == undefined) {console.log("login undefined - redirecting"); req.session.destroy(); 
res.redirect('/login');} else {next();}};


//-------------------------------------------------------------------
// LOGIN PAGE
//-------------------------------------------------------------------

router.get ('/login', function (req, res) {res.render("login");});
router.post('/login', [check('user').escape()], function (req, res) { login(req, res); });

router.get('/log-out', (req, res) => {
	
	// Destroy session and log out
	req.session.destroy();
	res.writeHead(302, {'Location': '/login'});
	res.end();
});


//-------------------------------------------------------------------
// SUMMARY PAGES
//-------------------------------------------------------------------

router.get('/', requireLogin, async (req, res) => {
	queries.current_projects()
	.then((result) => {
		res.render('index', {
			"data": nestedGroupBy(result.rows, ['category', 'phase']),
			"counts": _.countBy(result.rows, 'phase'),
			"themes": config.categories,
			"phases": config.phases,
			"sess": req.session
		});
	})
	.catch();
});


router.get('/priority/', requireLogin, function (req, res) {	
	queries.current_projects()
	.then((result) => {
		res.render('index', {
			"data": nestedGroupBy(result.rows, ['pgroup', 'phase']),
			"counts": _.countBy(result.rows, 'phase'),
			"themes": config.priorities,
			"phases":config.phases,
			"sess": req.session
		});
	});	
});


router.get('/rag/', requireLogin, function (req, res) {
	queries.current_projects()
	.then((result) => {
		  res.render('index', {
			"data": 	nestedGroupBy(result.rows, ['rag', 'phase']),
			"counts": 	_.countBy(result.rows, 'phase'),
			"themes": 	config.rags,
			"phases":	config.phases,
			"sess": req.session
		});
	});	
});

router.get('/oddlead/', requireLogin, function (req, res) {odd_view(req, res);});

router.get('/status/', requireLogin, function (req, res) {
	queries.current_projects()
	.then((result) => {
		res.render('phaseview', {
			"data": 	nestedGroupBy(result.rows, ['phase']),
			"counts": 	_.countBy(result.rows, 'phase'),
			"phases":	config.phases,
			"sess": req.session
		});
	})
	.catch();	
});

router.get('/archived', requireLogin, function (req, res) {
	queries.completed_projects()
	.then((result) => {
		res.render('completed', {
			"user": req.session.user,
			"data": result.rows,
			"counts": _.countBy(result.rows, 'phase')
		});
	})
	.catch();	
});

router.get('/completed', requireLogin, function (req, res){res.redirect('/archived');});

router.get('/portfolio-team', requireLogin, (req, res) => {
	if(req.session.user == 'portfolio') {res.render('team-page');}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});
		
	
//-------------------------------------------------------------------
// FILTER VIEW
//-------------------------------------------------------------------

router.get ('/filter-view', requireLogin, function (req,res) {res.render('filter_view', {"sess": req.session});});
router.post('/filter-view', requireLogin, function (req,res) {filter_view(req,res)});

//-------------------------------------------------------------------
// PROJECT VIEW
//-------------------------------------------------------------------

router.get('/projects/:project_id', requireLogin, function (req, res) {project_view(req, res);});

//-------------------------------------------------------------------
// RENDER FORMS
//-------------------------------------------------------------------
router.get('/portfolio-add', requireLogin, function (req, res) {
	if(req.session.user == 'portfolio') {add_project(req,res);}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});
		
router.get('/portfolio-update/:project_id', requireLogin, function (req, res) {
	if(req.session.user == 'portfolio'){update_portfolio(req, res);}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});

router.get('/portfolio-delete/:project_id', requireLogin, function (req, res) {
	if(req.session.user == 'portfolio'){delete_portfolio(req, res);}
	else {res.render('error_page', {message: 'You are not authorised to view this page'})};
});

router.get('/odd-update/:project_id', requireLogin, (req, res) => {
	if(req.session.user == 'portfolio' || req.session.user == 'odd'){update_odd(req, res);}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});

//-------------------------------------------------------------------
// BULK UPLOADS
//-------------------------------------------------------------------
const upload 			= multer({ dest: 'tmp/csv/' });

router.get('/upload-test', requireLogin, (req, res) => {
	if(req.session.user == 'portfolio'){res.render('upload', {"title":"Test bulk upload", "post":"upload-test",});}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});

router.get('/upload', requireLogin, (req, res) => {
	if(req.session.user == 'portfolio'){res.render('upload', {"title":"Bulk upload", "post":"upload",});}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});

router.post('/upload-test', upload.single('file'), function (req, res) { bulk(req, res, 'test_projects'); });
router.post('/upload', 		upload.single('file'), function (req, res) { bulk(req, res, 'projects'); });


//-------------------------------------------------------------------
// ADD/UPDATE PROJECTS - handle form submissions
//-------------------------------------------------------------------
router.post('/process-project-form', requireLogin, [
	// Sanitize values
	check('project_id').escape(), 
	check('project_name').escape(),
	check('project_desc').escape(),
	check('update').escape(),
	check('oddlead').escape(),
	check('oddlead_email').escape(),
	check('servicelead').escape(),
	check('servicelead_email').escape(),
	check('documents').escape()
	], function (req, res) { handle_form(req, res); });
	
//-------------------------------------------------------------------
// DELETE PROJECTS - handle form submissions
//-------------------------------------------------------------------	
router.post('/delete_project_process', requireLogin, function (req, res) {handle_delete(req, res)});

//-------------------------------------------------------------------
// Export PowerBI views - handle form submissions
//-------------------------------------------------------------------	
	
router.get('/api/powerbi_projects_days', function(req, res) {
  var token = req.headers['x-access-token'];
  if (token == process.env.POWERBI_TOKEN) {
	  
	  queries.powerbi_projects_days()
	  .then((data)=>{
		   res.status(200).send(data);
	  })
	  .catch();
  }
  else if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  else if (token != process.env.POWERBI_TOKEN) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  else return res.status(500).send({ auth: false, message: 'Authentication error.' });
});

router.get('/api/powerbi_date_flag', function(req, res) {
  var token = req.headers['x-access-token'];
  if (token == process.env.POWERBI_TOKEN) {
	  
	  queries.powerbi_date_flag()
	  .then((data)=>{
		   res.status(200).send(data);
	  })
	  .catch();
  }
  else if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  else if (token != process.env.POWERBI_TOKEN) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  else return res.status(500).send({ auth: false, message: 'Authentication error.' });
});
	
//-------------------------------------------------------------------
// Error handling
//-------------------------------------------------------------------

/*Handle 404s*/
router.use(function (req, res, next) {
  res.status(404).render('error_page', {"message":"Requested page does not exist."})
})

router.use(function (req, res, next) {
  res.status(500).render('error_page', {"message":"Something went wrong."})
})


//-------------------------------------------------------------------
// Export router
//-------------------------------------------------------------------

module.exports = router;
