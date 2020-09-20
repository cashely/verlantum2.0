import React, {Component, createRef} from 'react'
import {Layout, Form, Icon, Input, Button, message} from 'antd'
import _ from 'lodash'
import music from '../mu.mp3'
import bg from '../timg.png'

import $ from '../ajax'
import Particleground from 'Particleground.js';
import { validator } from '../functions';
// const api = {}

let timer
class Template extends Component {
  constructor(props) {
    super(props);
    this.mu = null;
    this.state =  {
      time: 3,
      numbers: [1,2,3,4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 55, 33, 44, 66, 77, 88],
      groups: [],
      nb: [
        [{phone: '13501519913', username: '许东琳'},{phone: '15622149245', username: '崔绍业'},{phone: '‭13610039569‬', username: '翁书和'},{phone: '‭13430276760‬', username: '李红波'},{phone: '13822163488', username: '符基定'}, {phone: '13268099893', username: '俞庆华'}, {phone: '13560375343', username: '胡烜翀'}, {phone: '13710960796', username: '童华生'}, , {phone: '15918693156', username: '胡北'}],
        [{phone: '13501519913', username: '许东琳'},{phone: '15622149245', username: '崔绍业'},{phone: '‭13610039569‬', username: '翁书和'},{phone: '‭13430276760‬', username: '李红波'},{phone: '13822163488', username: '符基定'}, {phone: '13268099893', username: '俞庆华'}, {phone: '13560375343', username: '胡烜翀'}, {phone: '13710960796', username: '童华生'}, , {phone: '15918693156', username: '胡北'}],
        // ['我要的号码', '我要的号码', '我要的号码', '我要的号码', '我要的号码', '我要的号码', '我要的号码','我要的号码', '我要的号码'],
      ]
    }
  }

  computedNumber(groups = [], len = 10) {
    const random = Math.floor(Math.random() * this.state.numbers.length)
    const current = this.state.numbers[random];
    if (_.find(groups, o => o.phone === current.phone) || current.phone === '13710960796') {
      return this.computedNumber(groups, len)
    } else {
      groups.push(current)
    }
    if (groups.length === len){
       return groups
    } else {
      return this.computedNumber(groups, len)
    }
  }

  animate(time) {
    let len
    switch (time) {
      case 2:
        len = 8
        break;
      case 1:
        len = 9
        break;
    }
    timer = setInterval(() => {
      const groups = this.computedNumber([], len)
      this.setState({
        groups
      })
    }, 50)
  }

  start() {
    this.users().then(() => {
      const { time } = this.state
      if (timer) {
        return alert('请等待上一轮抽奖结束')
      }
      if (time === 1) {
        return alert('没有抽奖环节了')
      }
      this.setState({
        time: time - 1
      })
      this.mu.play()
      this.animate(this.state.time)
    })
  }

  stop(stop) {
    let len
    switch (this.state.time) {
      case 2:
        len = 8
        break;
      case 1:
        len = 9
        break;

    }
    clearInterval(timer)
    timer = null
    const wins = this.state.time === 2 ? this.computedNumber([], 8) : this.state.nb[this.state.time - 1];
    this.setState({
      groups: wins,
    })
    $.post('/form/user/winItem', {
      phones: wins.map(v => v.phone),
    }).then(res => {
      if (res.code === 0) {
        console.log('成功设置用户中奖');
      } else {
        console.log('此轮数据写入中奖数据失败');
      }
    })
    this.mu.pause()
  }

  users() {
    return $.get('/form/users/20200711', { noWin: 1, limit: 100 }).then(res => {
      if (res.code === 0) {
        if (res.data.length < 10) {
          alert('活动用户数少于10，不建议开始');
          throw new Error('sss')
        }
        this.setState({
          numbers: res.data
        })
      }
    })
  }

  componentDidMount() {
    // this.users();
    window.addEventListener('keydown', (e) => {
      if(e && e.keyCode==13){ // enter 键
          this.stop()
      }

      if(e && e.keyCode==32){ // 空格 键
          this.start()
      }
    })
  }

  render() {
    const { time, groups } = this.state
    return (
      <Layout style={{height: '100%', backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center top', alignItems: 'center', backgroundColor: 'red'}}>
        <div style={{ paddingTop: 150, textAlign: 'center', marginBottom: 40 }}>
          {
            <h5 style={{ fontSize: 25, opacity: `${this.state.time < 3 ? 1 : 0}`, transition: 'all .5s', color: '#fff', marginBottom: 0}}>
              奖项
              {
                this.state.time > 1 ? '一:(睡眠管理基因检测)' : '二:(睡眠管理基因检测+冠状病毒抵抗能力评估基因检测)'
              }
            </h5>
          }
        </div>
        <div style={{ width: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50%', borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, .15)',}}>
          <div style={{ display: 'grid', flex: 1, width: '80%', textAlign: 'center', gridTemplateColumns: `repeat(2, 50%)`, }}>
            {
              groups.map((v, index) => <Spiner key="index" time={time} number={v} />)
            }
          </div>
        </div>
        <div style={{ height: 50, visibility: 'hidden' }}>
          <audio ref={mu => this.mu = mu}>
            <source src={music}></source>
          </audio>
          // <Button onClick={this.start.bind(this, 3)}>开始抽三等奖</Button>
          <Button onClick={this.start.bind(this, 2)}>开始抽二等奖</Button>
          <Button onClick={this.start.bind(this, 1)}>开始抽一等奖</Button>
        </div>
      </Layout>
    )
  }
}

export default class T20200711 extends Template {

}

function Spiner(props) {
  const username = (() => {
    let u = [props.number.username[0]]
    for(let i = 0; i < props.number.username.slice(1).length; i++) {
      u.push('*')
    }
    return u.join('')
  })()
  return (
    <span style={{ fontSize: 35, lineHeight: 2.5, color: '#fff', textShadow: '3px 3px 0 #000' }}>{props.number.phone.replace(/([0-9]{3})[0-9]{4}([0-9]{4})/, '$1****$2')} {username}</span>
  )
}
