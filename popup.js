

// Global reference to the status display SPAN
var statusDisplay = null;
// Global holders for options
var chromeSssUrl = null;
var chromeSssUser = null;
var chromeSssPassword = null;
// Gloabal holders for authentication information
var sssUser = null;
var sssKey = null;

/**
 * Display message (will replace the contents of the popup).
 * @param string message Message to be displayed.
 * @param string type    Message type (optional), determines additional color. Only 'error' is currently handled.
 */
function displayMessage(message, type) {
	if (type === 'error') {
		message = '<span style="color:red;">' + message + '</span>';
	}
    document.write('<br><br><b><center>' + message + '</center></b>');
}

/**
 * Load optons into global space. Run callback if options loaded.
 * Options are loaded into global scope variables.
 * @param function callback A function callback to run in case of success. 
 */
function loadOptions(callback) {
	chrome.storage.sync.get(["chromeSssUrl","chromeSssUser","chromeSssPassword"], function(result) {
		chromeSssUrl = result["chromeSssUrl"];
		chromeSssUser = result["chromeSssUser"];
		chromeSssPassword = result["chromeSssPassword"];

		// Fail with messase if needed configuration is not provided
		if ( !(chromeSssUrl && chromeSssUser && chromeSssPassword) ) {
			displayMessage('Configuration options missing. Please configure the extension!', 'error');
			return false;
		}

		if (callback) {
			callback();
		}
	});
}

/**
 * Authenticate user and add result into global scope.
 * Run callback if successful. Display error message if not.
 * @param function callback A function callback to run in case of success.
 */
function authenticateUser(callback) {
	// Set up an asynchronous AJAX POST request
	var xhr = new XMLHttpRequest();
    xhr.open('POST', chromeSssUrl + "authCheckCred/", true); //false to make it synchronous

    // Set correct header for form data 
    xhr.setRequestHeader('Content-type', 'application/json');

    var data={
    	"key":"someKey",
    	"op":"authCheckCred",
    	"pass":chromeSssPassword,
    	"user":"mailto:dummy",
    	"label":chromeSssUser,
    };

    // Send the collected data as JSON
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function() {

    	if (xhr.readyState == 4) {
    		if (xhr.status == 200) {
    			var resp = JSON.parse(xhr.responseText);

    			if (resp.error == false) {
    				sssKey = resp.authCheckCred.key;
    				sssUser = resp.authCheckCred.user;

    				if (callback) {
    					callback();
    				}
    			} else {
    				// Fail with message if authentication did not succeed
    				displayMessage('Auntehtication failed. Please check your credentials.', 'error');
    				return false;
    			}
    		} else {
    			// Fail with message and error code if one occurs
    			displayMessage("Authentication request failure with code " + xhr.status, 'error');
    			return false;
    		}
		}
	}
}

/**
 * Load tags and display a tagcloud.
 */
function displayTagcloud() {
	// Set up an asynchronous AJAX POST request
	var xhr = new XMLHttpRequest();
    xhr.open('POST', chromeSssUrl + "tagsGet/", true); //false to make it synchronous

    // Set correct header for form data 
    xhr.setRequestHeader('Content-type', 'application/json');

    var data={
    	"op":"tagsGet",
    	"user":sssUser,
    	"key":sssKey,
    	"forUser":sssUser,
    };

    // Send the collected data as JSON
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function() {
    	if (xhr.readyState == 4) {
    		if (xhr.status == 200) {
    			var resp = JSON.parse(xhr.responseText);

    			if (resp.error == false) {
    				var tagcloud = document.getElementById('tagcloud');

    				// XXX Need to create a array with unique tags and occurance counts
    				resp.tagsGet.tags.forEach(function(element) {
    					var taga = document.createElement('a');
    					taga.text = element.label;
    					taga.href = '#';

    					tagcloud.innerHTML = tagcloud.innerHTML + ' ';
    					tagcloud.appendChild(taga);
    				});
    			}
    		}
    	}
    }

}

/**
 * Create a collection within a root collection. Also add an entity to collection.
 * @param string  rootCollection URI of the root collection.
 * @param string  label          Label for newly created collection
 * @param boolean isPrivate      Flag if collection is a private or public one.
 * @param string  entityURI      URI of an entity to be added to collection.
 * @param string  entityLabel    Label of an entity to be added to collection.
 * @param array   entityTags     Array of tags to be added to an entity.
 */
function createCollection(rootCollection, label, isPrivate, entityURI, entityLabel, entityTags) {
	// Set up an asynchronous AJAX POST request
	var xhr = new XMLHttpRequest();
	xhr.open('POST', chromeSssUrl + "collEntryAdd/", true); //false to make it synchronous

	// Set correct header for form data 
	xhr.setRequestHeader('Content-type', 'application/json');

	var data={
		"addNewColl": true,
		"coll": rootCollection,
		"label": label,
		"key": sssKey,
		"op": "collEntryAdd",
		"user": sssUser,
	};

	// Send the collected data as JSON
	xhr.send(JSON.stringify(data));

	xhr.onreadystatechange = function () {

	    if (xhr.readyState == 4) {

	    	var resp = JSON.parse(xhr.responseText);
			var storageCollection = resp.collEntryAdd.entity;

			if (!isPrivate) {
				
				// Set up an asynchronous AJAX POST request
				var xhr1 = new XMLHttpRequest();
				xhr1.open('POST', chromeSssUrl + "entityPublicSet/", true); //false to make it synchronous

				// Set correct header for form data 
				xhr1.setRequestHeader('Content-type', 'application/json');

				var data={	
					"entity":storageCollection,
					"key": sssKey,
					"op": "entityPublicSet",
					"user": sssUser,
				};

				// Send the collected data as JSON
				xhr1.send(JSON.stringify(data));

				xhr1.onreadystatechange = function() {
					if (xhr1.readyState == 4) {
						// Add entity to collection. Make sure that we wait until the collection becomes public
						createEntity(storageCollection, entityURI, entityLabel, entityTags);
					}
				}
			} else {
				// Add entity to collection
				createEntity(storageCollection, entityURI, entityLabel, entityTags);
			}
		}
	}
}

/**
 * Add an entity to collection. Assign tags to an entity.
 * @param string storageCollection URI of the collection to add an entity to.
 * @param string entity            URI of an entity to be created.
 * @param string label             Label of an entity to be created.
 * @param array  tags              Array of tags to be added to an entity.
 */
function createEntity(storageCollection, entity, label, tags) {
	// Set up an asynchronous AJAX POST request
	var xhr = new XMLHttpRequest();
    xhr.open('POST', chromeSssUrl + "collEntryAdd/", true); //false to make it synchronous

    // Set correct header for form data 
    xhr.setRequestHeader('Content-type', 'application/json');

    var data={
    	"addNewColl": false,
		"coll": storageCollection,
		"entry": entity,
		"label": label,
		"key": sssKey,
		"op": "collEntryAdd",
		"user": sssUser,
	};

	// Send the collected data as JSON
	xhr.send(JSON.stringify(data));

	xhr.onreadystatechange = function () {

		if (xhr.readyState == 4) {

			// Add tags to an entity/bookmark
			for(j=0;j<tags.length;j++){
				if(tags[j].replace(/^\s+|\s+$/g,'').length>0){
				    // Set up an asynchronous AJAX POST request
				    var xhr1 = new XMLHttpRequest();
				    xhr1.open('POST', chromeSssUrl + "tagAdd/", true); //false to make it synchronous

				    // Set correct header for form data 
				    xhr1.setRequestHeader('Content-type', 'application/json');
					
					var data={
						"key": sssKey,
						"op": "tagAdd",
						"entity": entity,
						"space": "privateSpace", // TODO See if it would make sense to set tags to be public, if the collection is public
						"label": tags[j].replace(/^\s+|\s+$/g,''),
						"user": sssUser,
					};

					// Send the collected data as JSON
					xhr1.send(JSON.stringify(data));
				}
			}
		}
	}
}

/**
 * Collect the data and create an entity on the server.
 * Will determine which collection to use: public or private.
 * In case the needed collection does not exist yet, one will be created.
 */
function addBookmark() {
    // Cancel the form submit
    event.preventDefault();
    
    // Prepare the data to be POSTed
    var entityLabel = document.getElementById('title').value;
	var entityTags;

	if(document.getElementById('tags').value.length>1) {
    	entityTags = document.getElementById('tags').value.split(',');
	} else {
		entityTags = "";
	}

    var privates = document.getElementById('private').checked;

	chrome.tabs.getSelected(null,function(tab) {
	     var entityURI = tab.url;	

	     // Load the root collection of the user. That one should hold all the needed subcollections

	     // Set up an asynchronous AJAX POST request
	     var xhr = new XMLHttpRequest();
	     xhr.open('POST', chromeSssUrl + "collsWithEntries/", true); //false to make it synchronous

	     // Set correct header for form data 
	     xhr.setRequestHeader('Content-type', 'application/json');

	     var data={
	     	"key": sssKey,
	     	"op" : "collsWithEntries",
	     	"user": sssUser,
	     };

	     // Send the collected data as JSON
	     xhr.send(JSON.stringify(data));

	     xhr.onreadystatechange = function () {

	     	if (xhr.readyState == 4) {
	     		var resp = JSON.parse(xhr.responseText);

	     		var storageCollection = "null";

	     		// Get URI of the Private Bookmarks collection, if one already exists
	     		if(privates == true){
	     			for(i=0;i<resp.collsWithEntries.colls.length;i++){
	     				if(resp.collsWithEntries.colls[i].label == chromeSssUser + " : Bookmarks Private"){
	     					storageCollection = resp.collsWithEntries.colls[i].id;
	     				}
	     			}
	     		}

	     		// Get URI of the Shared Bookmarks collection, if one already exists 
	     		if(privates == false){
	     			for(i=0;i<resp.collsWithEntries.colls.length;i++){
	     				if(resp.collsWithEntries.colls[i].label == chromeSssUser + " : Bookmarks Shared"){
	     					storageCollection = resp.collsWithEntries.colls[i].id;
	     				}
	     			}
	     		}

	     		// Check if suitable storage collection found
	     		// Create one within a root collection if not
	     		if (storageCollection == "null") {
	     			var rootCollection = null;

	     			for(i=0;i<resp.collsWithEntries.colls.length;i++){
	     				if(resp.collsWithEntries.colls[i].label == "root"){
	     					rootCollection = resp.collsWithEntries.colls[i].id;
						}
					}

					// Create a private collecion
					if(privates == true){
						// Create a private collection and pass information to add an entity
						// Collection creation method would also add an entity to the collection
						createCollection(rootCollection, chromeSssUser + " : Bookmarks Private", privates, entityURI, entityLabel, entityTags);
					}

					// Create a public collection
					if(privates == false){
						// Create a public collection and pass information to add an entity
						// Collection creation method would also add an entity to the collection
						createCollection(rootCollection, chromeSssUser + " : Bookmarks Shared", privates, entityURI, entityLabel, entityTags);
					}
				} else {
				    
				    // Add an entity to a corresponding collection
				    createEntity(storageCollection, entityURI, entityLabel, entityTags);
				}
			}
		}

		// TODO It might make sense to only show the message in case of success
		displayMessage('Your bookmark has been saved in the Social Semantic Server');
	});  
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
	// Load options, display error message if fails or options are empty
	loadOptions(function() {
		// Authenticte use with callback if successful
		authenticateUser(function() {
			// Display tagcloud if successful
			displayTagcloud();

			// Handle the bookmark form submit event with our addBookmark function
			document.getElementById('addbookmark').addEventListener('submit', addBookmark);
		});
	});

    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    // Call the getPageInfo function in the background page, injecting content_script.js 
    // into the current HTML page and passing in our onPageInfo function as the callback

    chrome.tabs.getSelected(null,function(tab) {

    	var tabTitle = tab.title;

    	document.getElementById('title').value = tabTitle;
    });
});
