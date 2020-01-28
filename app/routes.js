const express 			= require('express');
const { check } 		= require('express-validator');
const _ 				= require('lodash');
const multer			= require('multer');
const jwt 				= require('jsonwebtoken');
const xss				= require('xss');
const stringify 		= require('csv-stringify')

// Custom modules
const config 			= require('./config');
const queries 			= require('./queries');

const add_project 		= require('./render_add_project');
const {add_supplier}		= require('./add_supplier');
const {render_add_supplier}	= require('./add_supplier');
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
// SUPPLIER ACCOUNT
//-------------------------------------------------------------------

router.get('/add-supplier', requireLogin, function (req, res) {
	if(req.session.user == 'portfolio') {render_add_supplier(req,res)}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});

router.post('/add-supplier', [check('user').escape()], function (req, res) {add_supplier(req,res);});


//-------------------------------------------------------------------
// TEAMS
//-------------------------------------------------------------------

router.get('/odd_people/unmatched', requireLogin, function (req, res) {
	if(req.session.user == 'portfolio') {
		queries.unmatched_leads()
		.then( (result) => {
			res.render('odd_people_unmatched', {
				"data": result.rows,
				"count": result.rowCount,
				"sess": req.session,
			})
		})
		.catch();
	}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});

router.get('/odd_people/view', requireLogin, function(req,res){
	if(req.session.user == 'portfolio') {
		queries.odd_people()
		.then( (result) => {
			
			if(result.rowCount >0){
				res.render('odd_people_all', {
					"data": nestedGroupBy(result.rows, ['g6team']),
					"count": result.rowCount,
					"teams": config.teams,
					"sess": req.session,
				})
			}
			else {res.redirect('/')}
		})
		.catch();
	}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
})

router.get('/odd_people/add', requireLogin, function (req, res) {
	if(req.session.user == 'portfolio') {res.render('add_odd_person', {"msg":"Add", "action":"/add-odd"})}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
});

router.get('/odd_people/update/:id', requireLogin, function(req,res){
	if(req.session.user == 'portfolio') {
	var text = 'select * from odd_people where id = $1'
	var values = [req.params.id]
	
	queries.generic_query(text,values)
	.then( (result) => {
		
		if (result.rowCount == 1) {
		res.render('add_odd_person',{"data":result.rows[0], "msg":"Update", "action":"/edit-odd"})
		}
		
		else res.render('add_odd_person',{"msg":"Add"})
	})
	.catch();
	}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
	})
	
	
router.get('/odd_people/delete/:id', requireLogin, function(req,res){
	if(req.session.user == 'portfolio') {
	var text = 'select * from odd_people where id = $1';
	var values = [req.params.id]
	
	queries.generic_query(text,values)
	.then( (result) =>{
	
	if (result.rowCount = 1){
			res.render('odd_people_delete_conf', {"data":result.rows[0]})
		}
	else res.redirect('/');
	})
	.catch()
	}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
})

router.post('/add-odd', requireLogin, function(req,res){
	var surname 	= xss(req.body.surname)
	var firstname 	= xss(req.body.firstname)
	var email		= xss(req.body.email)
	var g6team		= xss(req.body.g6team)
	
	var values = [surname, firstname,  email, g6team];
	var text = 'insert into odd_people (surname, firstname, email, g6team) values ($1, $2, $3, $4)';
	
	queries.generic_query(text, values).then();
	
	setTimeout(function () {res.redirect('/odd_people/view')}, 1000); 
	
});

router.post('/edit-odd', requireLogin, function(req,res) {
	var surname 	= xss(req.body.surname)
	var firstname 	= xss(req.body.firstname)
	var email		= xss(req.body.email)
	var g6team		= xss(req.body.g6team)
	var recordid	= xss(req.body.recordid)

	var values = [surname, firstname,  email, g6team, recordid];
	var text = 'UPDATE odd_people set surname=$1, firstname=$2, email=$3, g6team=$4 where id = $5';

	queries.generic_query(text,values).then(console.log("update query run"));
	
	setTimeout(function () {res.redirect('/odd_people/view')}, 1000); 

})

router.post('/delete-odd', requireLogin, function(req,res){
	var text = 'delete from odd_people where id = $1'
	var values= [req.body.recordid]
	
	queries.generic_query(text,values).then();
	
	setTimeout(function () {res.redirect('/odd_people/view')}, 1000); 
	
})



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

router.get('/team/', requireLogin, function (req, res) {	
	queries.current_projects()
	.then((result) => {
		res.render('index', {
			"data": nestedGroupBy(result.rows, ['g6team', 'phase']),
			"counts": _.countBy(result.rows, 'phase'),
			"themes": config.teams,
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
	if(req.session.user == 'portfolio' || req.session.user == 'odd' || req.session.user == 'team_leaders'){update_odd(req, res);}
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
router.post('/process-project-form', requireLogin, function (req, res) { handle_form(req, res); });
	
//-------------------------------------------------------------------
// DELETE PROJECTS - handle form submissions
//-------------------------------------------------------------------	
router.post('/delete_project_process', requireLogin, function (req, res) {handle_delete(req, res)});

//-------------------------------------------------------------------
// Export PowerBI views
//-------------------------------------------------------------------	
	
router.get('/api/powerbi_projects_days', function(req, res) {
  var token = req.headers['authorization'];
  if (token == process.env.POWERBI_TOKEN) {
  console.log("Authenticated - ready to provide the data");
	  queries.powerbi_projects_days()
	  .then((data)=>{
		   res.status(200).send(data);
	  })
	  .catch();
  }
  else if (!token) { res.status(401).send({ auth: false, message: 'No token provided.' }); console.log("Missing token");}
  else if (token != process.env.POWERBI_TOKEN) { res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }); console.log("Incorrect token");}
  else { res.status(500).send({ auth: false, message: 'Authentication error.' }); console.log("Other error");}
});

router.get('/api/powerbi_date_flag', function(req, res) {
  var token = req.headers['authorization'];
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

router.get('/api/powerbi_phase_prev', function(req, res) {
  var token = req.headers['authorization'];
  if (token == process.env.POWERBI_TOKEN) {
	  
	  queries.powerbi_phase()
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
// Export latest projects as a csv
//-------------------------------------------------------------------	

router.get('/download/csv', requireLogin, function(req,res){

	if(req.session.user == 'portfolio') {
		queries.latest_projects()
		.then( (result) => {

		  res.setHeader('Content-Type', 'text/csv');
		  res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'latest_projects-' + Date.now() + '.csv\"');
		  res.setHeader('Cache-Control', 'no-cache');
		  res.setHeader('Pragma', 'no-cache');

		  stringify(result.rows, { header: true })
			.pipe(res);
		})
		.catch();
	}
	else {res.render('error_page', {message: 'You are not authorised to view this page'});}
})




	
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
