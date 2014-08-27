

// Global reference to the status display SPAN
var statusDisplay = null;

// POST the data to the server using XMLHttpRequest
function addBookmark() {
    // Cancel the form submit
    event.preventDefault();
    
    // Prepare the data to be POSTed
    var title = document.getElementById('title').value;
	var tags;

	if(document.getElementById('tags').value.length>1)
    	tags = document.getElementById('tags').value.split(',');
	else
	tags = "";

    var privates = document.getElementById('private').checked;

    chrome.storage.sync.get(["chromeSssUrl","chromeSssUser"], function(result) {
	var chromeSssUrl = result["chromeSssUrl"];
	var chromeSssUser = result["chromeSssUser"];
	
	chrome.tabs.getSelected(null,function(tab) {
	     var tabLink = tab.url;	
	

    	// Set up an asynchronous AJAX POST request
    	var xhr = new XMLHttpRequest();
    	xhr.open('POST', chromeSssUrl + "authCheckCred/", true); //false to make it synchronous
	
	// Set correct header for form data 
	xhr.setRequestHeader('Content-type', 'application/json');

	var data={
    		"key":"someKey",
    		"op":"authCheckCred",
    		"pass":"password",
		"user":"mailto:dummy",
		"label":chromeSssUser,
  		};

    
	// send the collected data as JSON
  	xhr.send(JSON.stringify(data));

	xhr.onreadystatechange = function () {
    
		if (xhr.readyState == 4) {
    		var resp = JSON.parse(xhr.responseText);

		var credential = resp.authCheckCred.key;
		var user = resp.authCheckCred.user;
  		//alert(credential + "      " + user);

		//Now I will get the description of the user collections with the method /collsWithEntries/

    		// Set up an asynchronous AJAX POST request
    		var xhr2 = new XMLHttpRequest();
    		xhr2.open('POST', chromeSssUrl + "collsWithEntries/", true); //false to make it synchronous
	
		// Set correct header for form data 
		xhr2.setRequestHeader('Content-type', 'application/json');


		data={
			
			"key": credential,
			"op" : "collsWithEntries",
			"user" : user,
			};
		// send the collected data as JSON
  		xhr2.send(JSON.stringify(data));

			xhr2.onreadystatechange = function () {

			if (xhr2.readyState == 4) {
    			var resp2 = JSON.parse(xhr2.responseText);
	
			var storageCollection = "null";

			//If the bookmark is private I get the URL of the collection "Private bookmarks"
			if(privates == true){
				for(i=0;i<resp2.collsWithEntries.colls.length;i++){
			
					if(resp2.collsWithEntries.colls[i].label == "Bookmarks Private"){
	
						storageCollection = resp2.collsWithEntries.colls[i].id;
						

					}

				
				}
			}

			//If the bookmark is public I get the URL of the collection "Shared bookmarks"
			if(privates == false){
				for(i=0;i<resp2.collsWithEntries.colls.length;i++){
			
					if(resp2.collsWithEntries.colls[i].label == "Bookmarks Shared"){
	
						storageCollection = resp2.collsWithEntries.colls[i].id;
						

					}

				}
			}

			//If the folder does not exist I create it

			//First, I take the root collection
			
			
			if (storageCollection == "null"){

				var rootCollection = "";
				for(i=0;i<resp2.collsWithEntries.colls.length;i++){
			
					if(resp2.collsWithEntries.colls[i].label == "root"){
	
						rootCollection = resp2.collsWithEntries.colls[i].id;
						

					}

				}

			//And I create a public or a private folder

			if(privates == true){


			// Set up an asynchronous AJAX POST request
    			var xhr2a = new XMLHttpRequest();
    			xhr2a.open('POST', chromeSssUrl + "collEntryAdd/", true); //false to make it synchronous
	
			// Set correct header for form data 
			xhr2a.setRequestHeader('Content-type', 'application/json');

			data={
			
			"addNewColl": true,
			"coll": rootCollection,
			"label": "Bookmarks Private",
			"key": credential,
			"op": "collEntryAdd",
			"user": user,
			};

			// send the collected data as JSON
  			xhr2a.send(JSON.stringify(data));

			xhr2a.onreadystatechange = function () {

				if (xhr2a.readyState == 4) {

					var resp2a = JSON.parse(xhr2a.responseText);
					storageCollection = resp2a.collEntryAdd.entity;



			
			//Now I publish the URL in the corresponding folder

			// Set up an asynchronous AJAX POST request
    			var xhr3 = new XMLHttpRequest();
    			xhr3.open('POST', chromeSssUrl + "collEntryAdd/", true); //false to make it synchronous
	
			// Set correct header for form data 
			xhr3.setRequestHeader('Content-type', 'application/json');

			data={
			
			"addNewColl": false,
			"coll": storageCollection,
			"entry": tabLink,
			"label": title,
			"key": credential,
			"op": "collEntryAdd",
			"user": user,
			};

			// send the collected data as JSON
  			xhr3.send(JSON.stringify(data));

			xhr3.onreadystatechange = function () {

				if (xhr3.readyState == 4) {

					//And finally I add the tags to the bookmark
					for(j=0;j<tags.length;j++){
if(tags[j].replace(/^\s+|\s+$/g,'').length>0){
					// Set up an asynchronous AJAX POST request
    					var xhr4 = new XMLHttpRequest();
    					xhr4.open('POST', chromeSssUrl + "tagAdd/", true); //false to make it synchronous
	
					// Set correct header for form data 
					xhr4.setRequestHeader('Content-type', 'application/json');

					

						data={
			
						"key": credential,
						"op": "tagAdd",
						"entity": tabLink,
						"space": "privateSpace",
						"label": tags[j].replace(/^\s+|\s+$/g,''),
						"user": user,
						};

						// send the collected data as JSON
  						xhr4.send(JSON.stringify(data));
					}
}

				}









				}
				}
			}
			}



			//I do the same if the folder is public

			if(privates == false){


			// Set up an asynchronous AJAX POST request
    			var xhr2a = new XMLHttpRequest();
    			xhr2a.open('POST', chromeSssUrl + "collEntryAdd/", true); //false to make it synchronous
	
			// Set correct header for form data 
			xhr2a.setRequestHeader('Content-type', 'application/json');

			data={
			
			"addNewColl": true,
			"coll": rootCollection,
			"label": "Bookmarks Shared",
			"key": credential,
			"op": "collEntryAdd",
			"user": user,
			};

			// send the collected data as JSON
  			xhr2a.send(JSON.stringify(data));

			xhr2a.onreadystatechange = function () {

				if (xhr2a.readyState == 4) {

					var resp2a = JSON.parse(xhr2a.responseText);
					storageCollection = resp2a.collEntryAdd.entity;


			//I make the collection public


			// Set up an asynchronous AJAX POST request
    			var xhr2b = new XMLHttpRequest();
    			xhr2b.open('POST', chromeSssUrl + "entityPublicSet/", true); //false to make it synchronous
	
			// Set correct header for form data 
			xhr2b.setRequestHeader('Content-type', 'application/json');

			data={
			
			"entity":storageCollection,
			"key": credential,
			"op": "entityPublicSet",
			"user": user,
			};

			// send the collected data as JSON
  			xhr2b.send(JSON.stringify(data));



			
			//Now I publish the URL in the corresponding folder

			// Set up an asynchronous AJAX POST request
    			var xhr3 = new XMLHttpRequest();
    			xhr3.open('POST', chromeSssUrl + "collEntryAdd/", true); //false to make it synchronous
	
			// Set correct header for form data 
			xhr3.setRequestHeader('Content-type', 'application/json');

			data={
			
			"addNewColl": false,
			"coll": storageCollection,
			"entry": tabLink,
			"label": title,
			"key": credential,
			"op": "collEntryAdd",
			"user": user,
			};

			// send the collected data as JSON
  			xhr3.send(JSON.stringify(data));

			xhr3.onreadystatechange = function () {

				if (xhr3.readyState == 4) {

					//And finally I add the tags to the bookmark
					for(j=0;j<tags.length;j++){
if(tags[j].replace(/^\s+|\s+$/g,'').length>0){
					// Set up an asynchronous AJAX POST request
    					var xhr4 = new XMLHttpRequest();
    					xhr4.open('POST', chromeSssUrl + "tagAdd/", true); //false to make it synchronous
	
					// Set correct header for form data 
					xhr4.setRequestHeader('Content-type', 'application/json');

					

						data={
			
						"key": credential,
						"op": "tagAdd",
						"entity": tabLink,
						"space": "privateSpace",
						"label": tags[j].replace(/^\s+|\s+$/g,''),
						"user": user,
						};

						// send the collected data as JSON
  						xhr4.send(JSON.stringify(data));
					}
}


				}


				}
				}
			}
			}


			}

			else{
			//Now I publish the URL in the corresponding folder

			// Set up an asynchronous AJAX POST request
    			var xhr3 = new XMLHttpRequest();
    			xhr3.open('POST', chromeSssUrl + "collEntryAdd/", true); //false to make it synchronous
	
			// Set correct header for form data 
			xhr3.setRequestHeader('Content-type', 'application/json');

			data={
			
			"addNewColl": false,
			"coll": storageCollection,
			"entry": tabLink,
			"label": title,
			"key": credential,
			"op": "collEntryAdd",
			"user": user,
			};

			// send the collected data as JSON
  			xhr3.send(JSON.stringify(data));

			xhr3.onreadystatechange = function () {

				if (xhr3.readyState == 4) {

					//And finally I add the tags to the bookmark
					for(j=0;j<tags.length;j++){
					if(tags[j].replace(/^\s+|\s+$/g,'').length>0){
					// Set up an asynchronous AJAX POST request
    					var xhr4 = new XMLHttpRequest();
    					xhr4.open('POST', chromeSssUrl + "tagAdd/", true); //false to make it synchronous
	
					// Set correct header for form data 
					xhr4.setRequestHeader('Content-type', 'application/json');

					

						data={
			
						"key": credential,
						"op": "tagAdd",
						"entity": tabLink,
						"space": "privateSpace",
						"label": tags[j].replace(/^\s+|\s+$/g,''),
						"user": user,
						};

						// send the collected data as JSON
  						xhr4.send(JSON.stringify(data));
					}
					}


				}
				
			}
		   }
        }      
		}
	};	

      };






document.write('<br><br><b><center>Your bookmark has been saved in the Social Semantic Server</center></b>');
	
	 });
     });
  
}




// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Handle the bookmark form submit event with our addBookmark function
    document.getElementById('addbookmark').addEventListener('submit', addBookmark);
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    // Call the getPageInfo function in the background page, injecting content_script.js 
    // into the current HTML page and passing in our onPageInfo function as the callback
 
 chrome.tabs.getSelected(null,function(tab) {
	
	var tabTitle = tab.title;
	
  document.getElementById('title').value = tabTitle;
	});
	
 
});
