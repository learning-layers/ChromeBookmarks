// Saves options to chrome.storage
function save_options() {
  var sssUrl = document.getElementById('sss-url').value;
  var sssUser = document.getElementById('sss-user').value;
  var sssPassword = document.getElementById('sss-password').value;
  
  if( checkValidUrl(sssUrl) ){
  
  chrome.storage.sync.set({
    chromeSssUrl: sssUrl,
    chromeSssUser: sssUser,
    chromeSssPassword: sssPassword
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
    chromeSssUser: '',
    chromeSssPassword: ''
  }, function(items) {
    document.getElementById('sss-url').value = items.chromeSssUrl;
    document.getElementById('sss-user').value = items.chromeSssUser;
    document.getElementById('sss-password').value = items.chromeSssPassword;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);