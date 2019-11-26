const crypto	= require('crypto');
const queries 	= require('./queries');

function login(req, res) {
	// Get form data
	const user = req.body.user;
	const password = req.body.password;

	// Calculate hash
	const prov_hash = crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
	
	//console.log(prov_hash)
		
	// Define queries
	var text = 'SELECT username, pass_hash, access_group from users where username = $1';
	var values = [user];

	// Check if the usernames match
	queries.generic_query(text, values)
	.then((result) => {

	//console.log(result.rows[0].pass_hash)
		if(result.rowCount == 1){
			if(result.rows[0].pass_hash == prov_hash){
				req.session.user = result.rows[0].username;
				req.session.group = result.rows[0].access_group;
				req.session.login = 'yes';

				res.redirect('/');
				res.end();
				}
			else {
				req.session.destroy;
				res.redirect('/login');
				res.end();
			}
		}
		else {
			req.session.destroy;
			res.redirect('/login');
			res.end();
		}
	}
	)
	.catch();
}

module.exports = login;