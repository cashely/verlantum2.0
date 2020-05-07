import React, {Component, createRef} from 'react'
import {Layout, Form, Icon, Input, Button, message} from 'antd'

import $ from '../ajax'
import Particleground from 'Particleground.js';
import { validator } from '../functions';
// const api = {}
class Template extends Component {
  constructor(props) {
    super(props);
    this.state =  {
      date: new Date(),
      particle: null
    }
  }
  render() {
    const InitForm = Form.create({ name: 'login' })(LoginForm);
    return (
      <Layout style={{height: '100%', alignItems: 'center', justifyContent: 'center'}}>
        <InitForm {...this.props}></InitForm>
      </Layout>
    )
  }
}

export default class Login extends Template {
  componentDidMount() {

  }
}


class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.loginForm = createRef();
  }
  submitAction() {
    $.post('/login', this.props.form.getFieldsValue()).then(res => {
      console.log(res)
      if(res.code === 0) {
        message.success('登录成功')
        setTimeout(() => {
            this.props.history.push('/index');
        }, 1000)
      }else {
        message.error(res.data)
      }
    })
  }
  validAction() {
    const rules = {
      acount: [
        {
          required: true,
          message: '账号字段不能为空'
        }
      ],
      password: {
        required: true
      }
    };
    validator(rules)(this.props.form.getFieldsValue()).then(() => {
      this.submitAction()
    })
  }
  componentDidMount() {
    this.setState({
      particle: new Particleground.particle('#demo')
    });
    console.log(this.loginForm)
  }

  componentWillUnmount() {
    // this.state.particle.destory();
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div>
        <div id="demo" style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}></div>
        <div style={{textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30, lineHeight: '24px', fontSize: '24px'}}>
          <span style={{color: '#fff', backgroundColor: '#000', fontSize: 24, borderRadius: 5, width: 120, height: 26, fontWeight: 600, lineHeight: 1, textAlign: 'center', marginRight: 5}}>Verlantum</span>云量科技后台管理系统
        </div>
        <Form ref={this.loginForm} style={{width: '300px'}} labelCol = {{span: 6}} wrapperCol = {{span: 14}}>
          <Form.Item label="用户名">
            {
              getFieldDecorator('acount', {})(
                <Input
                  rules={[{required: true, message: 'Please input your note!' }]}
                  prefix={<Icon type="user"/>}
                  placeholder="用户名">
                </Input>
              )
            }
          </Form.Item>
          <Form.Item label="密码">
            {
              getFieldDecorator('password', {})(
                <Input
                  prefix={<Icon type="lock"/>}
                  type="password"
                  placeholder="密码">
                </Input>
              )
            }
          </Form.Item>
          <Form.Item wrapperCol = {{span: 14, offset: 6}}>
            <Button block type="primary" onClick={this.validAction.bind(this)}>提交</Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}
