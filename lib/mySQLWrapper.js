// mySQL setup functions

var mysql = require('mysql');

var mySQLWrapper = function(credentials) {
    this.connection = setupConnection(credentials);
    this.query = query;
}

function setupConnection(credentials){
  return mysql.createConnection({
    host     : credentials.mysql_host,
    user     : credentials.mysql_user,
    password : credentials.mysql_password,
    database : credentials.mysql_database
  });
}

function query(query, callback){
  this.connection.connect();
  console.log("executing query: " + query);
  this.connection.query(query, function(err, rows, fields) {
      if (err) {
          throw err;
      }
      else {
          callback(rows);
      }
  });
  this.connection.end();
}

module.exports = mySQLWrapper;
