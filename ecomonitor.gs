function doPost(e) {
  var p = JSON.parse(e.postData.contents);

  ecomonitor(p);
}

function ecomonitor(p) {

  let conf  = new Config();
  let ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('monitor');

  sheet.appendRow([p.date, p.temperature, p.humidity, p.co2]);

  notifyTypetalk(conf, p)
}

function notifyTypetalk(conf, p) {

  let topicURL = conf.getParam('topic_url');
  let token = conf.getParam('token');
  let mention = conf.getParam('mention');
  let sendMessage = conf.getParam('send_message');
  let co2_max = conf.getParam('co2_max');
  let co2_min = conf.getParam('co2_min');
  let last_co2 = conf.getParam('last_co2');

  let message = null;

  if (sendMessage !== 'Yes') {
    return;
  }

  if (p.co2 >= co2_max && last_co2 < co2_max) {
    // CO2濃度が上限を超え、前回のCO2濃度が上限を超えていなかった場合にメッセージを通知する
    message = Utilities.formatString(
      "こんにちは！安全衛生委員です。\n" + 
      "なんと！お部屋のCO2濃度が %s ppm になっちゃってます。ちょーまずい！激ヤバです！\n" + 
      "適正なCO2濃度の目安は1000ppm以下みたいなので、こまめに換気しましょうね！\n" +
      "現在の気温は %s ℃、湿度は %s % です。",
      p.co2,
      p.temperature,
      p.humidity
    );
  }

  if (p.co2 <= co2_min && last_co2 > co2_min) {
    // CO2濃度が下限を下回り、前回のCO2濃度が下限を超えていた場合にメッセージを通知する
    message = Utilities.formatString(
      "こんにちは！安全衛生委員です。\nわーい、お部屋のCO2濃度が %s ppm に戻ったみたいですよ。よかったですね！\n" +
      "適正なCO2濃度の目安は1000ppm以下だそうです。これからもこまめな換気を心がけてくださいね！\n" +
      "現在の気温は %s ℃、湿度は %s % です。",
      p.co2,
      p.temperature,
      p.humidity
    );
  }

  conf.setParam('last_co2', p.co2);

  if (message) {
    let data = {
      'message' : mention + ' ' + message
    };
    let options = {
      'method'     : 'post',
      'contentType': 'application/x-www-form-urlencoded',
      'payload'    : data
    };
    let url = topicURL + '?typetalkToken=' + token;
    const result = UrlFetchApp.fetch(url, options);
    if(result.getResponseCode() !== 200) {
      throw new Error(result.getContentText());
    }
  }
}

class Config {
  constructor() {
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = ss.getSheetByName('Settings');
    this.colno_key   = 1;
    this.colno_value = 2;
    this.rowno = 2
  }

  getParam(key) {
    let value = ''
    for (let i = this.rowno; i <= this.sheet.getLastRow(); i++) {
      if (key == this.sheet.getRange(i, this.colno_key).getValue()) {
        value = this.sheet.getRange(i, this.colno_value).getValue();
        break;
      }
    }
    return value;
  }

  setParam(key, value) {
    for (let i = this.rowno; i <= this.sheet.getLastRow(); i++) {
      if (key == this.sheet.getRange(i, this.colno_key).getValue()) {
        value = this.sheet.getRange(i, this.colno_value).setValue(value);
        break;
      }
    }
  }
}