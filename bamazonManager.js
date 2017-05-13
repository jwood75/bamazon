var mysql = require("mysql");
var inquirer = require("inquirer");

//using dotenv to safely store password and username
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

var start = function(){

	console.log(`
	+
	+    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$            
	+    $$                                              $$
	+    $$                WELCOME TO THE                $$
	+    $$                  INVENTORY                   $$
	+    $$                                              $$
	+    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   
	+
	`);

	//code to start the application
	inquirer.prompt({
		name: "mainMenu",
		type: "list",
		message: "WHAT WOULD YOU LIKE TO DO? PRESS [ENTER] TO SELECT",
		choices: ["VIEW CURRENT INVENTORY", "VIEW PRODUCTS LOW IN INVENTORY", "UPDATE PRODUCTS IN INVENTORY", "ADD NEW PRODUCTS TO INVENTORY"]
	}).then(function(answer){
		//based on the answer will run associated function or restart program if input is not recognized
		if(answer.mainMenu.toUpperCase() === "VIEW CURRENT INVENTORY"){
			displayAll();
		}
		else if(answer.mainMenu.toUpperCase() === "VIEW PRODUCTS LOW IN INVENTORY"){
			lowInventory();
		}
		else if(answer.mainMenu.toUpperCase() === "UPDATE PRODUCTS IN INVENTORY"){
			update();
		}
		else if(answer.mainMenu.toUpperCase() === "ADD NEW PRODUCTS TO INVENTORY"){
			addItem();
		}
		else{
			console.log("SORRY THAT COMMAND IS NOT RECOGNIZED, PLEASE TRY AGAIN!");
			console.log("-----------------------------");
			console.log("-----------------------------");

			start();
		}
	});
}

var displayAll = function(){

	//code to display all items for sale
	connection.query("SELECT * FROM products", function(err, res){

		if(err) throw err;
		console.log(" ");
		console.log("HERE ARE ALL ITEMS CURRENTLY IN THE INVENTORY");
		console.log(" ");

		//for loop to neatly organize how products are displayed
		for (var i = 0; i < res.length; i++){

			console.log("Item ID: " + res[i].item_id +" || Product Name: " + res[i].product_name +" || Price: $" + res[i].price +".00 || Department: " + res[i].department_name + " || Quantity: " + res[i].stock_quantity);
			console.log(" ");
		}

		//setting up prompt to return to mainMenu
		inquirer.prompt({
			name: "return",
			type: "confirm",
			message: "WOULD YOU LIKE TO RETURN TO THE MAIN MENU? TYPE [Y] TO CONFIRM OR [N] TO QUIT",
			default: true
		}).then(function(answer){
			if(answer.return === true){

				console.log("-----------------------------");
				console.log("-----------------------------");
				start();
			}
			else{

				console.log(" ");
				console.log("GOODBYE!");
				console.log("-----------------------------");
				console.log("-----------------------------");
			}
		});
	});
}

var lowInventory = function(){
	//code to display items low in stock
	connection.query("SELECT * FROM products", function(err, res){

		console.log(" ");
		console.log("THESE ITEMS ARE CURRENTLY RUNNING LOW!!");
		console.log(" ");

		//for lop to run through as display results
		for(var i = 0; i < res.length; i++){

			//if statement to check quantity amount
			if(res[i].stock_quantity <= 5){

				console.log("Item ID: " + res[i].item_id +" || Product Name: " + res[i].product_name +" || Price: $" + res[i].price +".00 || Department: " + res[i].department_name + " || Quantity: " + res[i].stock_quantity);
				console.log(" ");
			}
		}
		//setting up prompt to return to mainMenu
		inquirer.prompt({
			name: "return",
			type: "confirm",
			message: "WOULD YOU LIKE TO UPDATE THE QUANTITY OF THESE ITEMS? TYPE [Y] TO CONFIRM OR [N] TO RETURN TO THE MAIN MENU.",
			default: true
		}).then(function(answer){
			if(answer.return === true){

				console.log(" ");
				console.log("-----------------------------");
				console.log("-----------------------------");
				update();
			}
			else{

				console.log(" ");
				console.log("-----------------------------");
				console.log("-----------------------------");
				start();
			}
		});
	});
	
}

var update = function(){
	//code to update current items in inventory database
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

						choiceArray.push("Item ID: " + res[i].item_id +" || Product Name: " + res[i].product_name +" || Price: $" + res[i].price +".00 || Department: " + res[i].department_name + " || Quantity: " + res[i].stock_quantity);
					}
					return choiceArray;
				},
				message: "PLEASE TPYE ID NUMBER TO SELECT PRODUCT TO UPDATE"
			}

		]).then(function(answer){
			var chosenItem

			for(var i = 0; i < res.length; i++){

				if("Item ID: " + res[i].item_id +" || Product Name: " + res[i].product_name +" || Price: $" + res[i].price +".00 || Department: " + res[i].department_name + " || Quantity: " + res[i].stock_quantity === answer.choice){

					chosenItem = res[i];

					inquirer.prompt([
						{
							name: "productName",
							type: "input",
							message: "ENTER NEW NAME FOR PRODUCT. IF NO CHANGE PRESS [ENTER]",
							default: chosenItem.product_name
						},{
							name: "departent",
							type: "list",
							message: "SELECT NEW DEPARTMENT FOR PRODUCT. IF NO CHANGE PRESS [ENTER]",
							choices: ["FOOD & DRINKS", "MAGAZINES & ENTERTAINMENT", "HEALTH & BEAUTY"],
							default: chosenItem.department_name.toUpperCase()
						},{
							name: "price",
							type: "input",
							message: "ENTER NEW PRICE FOR PRODUCT. IF NO CHANGE PRESS [ENTER]",
							validate: function(value) {
						      if (isNaN(value) === false) {
						        return true;
						      }
						      return false;
						    },
						    default: chosenItem.price
						},{
							name: "quantity",
							type: "input",
							message: "ENTER NEW QUANTITY AMOUNT. IF NO CHANGE PRESS [ENTER]",
							validate: function(value) {
						      if (isNaN(value) === false) {
						        return true;
						      }
						      return false;
						    },
						    default: chosenItem.stock_quantity
						},{
							name: "confirm",
							type: "confirm",
							message: "ARE YOU SURE YOU WANT TO SAVE THESE CHANGES? PRESS [Y] TO CONFIRM OR [N] TO CANCEL",
							default: true
						}

					]).then(function(answer){

						//using user answers to update the database if user confirms
						if(answer.confirm === true){
							//update database
							connection.query("UPDATE products SET ? WHERE ?", [{

								product_name: answer.productName,
								department_name: answer.departent,
								price: answer.price,
								stock_quantity: answer.quantity
							},{
								item_id: chosenItem.item_id

							}], function(err){

								if (err) throw err;
								console.log(" ");
								console.log("THIS PRODUCT HAS BEEN SUCCESSFULLY UPDATED!");
								console.log("---------------------------------");
								console.log("---------------------------------");

								start();
							});
						}
						else{
							console.log(" ");
							console.log("NO CHANGES WERE MADE!");
							console.log("-----------------------------");
							console.log("-----------------------------");
							start();
						}
					});
				}
			}

		});
	})
}

var addItem = function(){

	//code to add new item to database
 	inquirer.prompt([

 	  {
	    name: "productName",
	    type: "input",
	    message: "WHAT IS THE NAME OF THE PRODUCT?"
	  }, {
	    name: "departent",
	    type: "list",
	    message: "PLEASE CHOOSE APPROPRIATE DEPARTMENT. PRESS [ENTER] TO SELECT.",
	    choices: ["FOOD & DRINKS", "MAGAZINES & ENTERTAINMENT", "HEALTH & BEAUTY"]
	  }, {
	    name: "price",
	    type: "input",
	    message: "PLEASE ENTER THE PRICE OF OF THE PRODUCT.",
	    validate: function(value) {

	      if (isNaN(value) === false) {
	        return true;
	      }
	      return false;
	    }
	  }, {
	  	name: "quantity",
	  	type: "input",
	  	message: "PLEASE ENTER THE AMOUNT OF PRODUCTS THAT WILL IN INVENTORY.",
	  	validate: function(value) {

	      if (isNaN(value) === false) {
	        return true;
	      }
	      return false;
	    }
	  }
	]).then(function(answer) {

	    // when finished prompting, insert a new item into the db with that info
	    connection.query("INSERT INTO products SET ?", {

	    	product_name: answer.productName,
	    	department_name: answer.departent,
	    	price: answer.price,
	    	stock_quantity: answer.quantity

		}, function(err) {

	    	if (err) throw err; 

	    	console.log("");
	    	console.log("THE ITEM HAS BEEN SUCCESSFULLY ADDED TO THE INVENTORY!");
	    	console.log("-----------------------------");
			console.log("-----------------------------");
	    	start();
    	});
	});
}

start();