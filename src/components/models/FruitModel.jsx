import React, {Component} from 'react';
import {Form, Input, Button, Icon, Radio, Modal, Select, message} from 'antd';
import $ from '../../ajax';
export default class FruitModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: '',
        unit: '',
        min: 1000, // 仓库最小报警数量
        warn: 2,
        total: 0,
        mark: ''
      },
      units:[]
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
      $.put(`/fruit/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/fruit`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }
  }
  unitsAction() {
    $.get(`/units`).then(res => {
      if(res.code === 0) {
        this.setState({
          units: res.data
        })
      }
    })
  }
  detailAction() {
    $.get(`/fruit/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: res.data
        })
      }
    })
  }
  componentWillMount() {
    this.unitsAction();
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    const {Option} = Select;
    return (
      <Modal
        title="水果信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 6}} wrapperCol={{span: 18}}>
          <Item label="水果名称">
            <Input value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)} />
          </Item>
          <Item label="单位">
            <Select value={this.state.fields.unit} onChange={(e) => this.changeAction('unit', e)}>
              {
                this.state.units.map(unit => <Option value={unit._id} key={unit._id} >{unit.title}</Option>)
              }
            </Select>
          </Item>
          <Item label="存量">
            <Input value={this.state.fields.total} onChange={(e) => this.changeAction('total', e)} />
          </Item>
          <Item label="仓库最小储存量">
            <Input value={this.state.fields.min} onChange={(e) => this.changeAction('min', e)} />
          </Item>
          <Item label="是否弹窗警告">
            <Radio.Group
              value={this.state.fields.warn}
              onChange={(e) => this.changeAction('warn', e.target.value)}
              options={[{label: '是', value: 1}, {label: '否', value: 2}]}
            />
          </Item>
          <Item label="备注">
            <Input.TextArea value={this.state.fields.mark} onChange={(e) => this.changeAction('mark', e)} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
