const queries 	= require('./queries');
const striptags = require('striptags');

function handle_form(req, res) {
	
	// About the project
	const project_id = striptags(req.body.project_id)
	const project_name = striptags(req.body.project_name)
	const project_desc = striptags(req.body.project_desc)
	const rels = striptags(req.body.rels)
	
	const phase = striptags(req.body.phase)
	const category = striptags(req.body.category)
	const subcat = striptags(req.body.subcat)
	const rag = striptags(req.body.rag)
	const onhold = striptags(req.body.onhold)

	// Dates
	var start_date_day = striptags(req.body.start_date_day)
	var start_date_month = striptags(req.body.start_date_month)
	var start_date_year = striptags(req.body.start_date_year)
	
	var actstart_day = striptags(req.body.actstart_day)
	var actstart_month = striptags(req.body.actstart_month)
	var actstart_year = striptags(req.body.actstart_year)
	
	var expend_day = striptags(req.body.expend_day)
	var expend_month = striptags(req.body.expend_month)
	var expend_year = striptags(req.body.expend_year)
	
	var hardend_day = striptags(req.body.hardend_day)
	var hardend_month = striptags(req.body.hardend_month)
	var hardend_year = striptags(req.body.hardend_year)
	
	var update = striptags(req.body.update)
	var new_update = striptags(req.body.new_update)
	
	const oddlead = striptags(req.body.oddlead)
	const oddlead_email = striptags(req.body.oddlead_email)
	const servicelead = striptags(req.body.servicelead)
	const servicelead_email = striptags(req.body.servicelead_email)
	const team = striptags(req.body.team)
	
	const priority = striptags(req.body.priority)
	const funded = striptags(req.body.funded)
	const confidence = striptags(req.body.confidence)
	const priorities = striptags(req.body.priorities)
	const benefits = striptags(req.body.benefits)
	const criticality = striptags(req.body.criticality)
	
	const budget = striptags(req.body.budget)
	const spent = striptags(req.body.spent)
	
	const docs_name1 = striptags(req.body.docs_name1)
	const docs_name2 = striptags(req.body.docs_name2)
	const docs_name3 = striptags(req.body.docs_name3)
	const docs_name4 = striptags(req.body.docs_name4)
	
	const docs_link1 = striptags(req.body.docs_link1)
	const docs_link2 = striptags(req.body.docs_link2)
	const docs_link3 = striptags(req.body.docs_link3)
	const docs_link4 = striptags(req.body.docs_link4)
	
	var link_name = striptags(req.body.link_name)
	var link_address = striptags(req.body.link_address)
	
	const deps		= striptags(req.body.deps)
	
	const form_type = striptags(req.body.form_type)
	
	
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
	
	var insert_query = 'INSERT INTO projects(project_id, project_name, start_date, short_desc, phase, category, subcat, rag, update, oddlead, oddlead_email, servicelead, servicelead_email, priority_main, funded, confidence, priorities, benefits, criticality, budget, spent, documents, link, pgroup, rels, team, onhold, expend, hardend, actstart, dependencies) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)';
	var values = [project_id, project_name, start_date, project_desc, phase, category, subcat, rag, update, oddlead, oddlead_email, servicelead, servicelead_email, priority, funded, confidence, priorities, benefits, criticality, budget, spent, documents, link, pgroup, rels, team, onhold, expend, hardend, actstart, deps];
		
	queries.generic_query(insert_query, values)
	.then(console.log("INSERT query run - project update or addition"))
	.catch(e => console.error(e.stack))
	
	if (form_type != 'ptadd'){var ft = "updated";}	else {var ft = "added";}
	
	// Display thank you page
	res.render('thank_you', {
	"id": project_id,
	"message": ft
	})
}

module.exports = handle_form;
