import React from 'react';
import ReactEcharts from 'echarts-for-react'
import _ from 'lodash';
import moment from 'moment';

export default class Chart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {dataSource} = this.props;
    console.log(dataSource, '12121')
    let groupDataByFruits = _.groupBy(dataSource, item => {
      return item.fruit._id;
    })
    console.log(groupDataByFruits, '12121')
    Object.keys(groupDataByFruits).map(key => {
      groupDataByFruits[key] = _.groupBy(groupDataByFruits[key], item => moment(item.createdAt).format('YYYY-MM-DD'))
    })
    console.log(groupDataByFruits, '12121')
    const options = {
      // xAxis:{
      //     type:'value',
      //     splitNumber:24
      // },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
          // orient: 'vertical',
          right: 10,
          type: 'scroll'
      },
      // series:[
      //   Object.keys(groupDataByFruits).map(key => ({
      //     name: key,
      //     type: 'line',
      //     data: Object.keys(groupDataByFruits[key]).map(key => ([key, 100]))
      //   }))
      // ]
      xAxis: {
        type:'time',
      },
      yAxis: {
          type: 'value',
          scale: false
      },
      series:
          Object.keys(groupDataByFruits).map(key => ({
            name: _.find(this.props.fruits, {_id: key}) ? _.find(this.props.fruits, {_id: key}).title : '',
            type: 'line',
            data: Object.keys(groupDataByFruits[key]).map(timeKey => ([timeKey, _.sumBy(groupDataByFruits[key][timeKey], 'count')]))
          }))
    }
    console.log(options, 'options')
    return (
      <ReactEcharts style={{height: 302}} option={options}/>
      // <div>12121</div>
    )
  }
}
