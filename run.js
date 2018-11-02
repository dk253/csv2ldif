'use strict';

var fs = require('fs'),
  csv = require('csv');

var readCSV = function (path, callback) {
  fs.readFile(path, function (err, content) {
    if (err) {
      callback(new Error('readCSV: Error loading file: ' + path + ' ' + err.message));
    } else {
      csv.parse(content, { columns: true }, function (err, csv) {
        if (err) {
          callback(new Error('readCSV: ' + path + ' ' + err.message));
        } else {
          callback(null, csv);
        }
      });
    }
  });
};

readCSV('ldap-import.csv', function (err, obj) {
  var s = '# Import\n\nversion: 1\n\n';
  var uidn = 1003;

  Object.keys(obj).forEach(p => {
    var person = obj[p];
    s += '# Entry ' + p + '\n';
    Object.keys(person).forEach(key => {
      var attr = person[key].replace('CN', 'cn');
      if (key !== '' && key !== 'structuralobjectclass') {
        if (key === 'objectclass') {
          var ocList = attr.split(' | ');
          for (var o = 0; o < ocList.length; o++) {
            if (ocList[o] !== 'top') s += key + ': ' + ocList[o] + '\n';
          }
        } else {
          s += key + ': ' + attr + '\n';
        }
      }
    });
    s += 'uidnumber: ' + uidn + '\n\n';

    uidn += 1;
  });

  fs.writeFileSync('ldap-import.ldif', s);
});
