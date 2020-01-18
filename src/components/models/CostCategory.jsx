import React, {Component} from 'react';
import {Form, Input, Button, Icon, Radio, Modal, Select, message} from 'antd';
import $ from '../../ajax';
export default class CostCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: ''
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
      $.put(`/costCategory/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/costCategory`, this.state.fields).then(res => {
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
    $.get(`/costCategory/${this.props.id}`).then(res => {
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
        title="成本分类"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 6}} wrapperCol={{span: 18}}>
          <Item label="分类名称">
            <Input value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
