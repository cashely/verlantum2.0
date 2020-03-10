import React, {Component} from 'react';
import {Form, Input, Button, Icon, Radio, Modal, Select, message, Row, Col} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class AuthModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: '',
        path: '',
        role: 0,
        method: ''
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
      $.put(`/auth/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/auth/create`, this.state.fields).then(res => {
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
    $.get(`/auth/${this.props.id}`).then(res => {
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
        title="权限节点"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 6}} wrapperCol={{span: 18}}>
          <Item label="权限地址">
            <Input value={this.state.fields.path} onChange={(e) => this.changeAction('path', e)} />
          </Item>
          <Item label="方法">
            <Select value={this.state.fields.method} onChange={(e) => this.changeAction('method', e)}>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELTE</Option>
            </Select>
          </Item>
          <Item label="权限名称">
            <Input.TextArea value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)} />
          </Item>
          <Item label="角色">
            <Select value={this.state.fields.role} onChange={(e) => this.changeAction('role', e)}>
              <Option value={0}>普通角色</Option>
              <Option value={3}>超级管理员</Option>
            </Select>
          </Item>
        </Form>
      </Modal>
    )
  }
}
