import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, InputNumber, Radio, DatePicker} from 'antd';
import _ from 'lodash';
import moment from 'moment';
export default class ExportModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        date: []
      }
    }
  }
  changeAction(e, field, type) {
    console.log(e)
    let value;
    switch(type) {
      default: value = e;
    }
    this.setState({
      fields: Object.assign({}, this.state.fields, {[field]: value})
    });
  }
  okAction() {
    const valid = this.validAction();
    if(!valid) {
      return;
    }
    window.open(`//${window.location.hostname}:6010/excel/${this.state.fields.date.map(d => moment(d).format('YYYY-MM-DD')).join('_')}.xls`);
    this.props.onOk();
  }

  validAction() {
    if(this.state.fields.date.length < 2) {
      message.error('时间段必须填写');
      return false;
    }
    return true;
  }

  render() {
    const {Item} = Form;
    return (
      <Modal
        title="导出"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onOk}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="时间段">
            <DatePicker.RangePicker format="YYYY-MM-DD" value={this.state.fields.date} onChange={e => this.changeAction(e, 'date', 'DATE')} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
