var client;
var $upload_btn = $('#upload-btn');
var $list_item = $('.list-item');

(function() {
  setupUI();
  setupDropbox();
})();

function make_list_item(text) {
  var $li   = $('<li></li>', { class: 'list-item', text: text }),
    $button = $('<a href="#my-modal" data-target="#my-modal" data-toggle="modal" class="show-qr btn btn-primary pull-right">QR CODE</a>');
  $button.appendTo($li);
  return $li;
}

function make_qr_code(value, cb) {
  qr.toDataURL(
    {
      level: 'H',
      size: 8,
      value: value
    }, 
    function(error, url) {
      cb.call(this, url);
    }
  );
}

function setupUI() {
  
  $(document).on('click', '.show-qr', function() {
    var parent = $(this).parent(),
        value = parent.clone().children().remove().end().text();
    make_qr_code(value, function(url) {
      $.fn.SimpleModal({
        title: 'QR CODE',
        contents: '<img class="qr-code" src="'+url+'"/>',
      }).showModal();
    });
  });

  $upload_btn.on('click', function() {
    var value = 0;
    uploadMsgToDropbox(client, value);
  });
};

function setupDropbox() {
  client = new Dropbox.Client({
    key: "rBn1hErlg2A=|AT99wYOsT1ROW+t9CZRO7fyQ0Gx450jQPbeA/RoMlg==", sandbox: true
  });
  client.authDriver(new Dropbox.Drivers.Redirect({rememberUser: true}));
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
  downloadMsgFromDropbox(client);
}

function downloadMsgFromDropbox(client) {
  client.readFile("/msg1.txt", function(error, data) {
    if (error && error.response.error == "File has been deleted") {
      // Create new file if no file exist
      uploadMsgToDropbox(client, 'First Use, thanks');
      downloadMsgFromDropbox(client);
    }
    else {
      // Add list item to list
      var lines = data.split('\n');
      $.each(lines, function(index, line) {
        make_list_item(line).appendTo('.list');  
      });
    }
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
    var $db_name = $('#db-name'),
    $db_filename = $('#db-filename');

    $db_name.text( info.name );
    $db_filename.text( "/msg1.txt" );
  });
}


