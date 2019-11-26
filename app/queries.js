const { Pool } = require('pg');

// Connection pool
const pool = new Pool()

// Queries
const q = {
	current_projects: 	'SELECT * from latest_projects where phase != $1 order by priority_main desc, project_name',
	completed_projects: 'SELECT * from latest_projects where phase = $1 order by timestamp desc',
	max_id:				'SELECT max(project_id) from latest_projects',
	oddleads:			'SELECT distinct oddlead from projects order by oddlead',

	power_bi_date_flag: 'SELECT * from powerbi_input_date_flag_v',
	power_bi_projects_days: 'SELECT * from powerbi_projects_days_v',
	power_bi_phase: 'SELECT * from powerbi_phase_prev',
}

// Export promises
module.exports = {
	current_projects: 	(text, params) => pool.query(q.current_projects, ['completed']),
	completed_projects: (text, params) => pool.query(q.completed_projects, ['completed']),
	max_id:				(text, params) => pool.query(q.max_id),
	oddleads:			(text, params) => pool.query(q.oddleads),
	powerbi_projects_days: (text, params) => pool.query(q.power_bi_projects_days),
	powerbi_date_flag: (text, params) => pool.query(q.power_bi_date_flag),
	powerbi_phase: 		(text, params) => pool.query(q.power_bi_phase),
	generic_query: 		(text, params) => pool.query(text, params),
}