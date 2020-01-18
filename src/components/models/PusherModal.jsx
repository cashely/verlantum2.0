import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, InputNumber, Radio} from 'antd';
import $ from '../../ajax';
export default class PusherModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: '',
        address:'',
        tel: '',
        contact: '',
        mark: ''
      }
    }
  }
  changeAction(fieldname, e) {
    if(!e) return;
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    })
  }
  okAction() {
    if(this.props.id) {
      $.put(`/pusher/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/pusher`, this.state.fields).then(res => {
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
    $.get(`/pusher/${this.props.id}`).then(res => {
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
    const {Option} = Select;
    return (
      <Modal
        title="出货商信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="出货商名称">
            <Input value={this.state.fields.title} onChange={(e) => {this.changeAction('title', e)}} />
          </Item>
          <Item label="联系人">
            <Input value={this.state.fields.contact} onChange={(e) => {this.changeAction('contact', e)}} />
          </Item>
          <Item label="联系电话">
            <Input value={this.state.fields.tel} onChange={(e) => {this.changeAction('tel', e)}} />
          </Item>
          <Item label="地址">
            <Input value={this.state.fields.address} onChange={(e) => {this.changeAction('address', e)}} />
          </Item>
          <Item label="备注">
            <Input.TextArea value={this.state.fields.mark} onChange={(e) => {this.changeAction('mark', e)}} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
