import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, InputNumber, Radio} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class OuterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        fruit: props.fruit ? props.fruit : '',
        count: 0,
        price: 0,
        payStatu: 1,
        pusher: '',
        outerUnit: '',
        outerCount: null,
        payNumber: 0,
        avgPrice: 0,
        reserve: 0,
      },
      maxCount: 0,
      pushers: [],
      fruits: [],
      payStatus: [{
        id: 1,
        title: '未付款'
      }, {
        id: 2,
        title: '已付款'
      }]
    }
  }
  changeAction(fieldname, e) {
    if(!e) return;
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    }, () => {
      if(fieldname === 'fruit') {
        const fruit = _.find(this.state.fruits, {_id: this.state.fields.fruit});
        this.setState({
          fields: Object.assign({}, this.state.fields, {avgPrice: fruit.avgPrice})
        })
      }
    })
  }
  okAction() {
    const valid = this.validAction();
    if(!valid) {
      return;
    }
    if(this.props.id) {
      $.put(`/outer/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/outer`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }
  }

  validAction() {
    const findFruit = _.find(this.state.fruits, v => v._id === this.state.fields.fruit);
    console.log(findFruit)
    if(findFruit) {
      if(findFruit.total < this.state.fields.count) {
        message.error('超出库存限制!')
        return false;
      }
    }
    return true;
  }

  detailAction() {
    $.get(`/outer/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: res.data
        })
      }
    })
  }

  pushersListAction() {
    $.get('/pushers').then(res => {
      if(res.code === 0) {
        this.setState({
          pushers: res.data
        })
      }
    })
  }

  fruitsListAction() {
    $.get('/fruits').then(res => {
      if(res.code === 0) {
        this.setState({
          fruits: res.data
        })
      }
    })
  }

  fruitCountAction(e) {
    $.get(`/count/${e}`).then(res => {
      if(res.code === 0 && res.data && res.data.total) {
        this.setState({
          maxCount: res.data.total
        })
      }
    })
  }

  componentWillMount() {
    this.pushersListAction();
    this.fruitsListAction();
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    const {Option} = Select;
    const isEdit = !!this.props.id;
    const fruit = this.state.fruits.filter(v => v._id === this.state.fields.fruit);
    return (
      <Modal
        title="出库信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="水果名称">
            <Select disabled={isEdit} value={this.state.fields.fruit} onChange={(e) => {this.changeAction('fruit', e); this.fruitCountAction(e)}}>
              {
                this.state.fruits.map(fruit => <Option value={fruit._id} key={fruit._id} >{fruit.title}</Option>)
              }
            </Select>
          </Item>
          <Item label="下单数量">
            <Input value={this.state.fields.reserve} onChange={(e) => {this.changeAction('reserve', e)}} style={{width: 250}} suffix="斤" />
          </Item>
          <Item label="出库数量">
            <Input disabled={isEdit} value={this.state.fields.count} max={fruit.length && fruit[0].total} onChange={(e) => {this.changeAction('count', e)}} style={{width: 250}} suffix="斤" />
            <span className="ant-form-text">(库存数量: {fruit.length && fruit[0].total})</span>
          </Item>
          <Item label="打包数量">
            <Input style={{width: 100}} placeholder="数量" disabled={isEdit} value={this.state.fields.outerCount} onChange={(e) => {this.changeAction('outerCount', e)}} />
            <Select style={{width: 80, marginLeft: 10}} placeholder="单位" value={this.state.fields.outerUnit} onChange={(e) => this.changeAction('outerUnit', e)}>
              <Option value={2}>箱</Option>
              <Option value={1}>斤</Option>
              <Option value={3}>个</Option>
            </Select>
          </Item>
          <Item label="单价">
            <Input prefix="￥" suffix="元" style={{width: 250}} value={this.state.fields.price} onChange={(e) => this.changeAction('price', e)} />
            <span className="ant-form-text">(成本均价: {this.state.fields.avgPrice})</span>
        </Item>
          <Item label="出货方">
            <Select value={this.state.fields.pusher} onChange={(e) => this.changeAction('pusher', e)}>
              {
                this.state.pushers.map(pusher => <Option value={pusher._id} key={pusher._id} >{pusher.title}</Option>)
              }
            </Select>
          </Item>
          <Item label="是否付款">
            <Radio.Group
              value={this.state.fields.payStatu}
              onChange={(e) => this.changeAction('payStatu', e.target.value)}
              options={[{label: '未付款', value: 1}, {label: '已付款', value: 2}]}
            />
          </Item>
          <Item label="已付款数量">
            <Input disabled={this.state.fields.payStatu === 2} value={this.state.fields.payStatu === 2 ? this.state.fields.price * this.state.fields.count : this.state.fields.payNumber} style={{width: 250}} onChange={(e) => this.changeAction('payNumber', e)} prefix="￥" suffix="元" /> (应付金额: ￥{this.state.fields.price * this.state.fields.count})
          </Item>
        </Form>
      </Modal>
    )
  }
}
