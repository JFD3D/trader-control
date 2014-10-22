// mySQL setup functions

var mysql = require('mysql');

var mySQLWrapper = function(host, user, password, database) {
    this.connection = setupConnection(host, user, password, database);
    this.query = query;
}

function setupConnection(host, user, password, database){
  return mysql.createConnection({
    host     : host,
    user     : user,
    password : password,
    database : database
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
