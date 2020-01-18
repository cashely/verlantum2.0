import React from 'react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';

export default class Chart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {



    const options = {
      tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
          orient: 'vertical',
          right: 10,
          data: this.props.dataSource.map(fruit => fruit.title),
          selected: (() => {
            let _s = {};
            this.props.dataSource.map(fruit => {
              _s[fruit.title] = fruit.total > 0
            });
            return _s;
          })(),
      },
      series : [
          {
              name: '数量',
              type: 'pie',
              radius : '55%',
              center: ['30%', '60%'],
              data: this.props.dataSource.map(fruit => ({value: fruit.total , name: fruit.title})),
              itemStyle: {
                  emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              }
          }
      ]
    }
    return (
      <ReactEcharts style={{height: 302}} option={options}/>
    )
  }
}
