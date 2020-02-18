import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload, Form } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import ArgDetailModel from '../components/models/ArgDetail';

export default class Arg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      args: [],
      id: null,
      visible: {
        arg: false
      },
      conditions: {
      }
    }
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

  okCostDetailModalAction() {
    this.cancelModelAction('arg');
    this.listAction();
  }

  listAction() {
    $.get('/arg/list', {...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.setState({
          args: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/arg/total', this.state.conditions).then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  conditionsChangeAction(e, field, type) {
    let value;
    switch(type) {
      default: value = e;
    }
    this.setState({
      conditions: Object.assign({}, this.state.conditions, {[field]: value})
    });
  }

  searchAction() {
    this.setState({
      page: 1
    }, this.listAction);
  }

  pageChangeAction(page, pageSize) {
    this.setState({
      page
    }, this.listAction);
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '变量名称',
        dataIndex: 'title'
      },
      {
        title: '变量值',
        dataIndex: 'value'
      },
      {
        title: '备注',
        dataIndex: 'mark'
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '操作',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('arg', row._id)}} size="small"><Icon type="edit"/></Button>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Button type="primary" onClick={this.openModelAction.bind(this, 'arg', null)}><Icon type="plus"/>新增变量</Button>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.args} size="middle" bordered pagination={false}/>
            {
              this.state.visible.arg && <ArgDetailModel id={this.state.id} visible={this.state.visible.arg} onOk={this.okCostDetailModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'arg')}/>
            }
        </Content>
      </Layout>
    )
  }
}
