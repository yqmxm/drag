let sortDebounceTimer = null; // 拖拽排序防抖
let analysisDebounceTimer = null; // 分析接口防抖

Page({
  data: {
    funds: [
      { name: '基金A', ratio: 30 },
      { name: '基金B', ratio: 50 },
      { name: '基金C', ratio: 20 },
    ],
    analysisLoading: false,
    analysisResult: '',
  },

  onLoad: function () {
    this.setData({
      funds: this.data.funds.map(fund => ({
        ...fund,
        background: this.getBackgroundColor(fund.ratio),
      })),
    });
  },

  getBackgroundColor: function (ratio) {
    const startColor = { r: 255, g: 238, b: 238 }; // #FFEEEE
    const endColor = { r: 238, g: 255, b: 238 }; // #EEFFEE
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * (ratio / 100));
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * (ratio / 100));
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * (ratio / 100));
    return `rgb(${r}, ${g}, ${b})`;
  },

  // 伪接口
  getAIAnalysis(funds) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(`${funds.length}只基金中，${funds[0].name}占比过高需注意分散风险`), 500)
    })
  },

  onSort: function (e) {
    // 拖拽排序防抖
    if (sortDebounceTimer) clearTimeout(sortDebounceTimer);
    sortDebounceTimer = setTimeout(() => {
      const { current, previous } = e.detail;
      const funds = this.data.funds;
      const movedFund = funds.splice(previous, 1)[0];
      funds.splice(current, 0, movedFund);

      // 拖拽动画
      const selector = `.fund-card[data-index="${current}"]`;
      this.animate(
        selector,
        [
          { scale: [1, 1], offset: 0 },
          { scale: [1.05, 1.05], offset: 0.5 },
          { scale: [1, 1], offset: 1 }
        ],
        300,
        () => {
          this.setData({
            funds: funds.map(fund => ({
              ...fund,
              background: this.getBackgroundColor(fund.ratio),
            })),
          });
          this.triggerEvent('onSort', funds);

          // 拖拽结束后2秒防抖分析
          if (analysisDebounceTimer) clearTimeout(analysisDebounceTimer);
          this.setData({ analysisLoading: true, analysisResult: '' });
          analysisDebounceTimer = setTimeout(() => {
            this.getAIAnalysis(this.data.funds)
              .then(res => {
                this.setData({
                  analysisResult: res,
                  analysisLoading: false
                });
              })
              .catch(() => {
                this.setData({
                  analysisResult: '分析失败，请重试',
                  analysisLoading: false
                });
              });
          }, 2000); // 2秒无操作后自动分析
        }
      );
    }, 200); // 拖拽排序防抖
  },
});