import React, {Component} from 'react';
import {Modal, Form, Icon, Input, Button, Select} from 'antd';
import _ from 'lodash';
import $ from '../ajax';
export default class UserModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        acount: '11111',
        password: '',
        statu: 1,
        role: 0
      }
    }
  }
  changeAction(fieldname, e) {
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    })
  }
  userDetailAction() {
    $.get(`/user/${this.props.uid}`).then(res => {
      if(res.code === 0) {
        const fields = _.assign({}, this.state.fields, res.data);
        this.setState({
          fields
        })
      }
    })
  }
  okAction() {

    this.props.onOk && this.props.onOk(this.state.fields);
  }
  componentWillMount() {
    this.props.uid && this.userDetailAction();

  }
  render() {
    console.log(this.state.fields)
    const {Item} = Form;
    const {Option} = Select;
    return (
      <Modal
        title="用户信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
        >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="账号">
            <Input value={this.state.fields.acount} onChange={(e) => this.changeAction('acount', e)} />
          </Item>
          <Item label="密码">
            <Input type="password" value={this.state.fields.password} onChange={(e) => this.changeAction('password', e)} />
          </Item>
          <Item label="角色">
            <Select value={this.state.fields.role} onChange={(e) => this.changeAction('role', e)}>
              <Option value={0} key={0} >普通角色</Option>
              <Option value={1} key={1} >测试角色</Option>
              <Option value={2} key={2} >开发角色</Option>
              <Option value={3} key={3} >超级管理员</Option>
            </Select>
          </Item>
          <Item label="状态">
            <Select value={this.state.fields.statu} onChange={(e) => this.changeAction('statu', e)}>
              <Option value={1} >正常</Option>
              <Option value={0} >异常</Option>
            </Select>
          </Item>
        </Form>
      </Modal>
    )
  }
}
