function doPost(e) {
  var p = JSON.parse(e.postData.contents);

  ecomonitor(p);
}

// for Test
function test_ecomonitor() {

  const p = {
      "date": '2021/08/20 15:50:26',
      "temperature": 30,
      "humidity": 70,
      "co2": 500
  };
  console.log(p.date);
  ecomonitor(p);
}

function ecomonitor(p) {
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var sheet    = ss.getSheetByName('monitor');

  sheet.appendRow([p.date, p.temperature, p.humidity, p.co2]);

  notify(p)
}

function notify(p) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Settings');
  var topicURL = sheet.getRange("B2").getValue();
  var token = sheet.getRange("B3").getValue();
  var mention = sheet.getRange("B4").getValue();
  var sendMessage = sheet.getRange("B5").getValue();
  var co2_max = sheet.getRange("B6").getValue();
  var co2_min = sheet.getRange("B7").getValue();
  var last_co2 = sheet.getRange("B8").getValue();
  var message = null;

  if (sendMessage !== 'Yes') {
    return;
  }

  if (p.co2 >= co2_max && last_co2 < co2_max) {
    // CO2濃度が上限を超え、前回のCO2濃度が上限を超えていなかった場合にメッセージを通知する
    message = Utilities.formatString(
      "こんにちは！安全衛生委員です。\nなんと！お部屋のCO2濃度が %s ppm になっちゃってます。ちょーまずい！激ヤバです！\n適正なCO2濃度の目安は1000ppm以下みたいなので、こまめに換気しましょうね！\n現在の気温は %s ℃、湿度は %s % です。",
      p.co2,
      p.temperature,
      p.humidity
    );
  }

  if (p.co2 <= co2_min && last_co2 > co2_min) {
    // CO2濃度が下限を下回り、前回のCO2濃度が下限を超えていた場合にメッセージを通知する
    message = Utilities.formatString(
      "こんにちは！安全衛生委員です。\nわーい！お部屋のCO2濃度が %s ppm に戻ったみたいです。よかったですね！\n適正なCO2濃度の目安は1000ppm以下みたいなので、これからもこまめな換気を心がけてくださいね！\n現在の気温は %s ℃、湿度は %s % です。",
      p.co2,
      p.temperature,
      p.humidity
    );
  }

  sheet.getRange("B8").setValue(p.co2);

  if (message) {
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
}