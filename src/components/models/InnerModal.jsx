import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, Radio} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class InnerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        price: 4900,
        payTotal: 0,
        payChannel: 0,
        agent: '',
        agentProfit: ''
      },
      agents: [],
    }
  }
  changeAction(fieldname, e) {
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    }, () => {
      if(fieldname === 'agent') {
        let agent = _.find(this.state.agents, {_id: this.state.fields.agent});
        if(agent) {
          this.setState({
            fields: Object.assign({}, this.state.fields, {agentProfit: agent.ratio})
          })
        }
      }
    })
  }
  okAction() {
    if(this.props.id) {
      $.put(`/order/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/order`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }
  }
  detailAction() {
    $.get(`/order/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: res.data
        })
      }
    })
  }

  agentsListAction() {
    $.get('/agents').then(res => {
      if(res.code === 0) {
        this.setState({
          agents: res.data
        })
      }
    })
  }

  componentWillMount() {
    this.agentsListAction();
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    const {Option} = Select;
    return (
      <Modal
        title="订单信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="代理商">
            <Select value={this.state.fields.agent} onChange={(e) => this.changeAction('agent', e)}>
              {
                this.state.agents.map(fruit => <Option value={fruit._id} key={fruit._id} >{fruit.title}</Option>)
              }
            </Select>
          </Item>
          <Item label="价格">
            <Input value={this.state.fields.price} onChange={(e) => this.changeAction('price', e)} style={{width: 250}} suffix="元" />
          </Item>
          <Item label="付款金额">
            <Input value={this.state.fields.payTotal} onChange={(e) => this.changeAction('payTotal', e)} style={{width: 250}} suffix="元" />
          </Item>
          <Item label="分成比例">
            <Input value={this.state.fields.agentProfit} onChange={(e) => this.changeAction('agentProfit', e)} style={{width: 250}} suffix="%" />
          </Item>
          <Item label="付款方式">
            <Select value={this.state.fields.payChannel} onChange={(e) => this.changeAction('payChannel', e)}>
              <Option value={0}>线下</Option>
              <Option value={1}>微信</Option>
              <Option value={2}>支付宝</Option>
            </Select>
          </Item>
        </Form>
      </Modal>
    )
  }
}
