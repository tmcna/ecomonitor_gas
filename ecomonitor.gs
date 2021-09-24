function doPost(e) {
  var PostData = JSON.parse(e.postData.contents);

  //ecomonitor(PostData.date, PostData.temperature, PostData.humidity, PostData.co2);
  ecomonitor(PostData);
}

// for Test
function test_ecomonitor() {
  //ecomonitor('2021/08/20 15:50:26', 30, 70, 2000);

  const p = {
      "date": '2021/08/20 15:50:26',
      "temperature": 30,
      "humidity": 70,
      "co2": 2000
  };
  console.log(p.date);
  ecomonitor(p);
}

function ecomonitor(p) {
//function ecomonitor(date, temperature, humidity, co2) {
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var sheet    = ss.getSheetByName('monitor');

  sheet.appendRow([p.date, p.temperature, p.humidity, p.co2]);

  if (p.co2 >= 1000) {
    message = Utilities.formatString(
      "こんにちは！安全衛生委員です。\nなんと！お部屋のCO2濃度が %s ppm になっちゃってます。ちょーまずい！激ヤバです！\n1000ppmを超えないようこまめに換気しましょうね！\n現在の気温は %s ℃、湿度は %s % です。",
      p.co2,
      p.temperature,
      p.humidity
    );
    notify(message)
  }
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