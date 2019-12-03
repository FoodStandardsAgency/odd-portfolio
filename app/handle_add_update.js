const queries 	= require('./queries');
const xss	= require('xss');

function handle_form(req, res) {
	
	// About the project
	var project_id = xss(req.body.project_id)
	const project_name = xss(req.body.project_name)
	const project_desc = xss(req.body.project_desc)
	const rels = xss(req.body.rels)
	
	const phase = xss(req.body.phase)
	const category = xss(req.body.category)
	const subcat = xss(req.body.subcat)
	const rag = xss(req.body.rag)
	const onhold = xss(req.body.onhold)

	// Dates
	var start_date_day = xss(req.body.start_date_day)
	var start_date_month = xss(req.body.start_date_month)
	var start_date_year = xss(req.body.start_date_year)
	
	var actstart_day = xss(req.body.actstart_day)
	var actstart_month = xss(req.body.actstart_month)
	var actstart_year = xss(req.body.actstart_year)
	
	var expend_day = xss(req.body.expend_day)
	var expend_month = xss(req.body.expend_month)
	var expend_year = xss(req.body.expend_year)
	
	var hardend_day = xss(req.body.hardend_day)
	var hardend_month = xss(req.body.hardend_month)
	var hardend_year = xss(req.body.hardend_year)
	
	var update = xss(req.body.update)
	var new_update = xss(req.body.new_update)
	
	const oddlead = xss(req.body.oddlead)
	var oddlead_email = xss(req.body.oddlead_email)
	var oddlead_email = oddlead_email.toLowerCase();
	const servicelead = xss(req.body.servicelead)
	const servicelead_email = xss(req.body.servicelead_email)
	const team = xss(req.body.team)
	
	const priority = xss(req.body.priority)
	const funded = xss(req.body.funded)
	const confidence = xss(req.body.confidence)
	const priorities = xss(req.body.priorities)
	const benefits = xss(req.body.benefits)
	const criticality = xss(req.body.criticality)
	
	const budget = xss(req.body.budget)
	const spent = xss(req.body.spent)
	
	const docs_name1 = xss(req.body.docs_name1)
	const docs_name2 = xss(req.body.docs_name2)
	const docs_name3 = xss(req.body.docs_name3)
	const docs_name4 = xss(req.body.docs_name4)
	
	const docs_link1 = xss(req.body.docs_link1)
	const docs_link2 = xss(req.body.docs_link2)
	const docs_link3 = xss(req.body.docs_link3)
	const docs_link4 = xss(req.body.docs_link4)
	
	var link_name = xss(req.body.link_name)
	var link_address = xss(req.body.link_address)
	
	const project_size = xss(req.body.project_size)
	const oddlead_role = xss(req.body.oddlead_role)
	
	const deps		= xss(req.body.deps)
	
	const form_type = xss(req.body.form_type)
	
	
	// Combine links and docs names
	if (docs_name1 != '' || docs_name2 != '' || docs_name3 != '' || docs_name4 != ''){
		var str = docs_name1.concat(',',docs_link1,',',docs_name2,',',docs_link2,',',docs_name3,',',docs_link3,',',docs_name4,',',docs_link4);
		var documents = str.split(',');	
		
		// Remove empty elements from the array
		var documents = documents.filter(elem => elem.length > 0);
		
		// Convert back to string
		var documents = documents.toString();
	}
	else {var documents = '';}
	
	// Combine link to project channel (name & link)
	if (link_address != ''){
		if (link_name == ''){link_name = 'Link'}
		var link = link_name.concat(',',link_address);
	}
		
	// Calculate priority group
	var pgroup = '';
	if(parseInt(priority,10) >= 15) 		{var pgroup = 'high';}
	else if(parseInt(priority,10) >= 10) 	{var pgroup = "medium-high";}
	else if(parseInt(priority,10) >= 5)		{var pgroup = "medium-low";}
	else 									{var pgroup = "low";}

	// Concatenate DD MM YYYY into dates
	if(start_date_day == '' || start_date_day == undefined) 	{start_date_day = '00';}
	if(start_date_month == '' || start_date_month == undefined) 	{start_date_month = '00';}
	if(start_date_year == '' || start_date_year == undefined) 	{start_date_year = '0000';}
	var start_date = ''.concat(start_date_day,'/',start_date_month,'/',start_date_year);
	
	if(actstart_day == '' || actstart_day == undefined) 	{actstart_day = '00';}
	if(actstart_month == '' || actstart_month == undefined) 	{actstart_month = '00';}
	if(actstart_year == '' || actstart_year == undefined) 	{actstart_year = '0000';}
	var actstart = ''.concat(actstart_day,'/',actstart_month,'/',actstart_year);
	
	if(expend_day == '' || expend_day == undefined) 	{expend_day = '00';}
	if(expend_month == '' || expend_month == undefined) 	{expend_month = '00';}
	if(expend_year == '' || expend_year == undefined) 	{expend_year = '0000';}
	var expend = ''.concat(expend_day,'/',expend_month,'/',expend_year);
	
	if(hardend_day == '' || hardend_day == undefined) 	{hardend_day = '00';}
	if(hardend_month == '' || hardend_month == undefined) 	{hardend_month = '00';}
	if(hardend_year == '' || hardend_year == undefined) 	{hardend_year = '0000';}
	var hardend = ''.concat(hardend_day,'/',hardend_month,'/',hardend_year);
	
	// Get the latest update
	if(new_update != '' && new_update != undefined){var update = new_update;}
	
	// Run insert query
	
	var insert_query = 'INSERT INTO projects(project_id, project_name, start_date, short_desc, phase, category, subcat, rag, update, oddlead, oddlead_email, servicelead, servicelead_email, priority_main, funded, confidence, priorities, benefits, criticality, budget, spent, documents, link, pgroup, rels, team, onhold, expend, hardend, actstart, dependencies, project_size, oddlead_role) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)';
	var values = [project_id, project_name, start_date, project_desc, phase, category, subcat, rag, update, oddlead, oddlead_email, servicelead, servicelead_email, priority, funded, confidence, priorities, benefits, criticality, budget, spent, documents, link, pgroup, rels, team, onhold, expend, hardend, actstart, deps, project_size, oddlead_role];
		
	queries.generic_query(insert_query, values)
	.then(console.log("INSERT query run - project update or addition"))
	.catch(e => console.error(e.stack))
	
	// Redirect to the project page
	var url = '/projects/'.concat(project_id);
	if (form_type == 'ptadd'){
		// Wait for 3 seconds before redirecting - as it needs to create the page before redirecting. Without delay, it redirects to the homepage.
		setTimeout(function () {
			res.redirect(url)
		}, 3000); 
	}	
	else {res.redirect(url)}
}

module.exports = handle_form;
