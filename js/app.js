var client;
var $upload_btn = $('#upload-btn');
var $list_item = $('.list-item');

var app = angular.module('app', []);
app.run(function($rootScope, DropboxService) {
  Loading.show();
  DropboxService.setupUI();
  DropboxService.setupDropbox($rootScope);
  Loading.hide();
});

app.controller('ListCtrl', function($scope) {
  $scope.name = "Guest";
  $scope.file_name = "None";
  $scope.list = [];
  $scope.input_text;

  $scope.addItem = function() {
    // Not empty
    if($scope.input_text.length != 0) {
      $scope.list.unshift({name: $scope.input_text});
      $scope.uploadList();
    }
    $scope.input_text = "";
  };

  $scope.clearList = function() {
    $scope.list = [];
  };

  $scope.uploadList = function() {
    var value = "";
    $.each($scope.list, function(index, item) {
      value += item.name + "\n";
    });
    uploadMsgToDropbox($scope.client, value);
  };

  $scope.$on('init', function(event, client) {
    $scope.client = client;
    updateInfo(client);
    downloadMsgFromDropbox(client);
  });


  var downloadMsgFromDropbox = function(client) {
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
          if(line.trim() != "") {
            $scope.list.unshift({name: line});
          }
        });
        $scope.$apply();
      }
    });
  };

  var uploadMsgToDropbox = function(client, value) {
    Loading.show();
    client.writeFile('/msg1.txt', value, 
        function(error, info) {
          Loading.hide();
          Loading.flash("uploaded");
        });
  };

  var updateInfo = function(client) {
    client.getUserInfo(function(error, info) {
      $scope.name = info.name;
      $scope.file_name = "/msg1.txt";
    });
  };

});

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

// end list controller
//
app.factory('DropboxService', function() {

  return {
    setupUI: function() {

      $(document).on('click', '.show-qr', function() {
        var parent = $(this).parent(),
        value = parent.clone().children().remove().end().text();
        make_qr_code(value, function(url) {
          $.fn.SimpleModal({
            title: 'QR CODE',
            contents: '<img class="qr-code" src="'+url+'"/>',
          }).showModal();
          $('#simple-modal').css('top', '50px');
        });
      });

    },

      setupDropbox: function($rootScope) {
        var self = this;
        client = new Dropbox.Client({
          key: "rBn1hErlg2A=|AT99wYOsT1ROW+t9CZRO7fyQ0Gx450jQPbeA/RoMlg==", sandbox: true
        });
        client.authDriver(new Dropbox.Drivers.Redirect({rememberUser: true}));
        client.authenticate({interactive: false}, function(error, client) {
          if (client.isAuthenticated()) { 
            self.start($rootScope, client);
          }
          else { 
            client.authenticate(function(error, client) {
              self.start($rootScope, client);
            });
          }
        });
      },

      start: function($rootScope, client) {
        $rootScope.$broadcast("init", client);
      }
  }

});

var Loading = {
  show: function() {
    $('.loading').fadeIn();
  },
  hide: function() {
    $('.loading').fadeOut();
  },
  flash: function() {
    $('.loading').fadeIn(200).fadeOut(500);
  }
};
