Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};
function gettime() {
  $("#tim").html(new Date().format("yyyy-MM-dd hh:mm:ss"));
}

function getNowConfirm() {
  $.ajax({
    url: "/nowConfirm",
    success: function (data) {
      data = JSON.parse(data);
      for(index in data){
        $('.nowConfirmList ol').append("<li><a src='' data-content="+data[index].nowConfirm+">"+data[index].city+"</a></li>")
      }
    },
    error: function (xhr, type, errorThrown) {},
  });
}

function get_c1_data() {
  $.ajax({
    url: "/c1",
    success: function (data) {
      data = JSON.parse(data);
      $(".num h1").eq(0).text(data.confirm);
      $(".num h1").eq(1).text(data.nowConfirm);
      $(".num h1").eq(2).text(data.heal);
      $(".num h1").eq(3).text(data.dead);
    },
    error: function (xhr, type, errorThrown) {},
  });
}
// setInterval(gettime, 1000)
// setInterval(get_c1_data, 1000)
function get_c2_data() {
  $.ajax({
    url: "/c2",
    success: function (data) {
      data = JSON.parse(data);
      ec_center_option.series[0].data = data.data;
      ec_center.setOption(ec_center_option);
    },
    error: function (xhr, type, errorThrown) {},
  });
}
function get_l1_data() {
  $.ajax({
    url: "/l1",
    success: function (data) {
      data = JSON.parse(data);
      ec_left1_Option.xAxis[0].data = data.day;
      ec_left1_Option.series[0].data = data.confirm;
      ec_left1_Option.series[1].data = data.suspect;
      ec_left1_Option.series[2].data = data.heal;
      ec_left1_Option.series[3].data = data.dead;
      ec_left1.setOption(ec_left1_Option);
    },
    error: function (xhr, type, errorThrown) {},
  });
}
function get_l2_data() {
  $.ajax({
    url: "/l2",
    success: function (data) {
      data = JSON.parse(data);
      ec_left2_Option.xAxis[0].data = data.day;
      ec_left2_Option.series[0].data = data.confirm_add;
      ec_left2_Option.series[1].data = data.suspect_add;
      ec_left2.setOption(ec_left2_Option);
    },
    error: function (xhr, type, errorThrown) {},
  });
}

function get_r1_data() {
  $.ajax({
    url: "/r1",
    success: function (data) {
      data = JSON.parse(data);
      ec_right1_option.xAxis.data = data.city;
      ec_right1_option.series[0].data = data.confirm;
      ec_right1.setOption(ec_right1_option);
    },
  });
}
function get_r2_data() {
  $.ajax({
    url: "/r2",
    success: function (data) {
      data = JSON.parse(data);
      ec_right2_option.series[0].data = data.kws;
      ec_right2.setOption(ec_right2_option);
    },
  });
}

gettime();
get_c1_data();
get_c2_data();
get_l1_data();
get_l2_data();
get_r1_data();
get_r2_data();
setInterval(gettime, 1000);
setInterval(get_c1_data, 700000);
setInterval(get_c2_data, 700000);
setInterval(get_l1_data, 700000);
setInterval(get_l2_data, 700000);
setInterval(get_r1_data, 700000);
setInterval(get_r2_data, 10000);
