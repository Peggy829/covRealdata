var ec_right1 = echarts.init(document.getElementById("r1"), "dark");
window.addEventListener("resize", () => {
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
      rotate: 38, //调整数值改变倾斜的幅度（范围-90到90）
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
