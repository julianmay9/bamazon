var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,

	user: 'root',

	password: 'tigger33',
	database: 'Bamazon'
});

function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a valid Bamazon Item ID number.';
	}
}

function promptUserPurchase() {
	
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Please enter the Item ID of the product you would like to purchase.',
			validate: validateInput,
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many do you need?',
			validate: validateInput,
			filter: Number
		}
	]).then(function(input) {

		var item = input.item_id;
		var quantity = input.quantity;

		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, data) {
			if (err) throw err;


			if (data.length === 0) {
				console.log("ERROR: This Item ID is invalid. Please select a valid Item ID from the list shown.");
				displayInventory();

			} else {
				var productData = data[0];

				if (quantity <= productData.stock_quantity) {
                    console.log("Good news! The product you requested is in stock! Please wait while we process your order...");
                    console.log("\n");

					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log("Awesome! Your order has now been placed! Your Bamazon total today is $" + productData.price * quantity);
						console.log("Thanks for shopping with Bamazon!");
						console.log("\n---------------------------------------------------------------------\n");

						connection.end();
					})
				} else {
					console.log("Sorry, there is not enough of your chosen product in stock.");
					console.log("Please select a different item or come back tomorrow.");
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
				}
			}
		})
	})
}

function displayInventory() {
	queryStr = 'SELECT * FROM products';

	connection.query(queryStr, function(err, data) {
		if (err) throw err;

        console.log("\n");
        console.log("---------------------------------------------------------------------\n");
        console.log(".....................................................................\n");
        console.log("       B A M A Z O N     P R O D U C T S     I N     S T O C K : ");
        console.log(".....................................................................\n");
        console.log("---------------------------------------------------------------------\n");

		var strOut = '';
		for (var i = 0; i < data.length; i++) {
			strOut = '';
			strOut += 'Item ID: ' + data[i].item_id + '  //  ';
			strOut += 'Product Name: ' + data[i].product_name + '  //  ';
			strOut += 'Department: ' + data[i].department_name + '  //  ';
			strOut += 'Price: $' + data[i].price + '\n';

			console.log(strOut);
		}

	  	console.log("---------------------------------------------------------------------\n");

	  	promptUserPurchase();
	})
}

function runBamazon() {
	displayInventory();
}

runBamazon();