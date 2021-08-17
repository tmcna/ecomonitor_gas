function doPost(e) {
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var sheet    = ss.getSheetByName('monitor');
  var PostData = JSON.parse(e.postData.contents);
  var co2      = 400;

  sheet.appendRow([PostData.date, PostData.temperature, PostData.humidity, co2]);

  message = Utilities.formatString("部屋の気温が %s 度、湿度が %s %となっています。温度調節をしましょう。", PostData.temperature, PostData.humidity);
  notify(message)
}

function notify(message) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Settings');
  var topicURL = sheet.getRange("B2").getValue();
  var token = sheet.getRange("B3").getValue();
  var mention = sheet.getRange("B4").getValue();
  var sendMessage = sheet.getRange("B5").getValue();

  if (sendMessage !== 'Yes') {
    return
  }

  var data = {
    'message' : mention + ' ' + message
  };
  var options = {
    'method'     : 'post',
    'contentType': 'application/x-www-form-urlencoded',
    'payload'    : data
  };
  var url = topicURL + '?typetalkToken=' + token;
  var res = UrlFetchApp.fetch(url, options);
}