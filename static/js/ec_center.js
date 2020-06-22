var ec_center = echarts.init(document.getElementById("c2"), "dark");
window.addEventListener("resize", () => {
	ec_center.resize();
  });
var mydata = [
  { name: "上海", value: 318 },
  { name: "云南", value: 162 },
];

var ec_center_option = {
  title: {
    text: "",
    subtext: "",
    x: "left",
  },
  tooltip: {
    trigger: "item",
  },
  grid: {
    top: 0,
  },
  //左侧小导航图标
  visualMap: {
    show: true,
    x: "left",
    y: "bottom",
    itemWidth: (e / 1082) * 10, //图形的宽度，即长条的宽度。
    itemHeight: (e / 1082) * 10,
    textStyle: {
      fontSize: (e / 1082) * 10, //更改坐标轴文字大小
    },
    splitList: [
      { start: 1, end: 9 },
      { start: 10, end: 99 },
      { start: 100, end: 999 },
      { start: 1000, end: 9999 },
      { start: 10000 },
    ],
    color: ["#8A3310", "#C64918", "#E55B25", "#F2AD92", "#F9DCD1"],
  },
  //配置属性
  series: [
    {
      name: "累计确诊人数",
      type: "map",
      mapType: "china",
      roam: false, //拖动和缩放
      itemStyle: {
        normal: {
          borderWidth: 0.5, //区域边框宽度
          borderColor: "#009fe8", //区域边框颜色
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
          show: true, //省份名称
          fontSize: (e / 1082) * 10,
        },
        emphasis: {
          show: true,
          fontSize: (e / 1082) * 10 ,
        },
      },
      data: [], //mydata //数据
    },
  ],
};
ec_center.setOption(ec_center_option);
