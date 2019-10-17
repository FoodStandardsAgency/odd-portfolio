const queries 	= require('./queries');

function update_portfolio(req,res) {
	
	// Get the project_id from URL
	const project_id = req.params.project_id;
	
	//Pull data from the DB to pre-populate the form
	var text = 'SELECT project_id, project_name, start_date, short_desc, phase, category, subcat, rag, update, oddlead, oddlead_email, servicelead, servicelead_email, priority_main, funded, confidence, priorities, benefits, criticality, budget, spent, documents, link, rels, team, onhold, expend, hardend, actstart, dependencies from latest_projects where project_id = $1';
	var values = [project_id];

	// Run the query
	queries.generic_query(text, values)
	.then((result) => {
		
		// Display start date as Month Year
		var start_date_day = result.rows[0].start_date.slice(0,2);
		var start_date_month = result.rows[0].start_date.slice(3,5);
		var start_date_year = result.rows[0].start_date.slice(6,10);
		
		var actstart_day = result.rows[0].actstart.slice(0,2);
		var actstart_month = result.rows[0].actstart.slice(3,5);
		var actstart_year = result.rows[0].actstart.slice(6,10);
		
		var expend_day = result.rows[0].expend.slice(0,2);
		var expend_month = result.rows[0].expend.slice(3,5);
		var expend_year = result.rows[0].expend.slice(6,10);
		
		var hardend_day = result.rows[0].hardend.slice(0,2);
		var hardend_month = result.rows[0].hardend.slice(3,5);
		var hardend_year = result.rows[0].hardend.slice(6,10);
		
		var dates = [start_date_day, start_date_month, start_date_year, actstart_day, actstart_month, actstart_year, expend_day, expend_month, expend_year, hardend_day, hardend_month, hardend_year ]
		
		// handle documents
		if(result.rows[0].documents != null && result.rows[0].documents != ''){var docs = result.rows[0].documents.split(",");}	else {var docs = '';}
		
		// handle link
		if(result.rows[0].link != null && result.rows[0].link != ''){var links = result.rows[0].link.split(",");} else {var links = '';}
			
			res.render('add_project', {
			"title": "Update existing project",
			"button": "Update project",
			"form_type": "ptupdate",
			"data": result.rows[0],
			"docs": docs,
			"link": links,
			"dates": dates
			});
		})
	.catch();
	
}

module.exports = update_portfolio;