const queries 	= require('./queries');
const moment	= require('moment');

function filter_view (req, res){
	
	// Get values from the form
	var project_name 	= req.body.project_name
	var onhold 			= req.body.onhold
	var phase 			= req.body.phase
	var rag 			= req.body.rag
	var pgroup 			= req.body.pgroup
	var category 		= req.body.category
	var subcat 			= req.body.subcat
	var oddlead 		= req.body.oddlead
	var team 			= req.body.team
	var update_date		= req.body.update_date
	var no_updates		= req.body.no_updates
	var from			= req.body.update_date_from
	var to 				= req.body.update_date_to
	
	if(update_date == undefined) 	{update_date = '';}
	if(no_updates == undefined) 	{no_updates = 'none';}
	if(from == undefined) 			{from = '';}
	if(to == undefined) 			{to = '';}
	
	var form_values = [project_name, phase, rag, pgroup, category, subcat, oddlead, team, onhold, update_date, no_updates, from, to]

	// Build query 
	
	var text = 'SELECT project_id, project_name, priority_main from latest_project_with_update_date where ';
	var values = [];
	var i = 0;
	
	if(update_date != '') 	{var upt_dt 	= moment(update_date, "YYYY/MM/DD");}
	if(from != '') 			{var from 		= moment(from, "YYYY/MM/DD");}
	if(to != '') 			{var to 		= moment(to, "YYYY/MM/DD").add(23, 'hours').add(59, 'minutes');}
	
	if(project_name != '') 	{ 
		var project_name1 = '% '.concat(project_name, ' %');
		var project_name2 = '% '.concat(project_name, ''); 
		var project_name3 = ''.concat(project_name, ' %'); 
		var project_name4 = ''.concat(project_name, ''); 		
		var i = i+4; 
		var text = text.concat('(project_name ILIKE $1 or project_name ILIKE $2 or project_name ILIKE $3 or project_name ILIKE $4 or project_id ILIKE $4) and  '); 
		values.push(project_name1, project_name2, project_name3, project_name4);
	}
	if(phase != 'none')  	{ var i = i+1; var text = text.concat('phase = $',i,' and  '); values.push(phase);}
	if(rag != 'none')  		{ var i = i+1; var text = text.concat('rag = $',i,' and  '); values.push(rag);}
	if(pgroup != 'none')  	{ var i = i+1; var text = text.concat('pgroup = $',i,' and  '); values.push(pgroup);}
	if(category != 'none')  { var i = i+1; var text = text.concat('category = $',i,' and  '); values.push(category);}
	if(subcat != '0')  		{ var i = i+1; var text = text.concat('subcat = $',i,' and  '); values.push(subcat);}
	if(oddlead != '')  		{ var oddlead = '%'.concat(oddlead, '%'); var i = i+1; var text = text.concat('oddlead ILIKE $',i,' and  '); values.push(oddlead);}
	if(team != '')  		{ var team = '%'.concat(team, '%'); var i = i+1; var text = text.concat('(team ILIKE $',i,' or oddlead ILIKE $',i,')  and  '); values.push(team);}
	if(onhold != 'none')  	{ var i = i+1; var text = text.concat('onhold = $',i,' and  '); values.push(onhold);}
	if(from != '' && to != ''){var i = i+2; var text = text.concat('(latest_update>= $',i-1,' and latest_update<= $',i,') and  '); values.push(from); values.push(to);}
	if(update_date != '')	{ var i = i+2; var text = text.concat('(latest_update < $',i-1,' and latest_update is not null ) and update != $',i,' and  '); values.push(upt_dt); values.push('')}
	if(no_updates == 'y')  { 
	
		if(update_date != ''){
			var text = text.substring(0, text.length - 6);
			var i = i+1; var text = text.concat(' or (latest_update is null or update = $',i,') and  '); values.push('');
		}
		else {
			var i = i+1; var text = text.concat('(latest_update is null or update = $',i,') and  '); values.push('');
			}
	}
	
	var text = text.substring(0, text.length - 6);
	
	if(update_date != ''){var text = text.concat(' order by latest_update ASC, priority_main desc, project_name');}
	else {{var text = text.concat(' order by priority_main desc, project_name');}}
	
	console.log(text);
	console.log(values);

	queries.generic_query(text,values)
	.then((result) => 
		res.render('filter_view',{
			"stage": 'results',
			"data": result.rows,
			"project_cnt": result.rowCount,
			"form_values": form_values,
			"sess": req.session
		})
	)
	.catch(e => console.error(e.stack));
};

module.exports = filter_view;