var ec_right2 = echarts.init(document.getElementById("r2"), "dark");
window.addEventListener("resize", () => {
  ec_right2.resize();
});
var ddd = [
  { name: "肺炎", value: "12734670" },
  { name: "实时", value: "12734670" },
  { name: "新型", value: "12734670" },
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
          color: function () {
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
