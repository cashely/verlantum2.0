import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select} from 'antd';
import _ from 'lodash';
import $ from '../ajax';
export default class Case extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: '',
        tester: '',
        developer: '',
        mark: ''
      },
      users: []
    }
  }
  changeAction(fieldname, e) {
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    })
  }
  caseDetailAction() {
    $.get(`/case/${this.props.cid}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: _.assign({}, this.state.fields, res.data)
        })
      }
    })
  }

  usersAction() {
    $.get('/users').then(res => {
      if(res.code === 0) {
        this.setState({
          users: res.data
        })
      }
    })
  }
  okAction() {
    console.log(this.state.fields);
    this.props.onOk && this.props.onOk(this.state.fields);
  }



  componentWillMount() {
    this.props.cid && this.caseDetailAction();
    this.usersAction();
  }
  render() {
    const {Item} = Form;
    const {Option} = Select;
    return (
      <Modal
        title="添加用例"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
        >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="用例名称">
            <Input value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)} />
          </Item>
          <Item label="测试员">
            <Select value={this.state.fields.tester} onChange={(e) => this.changeAction('tester', e)}>
              {
                this.state.users.map(user => <Option value={user._id} key={user._id} >{user.acount}</Option>)
              }
            </Select>
          </Item>
          <Item label="开发员">
            <Select value={this.state.fields.developer} onChange={(e) => this.changeAction('developer', e)}>
              {
                this.state.users.map(user => <Option value={user._id} key={user._id} >{user.acount}</Option>)
              }
            </Select>
          </Item>
          <Item label="备注">
            <Input.TextArea value={this.state.fields.mark} onChange={(e) => this.changeAction('mark', e)} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
