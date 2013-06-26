var client;
var $upload_btn = $('#upload-btn');
var $file_textarea = $('#file-textarea');

(function() {
  setupUI();
  // setupDropbox();
})();

function setupUI() {
  $upload_btn.on('click', function() {
    var value = $('#file-textarea').val();
    uploadMsgToDropbox(client, value);
  });
};

function setupDropbox() {
  client = new Dropbox.Client({
    key: "rBn1hErlg2A=|AT99wYOsT1ROW+t9CZRO7fyQ0Gx450jQPbeA/RoMlg==", sandbox: true
  });
  client.authDriver(new Dropbox.Drivers.Redirect());
  client.authenticate({interactive: false}, function(error, client) {

    if (client.isAuthenticated()) { 
      start(client);
    }
    else { 
      client.authenticate(function(error, client) {
        start(client);
      });
    }
  });
}

function start(client) {
  updateInfo(client);
  client.readFile("/msg1.txt", function(error, data) {
    var $file_textarea = $('#file-textarea');
    $file_textarea.text(data);
  });
}

function uploadMsgToDropbox(client, value) {
  client.writeFile('/msg1.txt', value, 
    function(error, info) {
      alert('uploaded'); 
  });
}

function updateInfo(client) {
  client.getUserInfo(function(error, info) {
    console.log(info);
    var $db_name = $('#db-name'),
  $db_filename = $('#db-filename');

  $db_name.text( info.name );
  $db_filename.text( "/msg1.txt" );

  });
}


