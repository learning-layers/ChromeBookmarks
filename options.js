// Saves options to chrome.storage
function save_options() {
  var sssUrl = document.getElementById('sss-url').value;
  var sssUser = document.getElementById('sss-user').value;
  
  if(sssUrl.substring(0,7)==="http://"){
  
  chrome.storage.sync.set({
    chromeSssUrl: sssUrl,
    chromeSssUser: sssUser
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
 
  }
  
  else{
  
  alert("Please, insert a valid HTTP URL.");
  
  }
}

// Restores vales using the preferences stored in chrome.storage.
function restore_options() {
  // Use default values as empty
  chrome.storage.sync.get({
    chromeSssUrl: '',
    chromeSssUser: ''
  }, function(items) {
    document.getElementById('sss-url').value = items.chromeSssUrl;
    document.getElementById('sss-user').value = items.chromeSssUser;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);