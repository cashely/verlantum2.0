import React, {Component} from 'react'
import {Layout, Form, Icon, Input, Button, message} from 'antd'
import $ from '../ajax'
import Particleground from 'Particleground.js';
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
  submitAction() {
    console.log(this.props.form.getFieldsValue())
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
  componentDidMount() {
    this.setState({
      particle: new Particleground.particle('#demo')
    });
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
          <span style={{color: '#fff', backgroundColor: '#000', fontSize: 24, borderRadius: 5, width: 56, height: 26, fontWeight: 600, lineHeight: 1, textAlign: 'center', marginRight: 5}}>FSS</span>水果管理系统
        </div>
        <Form style={{width: '300px'}} labelCol = {{span: 6}} wrapperCol = {{span: 14}}>
          <Form.Item label="用户名">
            {
              getFieldDecorator('acount', {})(
                <Input
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
            <Button block type="primary" onClick={this.submitAction.bind(this)}>提交</Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}
