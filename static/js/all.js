"use strict";

Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1,
    //月份
    "d+": this.getDate(),
    //日
    "h+": this.getHours(),
    //小时
    "m+": this.getMinutes(),
    //分
    "s+": this.getSeconds(),
    //秒
    "q+": Math.floor((this.getMonth() + 3) / 3),
    //季度
    S: this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  }

  return fmt;
};

function gettime() {
  $("#tim").html(new Date().format("yyyy-MM-dd hh:mm:ss"));
}

function getNowConfirm() {
  $.ajax({
    url: "/nowConfirm",
    success: function success(data) {
      data = JSON.parse(data);

      for (var i = 0; i < data.length; i++) {
        $(".nowConfirmList ol").append(
          "<li><a src='' data-content=" +
            data[i].nowConfirm +
            ">" +
            data[i].city +
            "</a></li>"
        );
      }
    },
    error: function error(xhr, type, errorThrown) {},
  });
}

function get_c1_data() {
  $.ajax({
    url: "/c1",
    success: function success(data) {
      data = JSON.parse(data);
      $(".num h1").eq(0).text(data.confirm);
      $(".num h1").eq(1).text(data.nowConfirm);
      $(".num h1").eq(2).text(data.heal);
      $(".num h1").eq(3).text(data.dead);
    },
    error: function error(xhr, type, errorThrown) {},
  });
} // setInterval(gettime, 1000)
// setInterval(get_c1_data, 1000)

function get_c2_data() {
  $.ajax({
    url: "/c2",
    success: function success(data) {
      data = JSON.parse(data);
      ec_center_option.series[0].data = data.data;
      ec_center.setOption(ec_center_option);
    },
    error: function error(xhr, type, errorThrown) {},
  });
}

function get_l1_data() {
  $.ajax({
    url: "/l1",
    success: function success(data) {
      data = JSON.parse(data);
      ec_left1_Option.xAxis[0].data = data.day;
      ec_left1_Option.series[0].data = data.confirm;
      ec_left1_Option.series[1].data = data.suspect;
      ec_left1_Option.series[2].data = data.heal;
      ec_left1_Option.series[3].data = data.dead;
      ec_left1.setOption(ec_left1_Option);
    },
    error: function error(xhr, type, errorThrown) {},
  });
}

function get_l2_data() {
  $.ajax({
    url: "/l2",
    success: function success(data) {
      data = JSON.parse(data);
      ec_left2_Option.xAxis[0].data = data.day;
      ec_left2_Option.series[0].data = data.confirm_add;
      ec_left2_Option.series[1].data = data.suspect_add;
      ec_left2.setOption(ec_left2_Option);
    },
    error: function error(xhr, type, errorThrown) {},
  });
}

function get_r1_data() {
  $.ajax({
    url: "/r1",
    success: function success(data) {
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
    success: function success(data) {
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
setInterval(get_c1_data, 600000);
setInterval(get_c2_data, 600000);
setInterval(get_l1_data, 600000);
setInterval(get_l2_data, 600000);
setInterval(get_r1_data, 600000);
setInterval(get_r2_data, 10000);
var ec_center = echarts.init(document.getElementById("c2"), "dark");
window.addEventListener("resize", function () {
  ec_center.resize();
});
var mydata = [
  {
    name: "上海",
    value: 318,
  },
  {
    name: "云南",
    value: 162,
  },
];
var ec_center_option = {
  title: {
    text: "",
    subtext: "",
    x: "left",
  },
  tooltip: {
    trigger: "item",
    triggerOn:"mousemove|click"
  },
  grid: {
    top: 0,
  },
  //左侧小导航图标
  visualMap: {
    show: true,
    x: "left",
    y: "bottom",
    itemWidth: (e / 1082) * 10,
    //图形的宽度，即长条的宽度。
    itemHeight: (e / 1082) * 10,
    textStyle: {
      fontSize: (e / 1082) * 10, //更改坐标轴文字大小
    },
    splitList: [
      {
        start: 1,
        end: 9,
      },
      {
        start: 10,
        end: 99,
      },
      {
        start: 100,
        end: 999,
      },
      {
        start: 1000,
        end: 9999,
      },
      {
        start: 10000,
      },
    ],
    color: ["#8A3310", "#C64918", "#E55B25", "#F2AD92", "#F9DCD1"],
  },
  //配置属性
  series: [
    {
      name: "累计确诊人数",
      type: "map",
      mapType: "china",
      roam: false,
      //拖动和缩放
      itemStyle: {
        normal: {
          borderWidth: 0.5,
          //区域边框宽度
          borderColor: "#009fe8",
          //区域边框颜色
          areaColor: "#ffefd5", //区域颜色
        },
        emphasis: {
          //鼠标滑过地图高亮的相关设置
          borderWidth: 0.5,
          borderColor: "#4b0082",
          areaColor: "#fff",
        },
      },
      label: {
        normal: {
          show: true,
          //省份名称
          fontSize: (e / 1082) * 10,
        },
        emphasis: {
          show: true,
          fontSize: (e / 1082) * 10,
        },
      },
      data: [], //mydata //数据
    },
  ],
};
ec_center.setOption(ec_center_option);
var ec_left1 = echarts.init(document.getElementById("l1"), "dark");
window.addEventListener("resize", function () {
  ec_left1.resize();
});
var ec_left1_Option = {
  //标题样式
  title: {
    text: "全国累计趋势",
    textStyle: {
      fontSize: (e / 1082) * 14,
    },
    left: "left",
  },
  tooltip: {
    trigger: "axis",
    //指示器
    axisPointer: {
      type: "line",
      lineStyle: {
        color: "#7171C6",
      },
    },
  },
  legend: {
    data: ["累计确诊", "现有疑似", "累计治愈", "累计死亡"],
    left: "right",
    top: "10%",
    textStyle: {
      //图例文字的样式
      fontSize: (e / 1082) * 12,
    },
  },
  //图形位置
  grid: {
    left: "4%",
    right: "6%",
    bottom: "4%",
    top: 60,
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      //x轴坐标点开始与结束点位置都不在最边缘
      // boundaryGap : true,
      data: [], //['01.20', '01.21', '01.22']
    },
  ],
  yAxis: [
    {
      type: "value",
      //y轴字体设置
      axisLabel: {
        show: true,
        color: "white",
        fontSize: 12,
        formatter: function formatter(value) {
          if (value >= 1000) {
            value = value / 1000 + "k";
          }

          return value;
        },
      },
      //y轴线设置显示
      axisLine: {
        show: true,
      },
      //与x轴平行的线样式
      splitLine: {
        show: true,
        lineStyle: {
          color: "#17273B",
          width: 1,
          type: "solid",
        },
      },
    },
  ],
  series: [
    {
      name: "累计确诊",
      type: "line",
      smooth: true,
      data: [], //[260, 406, 529]
    },
    {
      name: "现有疑似",
      type: "line",
      smooth: true,
      data: [], //[54, 37, 3935]
    },
    {
      name: "累计治愈",
      type: "line",
      smooth: true,
      data: [], //[25, 25, 25]
    },
    {
      name: "累计死亡",
      type: "line",
      smooth: true,
      data: [], //[6, 9, 17]
    },
  ],
};
ec_left1.setOption(ec_left1_Option);
var ec_left2 = echarts.init(document.getElementById("l2"), "dark");
window.addEventListener("resize", function () {
  ec_left2.resize();
});
var ec_left2_Option = {
  tooltip: {
    trigger: "axis",
    //指示器
    axisPointer: {
      type: "line",
      lineStyle: {
        color: "#7171C6",
      },
    },
  },
  legend: {
    data: ["新增确诊", "新增疑似"],
    left: "right",
    textStyle: {
      fontSize: (e / 1082) * 12,
    },
    top: "10%",
  },
  //标题样式
  title: {
    text: "全国新增趋势",
    textStyle: {
      fontSize: (e / 1082) * 14,
    },
    left: "left",
  },
  //图形位置
  grid: {
    left: "4%",
    right: "6%",
    bottom: "4%",
    top: 50,
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      //x轴坐标点开始与结束点位置都不在最边缘
      // boundaryGap : true,
      data: [],
    },
  ],
  yAxis: [
    {
      type: "value",
      //y轴字体设置
      //y轴线设置显示
      axisLine: {
        show: true,
      },
      axisLabel: {
        show: true,
        color: "white",
        fontSize: 12,
        formatter: function formatter(value) {
          if (value >= 1000) {
            value = value / 1000 + "k";
          }

          return value;
        },
      },
      //与x轴平行的线样式
      splitLine: {
        show: true,
        lineStyle: {
          color: "#17273B",
          width: 1,
          type: "solid",
        },
      },
    },
  ],
  series: [
    {
      name: "新增确诊",
      type: "line",
      smooth: true,
      data: [],
    },
    {
      name: "新增疑似",
      type: "line",
      smooth: true,
      data: [],
    },
  ],
};
ec_left2.setOption(ec_left2_Option);
var ec_right1 = echarts.init(document.getElementById("r1"), "dark");
window.addEventListener("resize", function () {
  ec_right1.resize();
});
var ec_right1_option = {
  //标题样式
  title: {
    text: "非湖北地区城市确诊TOP5",
    textStyle: {
      fontSize: (e / 1082) * 14,
    },
    left: "left",
  },
  color: ["#3398DB"],
  tooltip: {
    trigger: "axis",
    axisPointer: {
      // 坐标轴指示器，坐标轴触发有效
      type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
    },
  },
  xAxis: {
    type: "category",
    data: [],
    axisLabel: {
      //   interval: 0, //坐标刻度之间的显示间隔，默认就可以了（默认是不重叠）
      rotate: 38,
      //调整数值改变倾斜的幅度（范围-90到90）
      textStyle: {
        fontSize: (e / 1082) * 10, //更改坐标轴文字大小
      },
    },
  },
  yAxis: {
    type: "value",
  },
  grid: {
    left: "20%",
    top: "15%",
    bottom: "15%",
  },
  series: [
    {
      data: [],
      type: "bar",
    },
  ],
};
ec_right1.setOption(ec_right1_option);
var ec_right2 = echarts.init(document.getElementById("r2"), "dark");
window.addEventListener("resize", function () {
  ec_right2.resize();
});
var ddd = [
  {
    name: "肺炎",
    value: "12734670",
  },
  {
    name: "实时",
    value: "12734670",
  },
  {
    name: "新型",
    value: "12734670",
  },
];
var ec_right2_option = {
  // backgroundColor: '#515151',
  title: {
    text: "今日疫情热搜",
    textStyle: {
      fontSize: (e / 1082) * 14,
    },
    left: "left",
  },
  tooltip: {
    show: false,
  },
  series: [
    {
      type: "wordCloud",
      // drawOutOfBound:true,
      gridSize: 1,
      sizeRange: [12, 55],
      rotationRange: [-45, 0, 45, 90],
      // maskImage: maskImage,
      // 添加随机色
      textStyle: {
        fontSize: (e / 1082) * 14,
        normal: {
          color: function color() {
            return (
              "rgb(" +
              Math.round(Math.random() * 255) +
              ", " +
              Math.round(Math.random() * 255) +
              ", " +
              Math.round(Math.random() * 255) +
              ")"
            );
          },
        },
      },
      right: null,
      bottom: null,
      data: [],
    },
  ],
};
ec_right2.setOption(ec_right2_option);
