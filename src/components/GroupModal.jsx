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
        system: '',
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
  groupDetailAction() {
    $.get(`/group/${this.props.gid}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: _.assign({}, this.state.fields, res.data)
        })
      }
    })
  }
  okAction() {
    console.log(this.state.fields);
    this.props.onOk && this.props.onOk(this.state.fields);
  }



  componentWillMount() {
    this.props.gid && this.groupDetailAction();
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
          <Item label="用例集名称">
            <Input value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)} />
          </Item>
          <Item label="所属系统">
            <Input value={this.state.fields.system} onChange={(e) => this.changeAction('system', e)} />
          </Item>
          <Item label="备注">
            <Input.TextArea value={this.state.fields.mark} onChange={(e) => this.changeAction('mark', e)} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
