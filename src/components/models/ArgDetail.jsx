import React, {Component} from 'react';
import {Form, Input, Button, Icon, Radio, Modal, Select, message, Row, Col} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class ArgDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: '',
        value: '',
        mark: ''
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
      $.put(`/arg/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/arg/create`, this.state.fields).then(res => {
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
    $.get(`/arg/${this.props.id}`).then(res => {
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
        title="系统变量"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 6}} wrapperCol={{span: 18}}>
          <Item label="变量名称">
            <Input value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)} />
          </Item>
          <Item label="变量值">
            <Input value={this.state.fields.value} onChange={(e) => this.changeAction('value', e)} />
          </Item>
          <Item label="备注">
            <Input.TextArea value={this.state.fields.mark} onChange={(e) => this.changeAction('mark', e)} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
