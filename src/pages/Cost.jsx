import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload, Form } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import CostDetailModel from '../components/models/CostDetail';

export default class Cost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      costDetails: [],
      total: 0,
      page: 1,
      limit: 50,
      id: null,
      visible: {
        costDetail: false
      },
      conditions: {
        date: []
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
    this.cancelModelAction('costDetail');
    this.listAction();
  }

  listAction() {
    $.get('/costDetails', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          costDetails: res.data.concat({
            title: {
              title: '统计'
            },
            count: res.data.reduce( (a, b) => a + b.count, 0)
          })
        })
      }
    })
  }

  countListAction() {
    $.get('/costDetails/total', this.state.conditions).then(res => {
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
        title: '分类名称',
        dataIndex: 'title.title',
        render: (value, row, index) => {
          if(index === this.state.costDetails.length - 1) {
            return <b>{value}</b>
          } else {
            return value
          }
        }
      },
      {
        title: '金额',
        dataIndex: 'count',
        render: (value, row, index) => {
          if(index === this.state.costDetails.length - 1) {
            return {
              children: <b>{value}</b>,
              props: {
                colSpan: 3
              }
            }
          } else {
            return value
          }
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: (value, row, index) => {
          if(index === this.state.costDetails.length - 1) {
            return {
              props: {
                colSpan: 0
              }
            }
          } else {
            return m(value).format('YYYY-MM-DD')
          }
        }
      },
      {
        title: '操作',
        align: 'center',
        render: (value, row, index) => {
          if(index === this.state.costDetails.length - 1) {
            return {
              props: {
                colSpan: 0
              }
            }
          } else {
            return (
              <React.Fragment>
                <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('costDetail', row._id)}} size="small"><Icon type="edit"/></Button>
              </React.Fragment>
            )
          }
        }
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Form layout="inline">
            <Form.Item>
              <Button type="primary" onClick={this.openModelAction.bind(this, 'costDetail', null)}><Icon type="plus"/>新增成本</Button>
            </Form.Item>
            <Form.Item label="时间">
              <DatePicker.RangePicker format="YYYY-MM-DD" value={this.state.conditions.date} onChange={e => this.conditionsChangeAction(e, 'date', 'DATE')} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.searchAction.bind(this)}>搜索</Button>
            </Form.Item>
          </Form>
      </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.costDetails} size="middle" bordered pagination={false}/>
            {
              this.state.visible.costDetail && <CostDetailModel id={this.state.id} visible={this.state.visible.costDetail} onOk={this.okCostDetailModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'costDetail')}/>
            }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.limit} current={this.state.page} onChange={this.pageChangeAction.bind(this)}/>
        </Footer>
      </Layout>
    )
  }
}

let dataSources = []

for(var a = 0; a < 20; a++) {
  dataSources.push({
    id: a,
    title: `测试用例${a+1}`,
    total: 50,
    successed: 20,
    failed: 20,
    undo: 10,
    creater: '张三',
    runtime: '2013-01-01',
    created: '2013-01-02'
  })
}
