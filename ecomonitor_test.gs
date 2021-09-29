function testEcomonitor() {

  const p = {
      "date": '2021/08/20 15:50:26',
      "temperature": 30,
      "humidity": 70,
      "co2": 1200
  };
  console.log(p.date);
  ecomonitor(p);
}

function testConfig() {
  let conf = new Config();
  console.log(conf.getParam('topic_url'));
  console.log(conf.getParam('token'));
  console.log(conf.getParam('mention'));
  console.log(conf.getParam('send_message'));
  console.log(conf.getParam('co2_max'));
  console.log(conf.getParam('co2_min'));
  console.log(conf.getParam('last_co2'));

  conf.setParam('last_co2', 600);
}
