const crypto	= require('crypto');
const queries 	= require('./queries');

function add_supplier(req, res) {
	// Get form data
	const user = req.body.user;
	const password = req.body.password;

	// Calculate hash
	const hash = crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
		
	// Insert query - to create the account
	var text = 'INSERT into users (username, pass_hash, access_group) VALUES ($1, $2, $3)';
	var values = [user, hash, 4];

	// Check if the usernames match
	queries.generic_query(text, values).then().catch();
	
	// Redirect
	res.redirect('/add-supplier');
}

function render_add_supplier(req,res){
	
		var text = 'SELECT * from users where access_group = $1';
		var values = [4];
		
		queries.generic_query(text, values)
		.then((result)=>{

			if(result.rowCount > 0){
				
				var supps = []; for (i = 0; i < result.rowCount; i++){supps.push(result.rows[i].username);}
				
				res.render("add_supplier", {
					"cnt": result.rowCount,
					"supps": supps					
				});
			}
			else {res.render("add_supplier");}
		})
		.catch();
	
}

module.exports = {add_supplier, render_add_supplier};