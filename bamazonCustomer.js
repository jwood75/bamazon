var mysql = require("mysql");
var inquirer = require("inquirer");

//calling dotenv to safely store password and user name
require("dotenv").config();
var password = process.env.password;

//creating variable to store mysql connection 
var connection = mysql.createConnection({

	host: "localhost",
	port: 3306,

	//use your username
	user: "root",
	//use your password
	password: password,

	database: "bamazon"
});

//connecting to the mysql server and database
connection.connect(function(err){

	//if error will display error
	if (err) throw err;
});

//writing function that will start the program and display all items available to sell
var start = function(){

	console.log(`
	+
	+    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$            
	+    $$                                              $$
	+    $$                WELCOME TO THE                $$
	+    $$                 CONVINI-MART                 $$
	+    $$                                              $$
	+    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   
	+
	`);

	//grabbing all items in database to be displaye
	connection.query("SELECT * FROM products", function(err, res){
		if (err) throw err;

		//seeting inquirer to list all items
		inquirer.prompt([

			{
				name: "choice",
				type: "rawlist",
				choices: function(){
					var choiceArray = [];
					for (var i = 0; i < res.length; i++){

						choiceArray.push(res[i].product_name +" -- $" + res[i].price +".00");
					}
					return choiceArray;
				},
				message: "PLEASE TPYE ID NUMBER TO PURCHASE PRODUCT"
			},

			{
				name: "amount",
				type: "input",
				message: "HOW MANY WOULD YOU LIKE TO BUY?"
			}

		]).then(function(answer){

			//grabbing information of chosen item
		    var chosenItem;
		    var total;
		    var requestedAmount = answer.amount;

		    for (var i = 0; i < res.length; i++) {

		    	if (res[i].product_name +" -- $" + res[i].price +".00" === answer.choice) {

		        	chosenItem = res[i];

		        	total = answer.amount * chosenItem.price;

					//confirming if user wishes to continue with purchase
					inquirer.prompt([
						{
							name: "confirm",
							type: "confirm",
							message: "YOUR TOTAL WILL BE: " + "$ " + total + ".00. TYPE [Y] TO CONFIRM OR [N] TO CANCEL",
							default: true
						}
					]).then(function(answer){

						if (answer.confirm === true){

							//cross referencing and updating stock quantity in the database
							var newQuantity = chosenItem.stock_quantity - requestedAmount;

							//confirming requested amount is in stock
							if (requestedAmount <= chosenItem.stock_quantity){

								//updating database of new amount
								connection.query("UPDATE products SET ? WHERE ?", [{
									stock_quantity: newQuantity
								},{
									item_id: chosenItem.item_id
								}], function(err){
									if(err) throw err;
									console.log(" ");
									console.log("THANK YOU FOR YOUR PURCHASE, PLEASE COME AGAIN SOON!");
									console.log("---------------------------------");
									console.log("---------------------------------");

									start();
								});
							}
							//if stock is too low
							else{
								console.log(" ");
								console.log("WE'RE SORRY, WE DO NOT HAVE THE REQUESTED AMOUNT IN STOCK. PLEASE COME BACK LATER.");
								console.log("---------------------------------");
								console.log("---------------------------------");

								start();
							}
						}
						else if (answer.confirm === false){

							console.log(" ");
							console.log("QUIT WASTING MY TIME!");
							console.log("---------------------------------");
							console.log("---------------------------------");

							start();
						}
					});
		        }
		    }
		});
	})
}

start();