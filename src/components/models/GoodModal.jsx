import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, Radio} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class GoodModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: '',
        price: 0,
        discount: '',
        number: ''
      }
    }
  }
  changeAction(fieldname, e) {
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    })
  }
  okAction() {
    if(this.props.id) {
      $.put(`/good/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/good/create`, this.state.fields).then(res => {
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
    $.get(`/good/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: res.data
        })
      }
    })
  }

  componentWillMount() {
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    return (
      <Modal
        title="商品信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="商品名称">
            <Input value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)} style={{width: 250}} />
          </Item>
          <Item label="商品编号">
            <Input value={this.state.fields.number} placeholder="如果不填写系统会自动生成" onChange={(e) => this.changeAction('number', e)} style={{width: 250}} />
          </Item>
          <Item label="价格">
            <Input value={this.state.fields.price} onChange={(e) => this.changeAction('price', e)} style={{width: 250}} />
          </Item>
          <Item label="优惠券号">
            <Input value={this.state.fields.discount} onChange={(e) => this.changeAction('discount', e)} style={{width: 250}} />
          </Item>
        </Form>
      </Modal>
    )
  }
}