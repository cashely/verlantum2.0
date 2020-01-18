import React, {Component} from 'react';
import {Form, Input, Button, Icon, Radio, Modal, Select, message, Row, Col} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
import CostCategoryModel from './CostCategory';
export default class FruitModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: '',
        count: 0,
        mark: '',
      },
      costCategorys:[],
      visible: {
        costCategory: false
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
      $.put(`/costDetail/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/costDetail`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }
  }
  costCategorysAction() {
    $.get(`/costCategorys`).then(res => {
      if(res.code === 0) {
        this.setState({
          costCategorys: res.data
        })
      }
    })
  }
  detailAction() {
    $.get(`/costDetail/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: res.data
        })
      }
    })
  }

  cancelModelAction(modelName) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = false;
    this.setState({
      visible,
      id: null
    })
  }

  openModelAction(modelName, id = null) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = true;
    this.setState({
      visible,
      id
    })
  }

  okCostCategoryModalAction() {
    this.cancelModelAction('costCategory');
    this.costCategorysAction();
  }

  componentWillMount() {
    this.costCategorysAction();
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    const {Option} = Select;
    return (
      <Modal
        title="成本信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 6}} wrapperCol={{span: 18}}>
          <Item label="分类名称">
            <Row gutter={8}>
              <Col span={12}>
                <Select value={this.state.fields.title} onChange={(e) => this.changeAction('title', e)}>
                  {
                    this.state.costCategorys.map(costCategory => <Option value={costCategory._id} key={costCategory._id} >{costCategory.title}</Option>)
                  }
                </Select>
              </Col>
              <Col span={12}>
                <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('costCategory')}}><Icon type="plus"/>新增分类</Button>
              </Col>
          </Row>
          </Item>
          <Item label="金额">
            <Input value={this.state.fields.count} onChange={(e) => this.changeAction('count', e)} />
          </Item>
          <Item label="备注">
            <Input.TextArea value={this.state.fields.mark} onChange={(e) => this.changeAction('mark', e)} />
          </Item>
        </Form>
        {
          this.state.visible.costCategory && <CostCategoryModel visible={this.state.visible.costCategory} onOk={this.okCostCategoryModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'costCategory')}/>
        }
      </Modal>
    )
  }
}
